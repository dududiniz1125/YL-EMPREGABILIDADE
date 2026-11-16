import "server-only"

import { cache } from "react"
import { createClient } from "@supabase/supabase-js"

import { CATEGORIAS_PADRAO, flattenAreas, OUTRA, type Categoria } from "@/lib/areas"
import { siteConfig } from "@/lib/site-config"
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env"

export type PublicConfig = {
  /** lista simples, com "Outra" no fim */
  areas: string[]
  /** as mesmas áreas agrupadas por categoria */
  categorias: Categoria[]
  email: string
  phone: string
  address: string
  stats: { candidatos: number; vagas: number; contratacoes: number; empresas: number } | null
}

const fallback: PublicConfig = {
  areas: flattenAreas(CATEGORIAS_PADRAO),
  categorias: CATEGORIAS_PADRAO,
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
      // "*" de propósito: funciona antes e depois da coluna areas_por_categoria existir
      db.from("configuracoes").select("*").eq("id", 1).maybeSingle(),
      db.rpc("public_stats"),
    ])
    if (!cfg) return fallback
    const categorias = montarCategorias(cfg.areas_por_categoria, cfg.areas)
    return {
      areas: flattenAreas(categorias),
      categorias,
      email: cfg.email || fallback.email,
      phone: cfg.telefone ?? "",
      address: cfg.endereco ?? "",
      stats: (stats as PublicConfig["stats"]) ?? null,
    }
  } catch {
    return fallback
  }
})

/** Usa as categorias do banco; se ainda não houver, agrupa a lista simples antiga. */
function montarCategorias(porCategoria: unknown, simples: string[] | null | undefined): Categoria[] {
  if (Array.isArray(porCategoria) && porCategoria.length) {
    const cats = (porCategoria as Categoria[]).filter((c) => c?.nome && Array.isArray(c.areas) && c.areas.length)
    if (cats.length) {
      return cats.some((c) => c.areas.includes(OUTRA)) ? cats : [...cats, { nome: "Outra", areas: [OUTRA] }]
    }
  }
  const lista = (simples ?? []).filter((a) => a !== OUTRA)
  if (!lista.length) return CATEGORIAS_PADRAO
  return [{ nome: "Funções", areas: lista }, { nome: "Outra", areas: [OUTRA] }]
}
