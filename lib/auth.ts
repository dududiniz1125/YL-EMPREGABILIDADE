import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"

import { roleHome, type Role } from "@/lib/roles"
import { verifyAccessToken } from "@/lib/supabase/claims"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { getServerSupabase } from "@/lib/supabase/server"

export type Session = {
  userId: string
  email: string
  role: Role
  nome: string
  mustChangePassword: boolean
}

/** Usuário logado + papel (uma consulta por requisição). */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!isSupabaseConfigured) return null
  const supabase = await getServerSupabase()
  // id do usuário a partir do token (validado localmente) para já buscar o perfil...
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const claims = await verifyAccessToken(session?.access_token)
  const profileQuery = (id: string) =>
    supabase.from("profiles").select("role, nome, must_change_password").eq("id", id).maybeSingle()
  // ...em paralelo com a checagem completa no servidor de Auth (getUser)
  const [{ data: userData }, early] = await Promise.all([
    supabase.auth.getUser(),
    claims ? profileQuery(claims.sub) : Promise.resolve(null),
  ])
  const user = userData.user
  if (!user) return null
  const profile = early && claims?.sub === user.id ? early.data : (await profileQuery(user.id)).data
  if (!profile) return null
  return {
    userId: user.id,
    email: user.email ?? "",
    role: profile.role as Role,
    nome: profile.nome,
    mustChangePassword: profile.must_change_password,
  }
})

/**
 * Garante que quem está acessando tem o papel certo. Use em TODA página e
 * server action das áreas logadas (não basta esconder links).
 */
export async function requireRole(role: Role): Promise<Session> {
  const s = await getSession()
  if (!s) redirect(`/entrar/?next=${encodeURIComponent(roleHome[role])}`)
  if (s.role !== role) redirect(`/entrar/?erro=sem-permissao&next=${encodeURIComponent(roleHome[role])}`)
  return s
}

/** Para server actions: devolve a sessão ou lança erro (sem redirect). */
export async function assertRole(role: Role): Promise<Session> {
  const s = await getSession()
  if (!s || s.role !== role) throw new Error("Acesso negado")
  return s
}

/**
 * Id do usuário lido do token (validado localmente, sem ir à rede). Serve só
 * para começar as consultas em paralelo; a RLS e o requireRole() continuam
 * valendo para tudo.
 */
export const getUserIdFast = cache(async (): Promise<string | null> => {
  if (!isSupabaseConfigured) return null
  const supabase = await getServerSupabase()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return (await verifyAccessToken(session?.access_token))?.sub ?? null
})
