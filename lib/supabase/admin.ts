import "server-only"

import { createClient } from "@supabase/supabase-js"

import { SUPABASE_URL } from "./env"

/**
 * Cliente com a service role key: ignora a RLS. Use SÓ no servidor, depois de
 * conferir o papel de quem está pedindo (ex.: excluir conta, painel admin).
 */
export function getServiceSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  if (!SUPABASE_URL || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada")
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
