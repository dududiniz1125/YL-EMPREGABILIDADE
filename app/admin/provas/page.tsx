import Link from "next/link"

import { PageHeader } from "@/components/app/app-shell"
import { SubmitButton } from "@/components/app/confirm-submit"
import { Card, EmptyState, Flash } from "@/components/app/ui"
import { inputClass } from "@/components/forms/fields"
import { criarProva } from "@/app/admin/actions"
import { requireRole } from "@/lib/auth"
import { getPublicConfig } from "@/lib/public-config"
import { getServerSupabase } from "@/lib/supabase/server"

export default async function AdminProvas({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams
  const db = await getServerSupabase()
  const [, { data }, { areas }] = await Promise.all([
    requireRole("admin"),
    db.from("provas").select("id, area, titulo, ativa, questoes(count), respostas_prova(count)").order("area"),
    getPublicConfig(),
  ])
  type Row = { id: string; area: string; titulo: string; ativa: boolean; questoes: { count: number }[]; respostas_prova: { count: number }[] }
  const rows = (data ?? []) as unknown as Row[]
  const usadas = new Set(rows.map((r) => r.area))
  const livres = areas.filter((a) => a !== "Outra" && !usadas.has(a))

  return (
    <>
      {sp.ok && <Flash>Feito.</Flash>}
      {sp.erro === "existe" && <Flash tone="error">Já existe uma prova para essa área.</Flash>}
      <PageHeader title="Provas" description="Uma prova de múltipla escolha por área. O candidato faz uma vez e a nota fica no perfil." />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {rows.length === 0 ? (
            <EmptyState title="Nenhuma prova criada" text="Crie a primeira prova ao lado." />
          ) : (
            <ul className="space-y-3">
              {rows.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/provas/${p.id}/`}>
                    <Card className="flex flex-wrap items-center justify-between gap-3 transition-shadow hover:shadow-[var(--shadow-lift)]">
                      <div>
                        <p className="text-sprout-deep text-sm font-semibold">{p.area}</p>
                        <p className="text-ink text-lg font-semibold">{p.titulo}</p>
                        <p className="text-ink-soft text-sm">
                          {p.questoes?.[0]?.count ?? 0} questões · {p.respostas_prova?.[0]?.count ?? 0} notas
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.ativa ? "bg-sprout-soft text-sprout-deep" : "bg-paper-dim text-ink-soft"}`}>
                        {p.ativa ? "Ativa" : "Desativada"}
                      </span>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Card>
          <h2 className="text-ink text-xl font-semibold">Nova prova</h2>
          {livres.length === 0 ? (
            <p className="text-ink-soft mt-2">Todas as áreas já têm prova. Adicione áreas em Configurações.</p>
          ) : (
            <form action={criarProva} className="mt-4 space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-ink font-semibold">Área</span>
                <select name="area" required className={inputClass}>
                  {livres.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-ink font-semibold">Título</span>
                <input name="titulo" placeholder="Ex.: Prova de garçom" className={inputClass} />
              </label>
              <SubmitButton tone="admin">Criar prova</SubmitButton>
            </form>
          )}
        </Card>
      </div>
    </>
  )
}
