import { notFound } from "next/navigation"
import { Mail } from "lucide-react"

import { PageHeader } from "@/components/app/app-shell"
import { ConfirmSubmit } from "@/components/app/confirm-submit"
import { ButtonLink, Card, EmptyState, Flash, StatusBadge } from "@/components/app/ui"
import { VagaForm } from "@/components/app/vaga-form"
import { editarVaga, encerrarVaga, mudarStatusInscrito } from "@/app/empresa/actions"
import { requireRole } from "@/lib/auth"
import { VAGA_COLS, type Experiencia, type Vaga } from "@/lib/data"
import { mailtoHref } from "@/lib/site-config"
import { getPublicConfig } from "@/lib/public-config"
import { getServerSupabase } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

const ACOES = [
  { status: "em_analise", label: "Em análise" },
  { status: "entrevista", label: "Entrevista" },
  { status: "contratado", label: "Contratado" },
  { status: "nao_selecionado", label: "Não selecionado" },
] as const

const flash: Record<string, string> = { salva: "Vaga atualizada.", encerrada: "Vaga encerrada.", status: "Status do inscrito atualizado." }

export default async function VagaEmpresaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const supabase = await getServerSupabase()
  const [, { data: vaga }, { data: inscritos }, { areas }] = await Promise.all([
    requireRole("empresa"),
    supabase.from("vagas").select(VAGA_COLS).eq("id", id).maybeSingle(),
    supabase
      .from("inscritos_empresa")
      .select("candidatura_id, status, nome, area_principal, experiencias, nota_prova, email")
      .eq("vaga_id", id)
      .order("created_at"),
    getPublicConfig(),
  ])
  if (!vaga) notFound()
  const v = vaga as Vaga

  return (
    <>
      {sp.ok && <Flash>{flash[sp.ok] ?? "Feito."}</Flash>}
      {sp.erro && <Flash tone="error">Não foi possível salvar. Confira os campos e tente de novo.</Flash>}
      <PageHeader
        title={v.titulo}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {v.area} <StatusBadge status={v.status} />
          </span>
        }
        actions={<ButtonLink href="/empresa/" tone="outline">← Minhas vagas</ButtonLink>}
      />

      <section id="inscritos" aria-labelledby="inscritos-title" className="scroll-mt-24">
        <h2 id="inscritos-title" className="text-ink mb-4 text-2xl font-semibold">
          Inscritos ({inscritos?.length ?? 0})
        </h2>
        {!inscritos?.length ? (
          <EmptyState
            title={v.status === "aberta" ? "Ainda sem inscritos" : "A vaga ainda não está aberta"}
            text={v.status === "aberta" ? "Assim que alguém se candidatar, aparece aqui." : "Quando a YL aprovar a vaga, os candidatos poderão se inscrever."}
          />
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {inscritos.map((c) => {
              const exps = (c.experiencias ?? []) as Experiencia[]
              return (
                <li key={c.candidatura_id}>
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-ink text-lg font-semibold">{c.nome}</h3>
                        <p className="text-ink-soft text-sm">{c.area_principal}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-3">
                      <span className="text-ink-soft text-sm">Nota da prova: </span>
                      <strong className="text-ink">{c.nota_prova !== null ? Number(c.nota_prova).toLocaleString("pt-BR") : "não fez"}</strong>
                    </p>
                    {exps.length > 0 && (
                      <ul className="text-ink-soft mt-2 space-y-1 text-sm">
                        {exps.map((e, i) => (
                          <li key={i}>• {[e.funcao, e.empresa, e.tempo].filter(Boolean).join(" · ")}</li>
                        ))}
                      </ul>
                    )}
                    {c.email ? (
                      <a
                        href={mailtoHref(c.email, `Entrevista: ${v.titulo}`, `Olá, ${c.nome.split(" ")[0]}! Aqui é da vaga "${v.titulo}", via YL Empregabilidade.\n\n`)}
                        className="bg-sprout-soft text-sprout-deep mt-3 inline-flex max-w-full min-h-11 items-center gap-2 rounded-full px-4 font-semibold break-all"
                      >
                        <Mail className="size-4 shrink-0" aria-hidden /> {c.email}
                      </a>
                    ) : (
                      <p className="text-ink-soft mt-3 text-xs">O e-mail do candidato aparece quando você marcar “Entrevista”.</p>
                    )}
                    <form action={mudarStatusInscrito} className="mt-4 flex flex-wrap gap-2">
                      <input type="hidden" name="candidatura_id" value={c.candidatura_id} />
                      <input type="hidden" name="vaga_id" value={v.id} />
                      {ACOES.map((a) => (
                        <button
                          key={a.status}
                          name="status"
                          value={a.status}
                          disabled={c.status === a.status}
                          className={cn(
                            "min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors",
                            c.status === a.status ? "bg-seed border-seed text-white" : "border-line text-ink bg-white hover:bg-paper-dim"
                          )}
                        >
                          {a.label}
                        </button>
                      ))}
                    </form>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-10" aria-labelledby="editar-title">
        <h2 id="editar-title" className="text-ink mb-4 text-2xl font-semibold">Dados da vaga</h2>
        <Card className="max-w-3xl">
          {v.status === "encerrada" ? (
            <p className="text-ink-soft">Esta vaga está encerrada.</p>
          ) : (
            <>
              <VagaForm action={editarVaga} areas={areas} vaga={v} submitLabel="Salvar alterações" />
              <form action={encerrarVaga} className="border-line mt-6 border-t pt-6">
                <input type="hidden" name="id" value={v.id} />
                <ConfirmSubmit
                  label="Encerrar vaga"
                  tone="outline"
                  title="Encerrar esta vaga?"
                  text="Ela deixa de aparecer para os candidatos. Os inscritos continuam visíveis aqui."
                  confirmLabel="Sim, encerrar"
                />
              </form>
            </>
          )}
        </Card>
      </section>
    </>
  )
}
