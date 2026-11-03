import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"

import { roleHome, type Role } from "@/lib/roles"
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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nome, must_change_password")
    .eq("id", user.id)
    .maybeSingle()
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
