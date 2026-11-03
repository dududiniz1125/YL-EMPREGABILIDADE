import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"

import { roleHome, safeNext, type Role } from "@/lib/roles"
import { getServerSupabase } from "@/lib/supabase/server"

/**
 * Destino dos links enviados por e-mail (confirmação de cadastro e
 * redefinição de senha). Aceita token_hash (modelo de e-mail da YL) e code (PKCE).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type") as EmailOtpType | null
  const code = url.searchParams.get("code")
  const next = safeNext(url.searchParams.get("next"))
  const supabase = await getServerSupabase()

  let ok = false
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    ok = !error
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    ok = !error
  }

  if (!ok) return NextResponse.redirect(new URL("/entrar/?erro=link-invalido", request.url))

  if (type === "recovery" || next === "/redefinir-senha/") {
    return NextResponse.redirect(new URL("/redefinir-senha/", request.url))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null }
  const role = profile?.role as Role | undefined
  const dest = next ?? (role ? `${roleHome[role]}/?bemvindo=1` : "/entrar/?ok=confirmado")
  return NextResponse.redirect(new URL(dest, request.url))
}
