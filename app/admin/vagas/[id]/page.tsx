import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/app-shell"
import { CandidaturaStatusForm } from "@/components/app/candidatura-status-form"
import { ConfirmSubmit, SubmitButton } from "@/components/app/confirm-submit"
import { btnClass, ButtonLink, Card, EmptyState, Flash, StatusBadge } from "@/components/app/ui"
import { VagaForm } from "@/components/app/vaga-form"
import { inputClass } from "@/components/forms/fields"
import { editarVagaAdmin, indicarCandidato, setVagaStatus } from "@/app/admin/actions"
import { requireRole } from "@/lib/auth"
import { VAGA_COLS, type Vaga } from "@/lib/data"
import { getPublicConfig } from "@/lib/public-config"
import { getServerSupabase } from "@/lib/supabase/server"

const erros: Record<string, string> = {
  "empresa-pendente": "Aprove a empresa antes de abrir a vaga.",
  "ja-inscrito": "Esse candidato já está nesta vaga.",
  dados: "Preencha título e área.",
}

export default async function AdminVaga({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string; busca?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const db = await getServerSupabase()
  const [, { data: vaga }, { data: inscritos }, { areas }] = await Promise.all([
    requireRole("admin"),
    db.from("vagas").select(`${VAGA_COLS}, empresas(nome, status)`).eq("id", id).maybeSingle(),
    db.from("candidaturas").select("id, status, indicada_por_admin, created_at, candidatos(id, nome, area_principal, whatsapp)").eq("vaga_id", id).order("created_at"),
    getPublicConfig(),
  ])
  if (!vaga) notFound()
  const v = vaga as unknown as Vaga & { empresas: { nome: string; status: string } | null }
  const { data: sugestoes } = sp.busca
    ? await db.from("candidatos").select("id, nome, area_principal, cidade").ilike("nome", `%${sp.busca.replace(/[%_,()]/g, "")}%`).limit(8)
    : await db.from("candidatos").select("id, nome, area_principal, cidade").eq("area_principal", v.area).eq("status", "ativo").limit(8)
  type Insc = { id: string; status: string; indicada_por_admin: boolean; candidatos: { id: string; nome: string; area_principal: string; whatsapp: string } | null }
  const lista = (inscritos ?? []) as unknown as Insc[]
  const jaInscritos = new Set(lista.map((i) => i.candidatos?.id))
  const back = `/admin/vagas/${id}/`

  return (
    <>
      {sp.ok && <Flash>Feito.</Flash>}
      {sp.erro && <Flash tone="error">{erros[sp.erro] ?? "Não foi possível concluir."}</Flash>}
      <PageHeader
        title={v.titulo}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {v.empresas?.nome} · {v.area} <StatusBadge status={v.status} />
            {v.empresas?.status !== "aprovada" && <span className="text-amber-deep text-sm font-semibold">empresa {v.empresas?.status}</span>}
          </span>
        }
        actions={
          <>
            {v.status !== "aberta" && (
              <form action={setVagaStatus}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="status" value="aberta" />
                <input type="hidden" name="back" value={back} />
                <SubmitButton pendingLabel="Abrindo…">{v.status === "pendente" ? "Aprovar vaga" : "Reabrir"}</SubmitButton>
              </form>
            )}
            {v.status !== "encerrada" && (
              <form action={setVagaStatus}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="status" value="encerrada" />
                <input type="hidden" name="back" value={back} />
                <ConfirmSubmit label="Encerrar" tone="outline" title="Encerrar esta vaga?" text="Ela some da lista de vagas dos candidatos." confirmLabel="Sim, encerrar" />
              </form>
            )}
            <ButtonLink href="/admin/vagas/" tone="outline">← Vagas</ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card id="inscritos" className="scroll-mt-24">
          <h2 className="text-ink text-xl font-semibold">Inscritos ({lista.length})</h2>
          {lista.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="Ninguém inscrito ainda" text="Você pode indicar um candidato ao lado." />
            </div>
          ) : (
            <ul className="divide-line mt-3 divide-y">
              {lista.map((i) => (
                <li key={i.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <Link href={`/admin/candidatos/${i.candidatos?.id}/`} className="text-ink inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">
                      {i.candidatos?.nome}
                    </Link>
                    <p className="text-ink-soft text-sm">
                      {i.candidatos?.area_principal}
                      {i.indicada_por_admin ? " · indicado pela YL" : ""}
                    </p>
                  </div>
                  <div className="sm:w-64">
                    <CandidaturaStatusForm id={i.id} status={i.status} back={back} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-ink text-xl font-semibold">Indicar um candidato</h2>
          <form className="mt-3 flex gap-2" role="search">
            <label htmlFor="busca" className="sr-only">Buscar candidato</label>
            <input id="busca" name="busca" defaultValue={sp.busca ?? ""} placeholder="Buscar por nome" className={inputClass} />
            <button className={btnClass("admin", "h-12")}>Buscar</button>
          </form>
          <p className="text-ink-soft mt-2 text-sm">{sp.busca ? "Resultados da busca" : `Sugestões: candidatos ativos de ${v.area}`}</p>
          <ul className="divide-line mt-2 divide-y">
            {(sugestoes ?? []).filter((c) => !jaInscritos.has(c.id)).length === 0 && <li className="text-ink-soft py-3">Nenhum candidato para indicar.</li>}
            {(sugestoes ?? [])
              .filter((c) => !jaInscritos.has(c.id))
              .map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="text-ink truncate font-medium">{c.nome}</p>
                    <p className="text-ink-soft truncate text-sm">
                      {c.area_principal} · {c.cidade}
                    </p>
                  </div>
                  <form action={indicarCandidato}>
                    <input type="hidden" name="vaga_id" value={v.id} />
                    <input type="hidden" name="candidato_id" value={c.id} />
                    <SubmitButton tone="outline" pendingLabel="…">Indicar</SubmitButton>
                  </form>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      <h2 className="text-ink mt-10 mb-4 text-2xl font-semibold">Editar vaga</h2>
      <Card className="max-w-3xl">
        <VagaForm action={editarVagaAdmin} areas={areas} vaga={v} submitLabel="Salvar vaga" tone="admin" />
      </Card>
    </>
  )
}
