import "server-only"

import { getServerSupabase } from "@/lib/supabase/server"

export type CandFiltro = { q?: string; area?: string; bairro?: string; status?: string; nota?: string; pretensao?: string }

export type CandRow = {
  id: string
  nome: string
  email: string
  cidade: string
  area_principal: string
  outras_areas: string[]
  pretensao_salarial: number | null
  turnos: string[]
  experiencias: { empresa: string; funcao: string; tempo: string }[]
  status: string
  created_at: string
  consentimento_lgpd_em: string
  respostas_prova: { nota: number; provas: { area: string } | null }[]
}

const clean = (v: string) => v.replace(/[%_,()]/g, "")

/** Busca candidatos com os filtros do painel (o admin enxerga todos via RLS). */
export async function buscarCandidatos(f: CandFiltro, limit = 1000) {
  const db = await getServerSupabase()
  let q = db
    .from("candidatos")
    .select("id, nome, email, cidade, area_principal, outras_areas, pretensao_salarial, turnos, experiencias, status, created_at, consentimento_lgpd_em, respostas_prova(nota, provas(area))")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (f.q) q = q.ilike("nome", `%${clean(f.q)}%`)
  if (f.area) q = q.eq("area_principal", f.area)
  if (f.bairro) q = q.ilike("cidade", `%${clean(f.bairro)}%`)
  if (f.status) q = q.eq("status", f.status)
  if (f.pretensao) q = q.lte("pretensao_salarial", Number(f.pretensao))
  const { data } = await q
  let rows = (data ?? []) as unknown as CandRow[]
  if (f.nota) {
    const min = Number(f.nota)
    rows = rows.filter((r) => melhorNota(r) !== null && melhorNota(r)! >= min)
  }
  return rows
}

export function melhorNota(r: CandRow) {
  const notas = r.respostas_prova.map((x) => Number(x.nota))
  return notas.length ? Math.max(...notas) : null
}
