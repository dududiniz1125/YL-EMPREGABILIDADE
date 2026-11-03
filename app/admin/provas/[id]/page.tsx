import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/app-shell"
import { ConfirmSubmit, SubmitButton } from "@/components/app/confirm-submit"
import { ButtonLink, Card, Flash } from "@/components/app/ui"
import { inputClass } from "@/components/forms/fields"
import { excluirProva, removerQuestao, salvarProva, salvarQuestao } from "@/app/admin/actions"
import { requireRole } from "@/lib/auth"
import { formatDate } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"

type Q = { id: string; ordem: number; enunciado: string; alternativas: string[]; correta: number }

function QuestaoForm({ provaId, q, ordem }: { provaId: string; q?: Q; ordem: number }) {
  const alts = q?.alternativas ?? []
  return (
    <form action={salvarQuestao} className="space-y-3">
      <input type="hidden" name="prova_id" value={provaId} />
      {q && <input type="hidden" name="questao_id" value={q.id} />}
      <input type="hidden" name="ordem" value={q?.ordem ?? ordem} />
      <label className="flex flex-col gap-1.5">
        <span className="text-ink font-semibold">Pergunta</span>
        <textarea name="enunciado" required rows={2} defaultValue={q?.enunciado ?? ""} className={`${inputClass} h-auto py-3`} />
      </label>
      <fieldset className="space-y-2">
        <legend className="text-ink mb-1 font-semibold">Alternativas (marque a certa)</legend>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              type="radio"
              name="correta"
              value={i}
              defaultChecked={(q?.correta ?? 0) === i}
              aria-label={`Alternativa ${i + 1} é a certa`}
              className="size-5 shrink-0 accent-[#3f6e1f]"
            />
            <input name={`alt_${i}`} defaultValue={alts[i] ?? ""} placeholder={`Alternativa ${i + 1}${i > 1 ? " (opcional)" : ""}`} required={i < 2} className={inputClass} />
          </div>
        ))}
      </fieldset>
      <SubmitButton tone="admin">{q ? "Salvar questão" : "Adicionar questão"}</SubmitButton>
    </form>
  )
}

export default async function AdminProva({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  await requireRole("admin")
  const db = await getServerSupabase()
  const [{ data: p }, { data: qs }, { data: notas }] = await Promise.all([
    db.from("provas").select("*").eq("id", id).maybeSingle(),
    db.from("questoes").select("*").eq("prova_id", id).order("ordem").order("id"),
    db.from("respostas_prova").select("nota, acertos, total, created_at, candidatos(id, nome)").eq("prova_id", id).order("nota", { ascending: false }),
  ])
  if (!p) notFound()
  const questoes = (qs ?? []) as Q[]
  type N = { nota: number; acertos: number; total: number; created_at: string; candidatos: { id: string; nome: string } | null }

  return (
    <>
      {sp.ok && <Flash>Salvo.</Flash>}
      {sp.erro === "questao" && <Flash tone="error">A questão precisa de pergunta, pelo menos 2 alternativas e a certa marcada.</Flash>}
      <PageHeader title={p.titulo} description={p.area} actions={<ButtonLink href="/admin/provas/" tone="outline">← Provas</ButtonLink>} />

      <Card>
        <form action={salvarProva} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <input type="hidden" name="id" value={p.id} />
          <label className="flex flex-col gap-1.5">
            <span className="text-ink font-semibold">Título</span>
            <input name="titulo" defaultValue={p.titulo} className={inputClass} />
          </label>
          <label className="border-input flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4">
            <input type="checkbox" name="ativa" defaultChecked={p.ativa} className="size-5 accent-[#3f6e1f]" /> Ativa
          </label>
          <SubmitButton tone="admin" className="h-12">Salvar</SubmitButton>
        </form>
      </Card>

      <h2 className="text-ink mt-8 mb-3 text-2xl font-semibold">Questões ({questoes.length})</h2>
      <div className="space-y-4">
        {questoes.map((q, i) => (
          <Card key={q.id}>
            <details>
              <summary className="text-ink flex min-h-11 cursor-pointer items-center justify-between gap-3 font-semibold">
                <span>
                  {i + 1}. {q.enunciado}
                </span>
                <span className="text-ink-soft shrink-0 text-sm font-normal">editar</span>
              </summary>
              <div className="mt-4">
                <QuestaoForm provaId={p.id} q={q} ordem={i + 1} />
                <form action={removerQuestao} className="border-line mt-4 border-t pt-4">
                  <input type="hidden" name="prova_id" value={p.id} />
                  <input type="hidden" name="questao_id" value={q.id} />
                  <ConfirmSubmit label="Remover questão" tone="outline" title="Remover esta questão?" text="Notas já dadas não mudam." confirmLabel="Remover" />
                </form>
              </div>
            </details>
            <p className="text-ink-soft mt-1 text-sm">Certa: {q.alternativas[q.correta]}</p>
          </Card>
        ))}
        <Card className="border-dashed">
          <h3 className="text-ink mb-3 text-lg font-semibold">Nova questão</h3>
          <QuestaoForm provaId={p.id} ordem={questoes.length + 1} />
        </Card>
      </div>

      <h2 className="text-ink mt-10 mb-3 text-2xl font-semibold">Notas ({notas?.length ?? 0})</h2>
      <Card className="p-0">
        {!notas?.length ? (
          <p className="text-ink-soft p-5">Ninguém fez esta prova ainda.</p>
        ) : (
          <ul className="divide-line divide-y">
            {(notas as unknown as N[]).map((n, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
                <Link href={`/admin/candidatos/${n.candidatos?.id}/`} className="text-ink inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline">
                  {n.candidatos?.nome}
                </Link>
                <span className="text-ink-soft text-sm">
                  <strong className="text-ink">{Number(n.nota).toLocaleString("pt-BR")}</strong> ({n.acertos}/{n.total}) · {formatDate(n.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <form action={excluirProva} className="mt-8">
        <input type="hidden" name="id" value={p.id} />
        <ConfirmSubmit label="Excluir prova" title="Excluir esta prova?" text="As questões e todas as notas desta prova serão apagadas." confirmLabel="Sim, excluir" />
      </form>
    </>
  )
}
