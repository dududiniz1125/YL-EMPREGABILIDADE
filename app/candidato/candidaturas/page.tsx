import { Check } from "lucide-react"

import { PageHeader } from "@/components/app/app-shell"
import { ButtonLink, Card, EmptyState, StatusBadge, statusLabel } from "@/components/app/ui"
import { requireRole } from "@/lib/auth"
import { formatDate, formatDateTime } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

const FLUXO = ["inscrito", "em_analise", "entrevista", "contratado"] as const

export default async function CandidaturasPage() {
  const supabase = await getServerSupabase()
  const [, { data }] = await Promise.all([
    requireRole("candidato"),
    supabase
      .from("candidaturas")
      .select("id, status, created_at, vagas(titulo, area, bairro, entrevista_em, status), candidatura_eventos(status, created_at)")
      .order("created_at", { ascending: false }),
  ])

  type Row = {
    id: string
    status: string
    created_at: string
    vagas: { titulo: string; area: string; bairro: string | null; entrevista_em: string | null; status: string } | null
    candidatura_eventos: { status: string; created_at: string }[]
  }
  const rows = (data ?? []) as unknown as Row[]

  return (
    <>
      <PageHeader title="Minhas candidaturas" description="Veja em que etapa está cada vaga em que você se candidatou." />
      {rows.length === 0 ? (
        <EmptyState title="Você ainda não se candidatou" text="Veja as vagas abertas e candidate-se com um toque." action={<ButtonLink href="/candidato/vagas/">Ver vagas</ButtonLink>} />
      ) : (
        <ul className="space-y-4">
          {rows.map((c) => {
            const datas = new Map(c.candidatura_eventos.map((e) => [e.status, e.created_at]))
            const final = c.status === "nao_selecionado"
            const idx = FLUXO.indexOf(c.status as (typeof FLUXO)[number])
            return (
              <li key={c.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sprout-deep text-sm font-semibold">{c.vagas?.area}</p>
                      <h2 className="text-ink text-xl font-semibold">{c.vagas?.titulo}</h2>
                      <p className="text-ink-soft text-sm">
                        Inscrição em {formatDate(c.created_at)}
                        {c.vagas?.bairro ? ` · ${c.vagas.bairro}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <ol className="mt-5 grid gap-3 sm:grid-cols-4" aria-label="Linha do tempo">
                    {FLUXO.map((st, i) => {
                      const done = !final ? i <= idx : datas.has(st)
                      return (
                        <li key={st} className="flex items-center gap-3 sm:flex-col sm:items-start">
                          <span
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                              done ? "border-sprout-deep bg-sprout-deep text-white" : "border-line bg-white text-ink-soft"
                            )}
                          >
                            {done ? <Check className="size-4" aria-hidden /> : <span className="text-xs font-bold">{i + 1}</span>}
                          </span>
                          <div>
                            <p className={cn("text-sm font-semibold", done ? "text-ink" : "text-ink-soft")}>{statusLabel[st]}</p>
                            {datas.get(st) && <p className="text-ink-soft text-xs">{formatDateTime(datas.get(st))}</p>}
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                  {final && (
                    <p className="text-ink-soft bg-paper-dim/70 mt-4 rounded-xl px-4 py-3 text-sm">
                      Desta vez você não foi selecionado(a). Continue se candidatando: seu perfil segue ativo.
                    </p>
                  )}
                  {c.status === "entrevista" && c.vagas?.entrevista_em && (
                    <p className="bg-seed-soft text-seed-deep mt-4 rounded-xl px-4 py-3 text-sm font-medium">
                      Entrevista: {formatDateTime(c.vagas.entrevista_em)}. A empresa ou a YL vai falar com você pelo WhatsApp.
                    </p>
                  )}
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
