/**
 * Gera supabase/migrations/…0600_areas_categorias.sql a partir de lib/areas.ts,
 * em partes pequenas (cada uma cabe num "copiar" do celular/iPad).
 *   node --import tsx scripts/gerar-sql-areas.ts
 */
import { writeFileSync } from "node:fs"

import { CATEGORIAS_PADRAO, type Categoria } from "../lib/areas"

const LIMITE = 450
const DQ = "$" + "$" // delimitador de texto do Postgres
const partes: string[] = []

partes.push(`-- Parte 1: coluna nova com as áreas agrupadas por categoria
alter table public.configuracoes
  add column if not exists areas_por_categoria jsonb not null default '[]'::jsonb;
update public.configuracoes set areas_por_categoria = '[]'::jsonb where id = 1;`)

let grupo: Categoria[] = []
const flush = () => {
  if (!grupo.length) return
  const json = JSON.stringify(grupo)
  partes.push(
    `-- Parte ${partes.length + 1}: ${grupo.map((g) => g.nome).join(", ")}\n` +
      `update public.configuracoes\n` +
      `  set areas_por_categoria = areas_por_categoria || ${DQ}${json}${DQ}::jsonb\n` +
      `  where id = 1;`
  )
  grupo = []
}
for (const c of CATEGORIAS_PADRAO) {
  if (JSON.stringify([...grupo, c]).length > LIMITE) flush()
  grupo.push(c)
}
flush()

partes.push(`-- Parte ${partes.length + 1}: lista simples (usada nas provas e filtros), com "Outra" no fim
update public.configuracoes c
  set areas = (
    select array_agg(a order by o1, o2)
    from jsonb_array_elements(c.areas_por_categoria) with ordinality as cat(v, o1),
         jsonb_array_elements_text(cat.v -> 'areas') with ordinality as ar(a, o2)
  ),
  updated_at = now()
  where id = 1;`)

const sql =
  `-- Áreas de todas as categorias de emprego (não só restaurantes).\n` +
  `-- Gerado por scripts/gerar-sql-areas.ts. Rode as partes em ordem.\n\n` +
  partes.join("\n\n") +
  "\n"
writeFileSync("supabase/migrations/20261116000600_areas_categorias.sql", sql)
partes.forEach((p, i) => console.log(`parte ${i + 1}: ${p.length} caracteres`))
