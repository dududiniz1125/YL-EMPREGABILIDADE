import { notFound } from "next/navigation"
import { MessageCircle } from "lucide-react"

import { PageHeader } from "@/components/app/app-shell"
import { ConfirmSubmit, SubmitButton } from "@/components/app/confirm-submit"
import { ButtonLink, Card, Dl, Flash, StatusBadge } from "@/components/app/ui"
import { inputClass } from "@/components/forms/fields"
import { addAnotacao, excluirCandidato, setCandidatoStatus } from "@/app/admin/actions"
import { requireRole } from "@/lib/auth"
import type { Experiencia } from "@/lib/data"
import { formatBRL, formatDate, formatDateTime, onlyDigitsPhone } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

export default async function FichaCandidato({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  await requireRole("admin")
  const db = await getServerSupabase()
  const [{ data: c }, { data: notas }, { data: provas }, { data: cands }] = await Promise.all([
    db.from("candidatos").select("*").eq("id", id).maybeSingle(),
    db.from("anotacoes").select("id, texto, created_at, profiles(nome)").eq("candidato_id", id).order("created_at", { ascending: false }),
    db.from("respostas_prova").select("nota, acertos, total, created_at, provas(area, titulo)").eq("candidato_id", id),
    db.from("candidaturas").select("id, status, created_at, indicada_por_admin, vagas(id, titulo, empresas(nome))").eq("candidato_id", id).order("created_at", { ascending: false }),
  ])
  if (!c) notFound()
  const exps = (c.experiencias ?? []) as Experiencia[]
  const primeiro = c.nome.split(" ")[0]
  const wa = `https://wa.me/${onlyDigitsPhone(c.whatsapp)}?text=${encodeURIComponent(`Olá, ${primeiro}! Aqui é da YL Empregabilidade. Tudo bem?`)}`
  type Prova = { nota: number; acertos: number; total: number; created_at: string; provas: { area: string; titulo: string } | null }
  type Cand = { id: string; status: string; created_at: string; indicada_por_admin: boolean; vagas: { id: string; titulo: string; empresas: { nome: string } | null } | null }
  type Nota = { id: number; texto: string; created_at: string; profiles: { nome: string } | null }

  return (
    <>
      {sp.ok && <Flash>Feito.</Flash>}
      {sp.erro && <Flash tone="error">Não foi possível concluir. Tente de novo.</Flash>}
      <PageHeader
        title={c.nome}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {c.area_principal} · {c.cidade} <StatusBadge status={c.status} />
          </span>
        }
        actions={
          <>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="bg-sprout-deep inline-flex min-h-11 items-center gap-2 rounded-full px-5 font-semibold text-white">
              <MessageCircle className="size-4" aria-hidden /> Chamar no WhatsApp
            </a>
            <ButtonLink href="/admin/candidatos/" tone="outline">← Lista</ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card>
            <h2 className="text-ink mb-4 text-xl font-semibold">Ficha</h2>
            <Dl
              items={[
                ["WhatsApp", c.whatsapp],
                ["E-mail", c.email],
                ["Cidade/bairro", c.cidade],
                ["Área principal", c.area_principal],
                ["Outras áreas", c.outras_areas?.join(", ")],
                ["Pretensão salarial", formatBRL(c.pretensao_salarial)],
                ["Turnos", c.turnos?.join(", ")],
                ["Cadastro", formatDate(c.created_at)],
                ["Consentimento LGPD", formatDateTime(c.consentimento_lgpd_em)],
              ]}
            />
            <h3 className="text-ink mt-6 font-semibold">Experiências</h3>
            {exps.length ? (
              <ul className="text-ink-soft mt-2 space-y-1">
                {exps.map((e, i) => (
                  <li key={i}>• {[e.funcao, e.empresa, e.tempo].filter(Boolean).join(" · ")}</li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft mt-1">Não informou.</p>
            )}
          </Card>

          <Card>
            <h2 className="text-ink text-xl font-semibold">Provas</h2>
            {(provas as unknown as Prova[] | null)?.length ? (
              <ul className="mt-3 space-y-2">
                {(provas as unknown as Prova[]).map((p, i) => (
                  <li key={i} className="flex flex-wrap justify-between gap-2">
                    <span>{p.provas?.titulo ?? p.provas?.area}</span>
                    <strong>
                      {Number(p.nota).toLocaleString("pt-BR")} ({p.acertos}/{p.total})
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft mt-2">Ainda não fez nenhuma prova.</p>
            )}
          </Card>

          <Card>
            <h2 className="text-ink text-xl font-semibold">Candidaturas</h2>
            {(cands as unknown as Cand[] | null)?.length ? (
              <ul className="divide-line mt-3 divide-y">
                {(cands as unknown as Cand[]).map((x) => (
                  <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <a href={`/admin/vagas/${x.vagas?.id}/`} className="text-ink inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline">
                      {x.vagas?.titulo} <span className="text-ink-soft">· {x.vagas?.empresas?.nome}</span>
                    </a>
                    <StatusBadge status={x.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft mt-2">Nenhuma candidatura.</p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="text-ink text-xl font-semibold">Status do candidato</h2>
            <form action={setCandidatoStatus} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={c.id} />
              {(["ativo", "contratado", "inativo"] as const).map((st) => (
                <button
                  key={st}
                  name="status"
                  value={st}
                  disabled={c.status === st}
                  className={cn("min-h-11 rounded-full border px-4 font-semibold", c.status === st ? "bg-ink text-paper border-ink" : "border-line bg-white hover:bg-paper-dim")}
                >
                  {st === "ativo" ? "Ativo" : st === "contratado" ? "Contratado" : "Inativo"}
                </button>
              ))}
            </form>
          </Card>

          <Card id="anotacoes" className="scroll-mt-24">
            <h2 className="text-ink text-xl font-semibold">Anotações internas</h2>
            <p className="text-ink-soft text-sm">Só a equipe YL vê.</p>
            <form action={addAnotacao} className="mt-3 space-y-2">
              <input type="hidden" name="id" value={c.id} />
              <label htmlFor="texto" className="sr-only">Nova anotação</label>
              <textarea id="texto" name="texto" rows={3} required maxLength={2000} placeholder="Ex.: Conversamos por WhatsApp, prefere turno noite." className={`${inputClass} h-auto py-3`} />
              <SubmitButton tone="admin">Salvar anotação</SubmitButton>
            </form>
            <ul className="mt-4 space-y-3">
              {(notas as unknown as Nota[] | null)?.map((n) => (
                <li key={n.id} className="bg-paper-dim/60 rounded-2xl p-3">
                  <p className="text-ink whitespace-pre-line">{n.texto}</p>
                  <p className="text-ink-soft mt-1 text-xs">
                    {n.profiles?.nome ?? "Admin"} · {formatDateTime(n.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-destructive/30">
            <h2 className="text-ink text-xl font-semibold">Excluir (LGPD)</h2>
            <p className="text-ink-soft mt-1 text-sm">Apaga a conta e todos os dados deste candidato. Não dá para desfazer.</p>
            <form action={excluirCandidato} className="mt-3">
              <input type="hidden" name="id" value={c.id} />
              <ConfirmSubmit
                label="Excluir candidato"
                title={`Excluir ${primeiro}?`}
                text="A conta, o cadastro, as candidaturas, notas de prova e anotações serão apagados agora."
                confirmLabel="Sim, excluir"
              />
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}
