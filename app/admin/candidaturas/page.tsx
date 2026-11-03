import Link from "next/link"

import { PageHeader } from "@/components/app/app-shell"
import { CandidaturaStatusForm } from "@/components/app/candidatura-status-form"
import { FilterTabs } from "@/components/app/filter-tabs"
import { Card, EmptyState, Flash, StatusBadge, statusLabel } from "@/components/app/ui"
import { requireRole } from "@/lib/auth"
import { formatDate } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"

const COLS = ["inscrito", "em_analise", "entrevista", "contratado", "nao_selecionado"] as const

export default async function AdminCandidaturas({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string }> }) {
  const sp = await searchParams
  let q = (await getServerSupabase())
    .from("candidaturas")
    .select("id, status, created_at, candidatos(id, nome), vagas(id, titulo, empresas(nome))")
    .order("updated_at", { ascending: false })
    .limit(500)
  if (sp.status) q = q.eq("status", sp.status)
  const [, { data }] = await Promise.all([requireRole("admin"), q])
  type Row = { id: string; status: string; created_at: string; candidatos: { id: string; nome: string } | null; vagas: { id: string; titulo: string; empresas: { nome: string } | null } | null }
  const rows = (data ?? []) as unknown as Row[]
  const back = `/admin/candidaturas/${sp.status ? `?status=${sp.status}` : ""}`

  const Item = ({ r, compact }: { r: Row; compact?: boolean }) => (
    <Card className={compact ? "p-3 sm:p-3" : "p-4 sm:p-4"}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/admin/candidatos/${r.candidatos?.id}/`} className="text-ink flex min-h-11 items-center truncate font-semibold underline-offset-4 hover:underline">
            {r.candidatos?.nome}
          </Link>
          <Link href={`/admin/vagas/${r.vagas?.id}/`} className="text-ink-soft flex min-h-11 items-center truncate text-sm hover:underline">
            {r.vagas?.titulo} · {r.vagas?.empresas?.nome}
          </Link>
        </div>
        {!compact && <StatusBadge status={r.status} />}
      </div>
      <p className="text-ink-soft mt-1 text-xs">Inscrição em {formatDate(r.created_at)}</p>
      <div className="mt-3">
        <CandidaturaStatusForm id={r.id} status={r.status} back={back} stacked={compact} />
      </div>
    </Card>
  )

  return (
    <>
      {sp.ok && <Flash>Status atualizado.</Flash>}
      <PageHeader title="Candidaturas" description="Acompanhe cada candidato em cada vaga." />
      <FilterTabs base="/admin/candidaturas/" current={sp.status} options={[["", "Todas"], ...COLS.map((c) => [c, statusLabel[c]] as [string, string])]} />
      {rows.length === 0 ? (
        <EmptyState title="Nenhuma candidatura aqui" />
      ) : (
        <>
          {/* lista (celular, ou quando há filtro) */}
          <ul className={`space-y-3 ${sp.status ? "" : "xl:hidden"}`}>
            {rows.map((r) => (
              <li key={r.id}>
                <Item r={r} />
              </li>
            ))}
          </ul>
          {/* kanban (desktop largo) */}
          {!sp.status && (
            <div className="hidden gap-3 xl:grid xl:grid-cols-5" aria-label="Quadro por status">
              {COLS.map((col) => {
                const items = rows.filter((r) => r.status === col)
                return (
                  <section key={col} aria-labelledby={`col-${col}`} className="bg-paper-dim/60 rounded-3xl p-3">
                    <h2 id={`col-${col}`} className="text-ink mb-3 flex items-center justify-between px-1 font-sans text-sm font-semibold">
                      {statusLabel[col]} <span className="text-ink-soft">{items.length}</span>
                    </h2>
                    <ul className="space-y-2">
                      {items.map((r) => (
                        <li key={r.id}>
                          <Item r={r} compact />
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}
