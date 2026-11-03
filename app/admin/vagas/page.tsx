import Link from "next/link"

import { PageHeader } from "@/components/app/app-shell"
import { SubmitButton } from "@/components/app/confirm-submit"
import { FilterTabs } from "@/components/app/filter-tabs"
import { Card, EmptyState, Flash, StatusBadge } from "@/components/app/ui"
import { setVagaStatus } from "@/app/admin/actions"
import { requireRole } from "@/lib/auth"
import { formatBRL, formatDate } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"

export default async function AdminVagas({ searchParams }: { searchParams: Promise<{ status?: string; empresa?: string; ok?: string; erro?: string }> }) {
  const sp = await searchParams
  await requireRole("admin")
  let q = (await getServerSupabase())
    .from("vagas")
    .select("id, titulo, area, status, salario, bairro, created_at, empresa_id, empresas(nome, status), candidaturas(count)")
    .order("created_at", { ascending: false })
  if (sp.status) q = q.eq("status", sp.status)
  if (sp.empresa) q = q.eq("empresa_id", sp.empresa)
  const { data } = await q
  type Row = { id: string; titulo: string; area: string; status: string; salario: number | null; bairro: string | null; created_at: string; empresas: { nome: string; status: string } | null; candidaturas: { count: number }[] }
  const rows = (data ?? []) as unknown as Row[]
  const extra = sp.empresa ? `&empresa=${sp.empresa}` : ""
  const back = `/admin/vagas/?${sp.status ? `status=${sp.status}` : ""}${extra}`

  return (
    <>
      {sp.ok && <Flash>Vaga atualizada.</Flash>}
      {sp.erro === "empresa-pendente" && <Flash tone="error">Aprove a empresa antes de abrir a vaga.</Flash>}
      <PageHeader title="Vagas" description={sp.empresa && rows[0]?.empresas ? `Vagas de ${rows[0].empresas.nome}` : "Aprove, edite e encerre vagas."} />
      <FilterTabs base="/admin/vagas/" current={sp.status} extra={extra} options={[["", "Todas"], ["pendente", "Pendentes"], ["aberta", "Abertas"], ["encerrada", "Encerradas"]]} />
      {rows.length === 0 ? (
        <EmptyState title="Nenhuma vaga aqui" />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {rows.map((v) => (
            <li key={v.id}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-seed text-sm font-semibold">{v.empresas?.nome}</p>
                    <Link href={`/admin/vagas/${v.id}/`} className="text-ink text-xl font-semibold break-words underline-offset-4 hover:underline">
                      {v.titulo}
                    </Link>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
                <p className="text-ink-soft mt-2 text-sm">
                  {v.area} · {v.salario ? formatBRL(v.salario) : "salário a combinar"}
                  {v.bairro ? ` · ${v.bairro}` : ""} · {formatDate(v.created_at)}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  <Link href={`/admin/vagas/${v.id}/`} className="border-line inline-flex min-h-11 items-center rounded-full border bg-white px-4 font-semibold">
                    Inscritos ({v.candidaturas?.[0]?.count ?? 0}) e edição
                  </Link>
                  {v.status === "pendente" && (
                    <form action={setVagaStatus}>
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="status" value="aberta" />
                      <input type="hidden" name="back" value={back} />
                      <SubmitButton pendingLabel="Aprovando…">Aprovar</SubmitButton>
                    </form>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
