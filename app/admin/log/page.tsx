import { PageHeader } from "@/components/app/app-shell"
import { Card, EmptyState } from "@/components/app/ui"
import { requireRole } from "@/lib/auth"
import { formatDateTime } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"

const labels: Record<string, string> = {
  "candidato.status": "Mudou status do candidato",
  "candidato.anotacao": "Anotou no candidato",
  "candidato.excluir": "Excluiu candidato",
  "candidatos.exportar": "Exportou CSV de candidatos",
  "empresa.status": "Mudou status da empresa",
  "vaga.status": "Mudou status da vaga",
  "vaga.editar": "Editou vaga",
  "candidatura.indicar": "Indicou candidato para vaga",
  "candidatura.status": "Mudou status de candidatura",
  "prova.criar": "Criou prova",
  "prova.editar": "Editou prova",
  "prova.excluir": "Excluiu prova",
  "questao.criar": "Adicionou questão",
  "questao.editar": "Editou questão",
  "questao.remover": "Removeu questão",
  "config.salvar": "Salvou configurações",
  "conta.trocar_senha": "Trocou a própria senha",
}

export default async function AdminLog() {
  await requireRole("admin")
  const { data } = await (await getServerSupabase())
    .from("admin_log")
    .select("id, acao, alvo_tipo, alvo_id, detalhes, created_at, profiles(nome)")
    .order("created_at", { ascending: false })
    .limit(200)
  type Row = { id: number; acao: string; alvo_tipo: string | null; detalhes: Record<string, unknown>; created_at: string; profiles: { nome: string } | null }
  const rows = (data ?? []) as unknown as Row[]
  return (
    <>
      <PageHeader title="Registro de ações" description="Quem fez o quê, e quando (últimas 200 ações)." />
      {rows.length === 0 ? (
        <EmptyState title="Nenhuma ação registrada ainda" />
      ) : (
        <Card className="p-0">
          <ul className="divide-line divide-y">
            {rows.map((r) => (
              <li key={r.id} className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr]">
                <span className="text-ink-soft text-sm">{formatDateTime(r.created_at)}</span>
                <span className="text-ink">
                  <strong>{r.profiles?.nome ?? "Admin"}</strong> · {labels[r.acao] ?? r.acao}
                  {typeof r.detalhes?.status === "string" ? ` → ${r.detalhes.status}` : ""}
                  {typeof r.detalhes?.nome === "string" ? ` (${r.detalhes.nome})` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
