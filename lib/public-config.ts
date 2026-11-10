import "server-only"

import { cache } from "react"
import { createClient } from "@supabase/supabase-js"

import { siteConfig } from "@/lib/site-config"
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env"

export type PublicConfig = {
  areas: string[]
  email: string
  phone: string
  address: string
  stats: { candidatos: number; vagas: number; contratacoes: number; empresas: number } | null
}

const fallback: PublicConfig = {
  areas: [...siteConfig.areas],
  email: siteConfig.email,
  phone: siteConfig.phone,
  address: siteConfig.address,
  stats: null,
}

/**
 * Configurações editáveis pelo admin (áreas, contatos, seção de números).
 * Lidas com a chave pública; sem Supabase configurado, usa lib/site-config.ts.
 */
export const getPublicConfig = cache(async (): Promise<PublicConfig> => {
  if (!isSupabaseConfigured) return fallback
  try {
    const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
    const [{ data: cfg }, { data: stats }] = await Promise.all([
      db.from("configuracoes").select("areas, email, telefone, endereco").eq("id", 1).maybeSingle(),
      db.rpc("public_stats"),
    ])
    if (!cfg) return fallback
    return {
      areas: cfg.areas?.length ? cfg.areas : fallback.areas,
      email: cfg.email || fallback.email,
      phone: cfg.telefone ?? "",
      address: cfg.endereco ?? "",
      stats: (stats as PublicConfig["stats"]) ?? null,
    }
  } catch {
    return fallback
  }
})
