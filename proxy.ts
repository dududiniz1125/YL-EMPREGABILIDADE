import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

import { areaOf } from "@/lib/roles"
import { applyRemember, readRemember } from "@/lib/supabase/cookies"
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env"

/**
 * Renova a sessão do Supabase e protege /candidato, /empresa e /admin.
 * As páginas e server actions conferem o papel de novo no servidor.
 */
export async function proxy(request: NextRequest) {
  const area = areaOf(request.nextUrl.pathname)
  const toLogin = (erro?: string) => {
    const url = request.nextUrl.clone()
    url.pathname = "/entrar/"
    url.search = ""
    url.searchParams.set("next", request.nextUrl.pathname)
    if (erro) url.searchParams.set("erro", erro)
    return url
  }

  if (!isSupabaseConfigured) {
    return area ? NextResponse.redirect(toLogin()) : NextResponse.next()
  }

  let response = NextResponse.next({ request })
  const remember = readRemember((n) => request.cookies.get(n)?.value)
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, applyRemember(options, remember))
        )
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!area) return response

  const redirect = (url: URL) => {
    const r = NextResponse.redirect(url)
    response.cookies.getAll().forEach((c) => r.cookies.set(c))
    return r
  }

  if (!user) return redirect(toLogin())

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!profile || profile.role !== area) return redirect(toLogin("sem-permissao"))

  return response
}

export const config = {
  matcher: [
    "/candidato/:path*",
    "/empresa/:path*",
    "/admin/:path*",
    "/entrar/:path*",
    "/cadastro/:path*",
    "/redefinir-senha/:path*",
    "/minha-area/:path*",
  ],
}
