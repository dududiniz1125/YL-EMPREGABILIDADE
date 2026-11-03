import Link from "next/link"
import { Plus } from "lucide-react"

import { PageHeader } from "@/components/app/app-shell"
import { ButtonLink, Card, EmptyState, Flash, StatusBadge } from "@/components/app/ui"
import { requireRole } from "@/lib/auth"
import { formatBRL, formatDateTime } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"

export default async function EmpresaHome({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const supabase = await getServerSupabase()
  // RLS: a empresa só enxerga as próprias vagas
  const [, { data: vagas }] = await Promise.all([
    requireRole("empresa"),
    supabase
      .from("vagas")
      .select("id, titulo, area, status, salario, entrevista_em, created_at, candidaturas(count)")
      .order("created_at", { ascending: false }),
  ])
  type Row = { id: string; titulo: string; area: string; status: string; salario: number | null; entrevista_em: string | null; candidaturas: { count: number }[] }
  const rows = (vagas ?? []) as unknown as Row[]

  return (
    <>
      {sp.bemvindo && <Flash>E-mail confirmado. Bem-vindo(a) à YL!</Flash>}
      {sp.senha === "ok" && <Flash>Senha alterada com sucesso.</Flash>}
      {sp.ok === "criada" && <Flash>Vaga enviada! Ela aparece para os candidatos depois da aprovação da nossa equipe.</Flash>}
      <PageHeader
        title="Minhas vagas"
        description="Crie vagas, acompanhe a aprovação e veja quem se inscreveu."
        actions={
          <ButtonLink href="/empresa/vagas/nova/" tone="empresa">
            <Plus className="size-4" aria-hidden /> Nova vaga
          </ButtonLink>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Nenhuma vaga ainda"
          text="Publique sua primeira vaga. Nossa equipe revisa e libera para os candidatos."
          action={<ButtonLink href="/empresa/vagas/nova/" tone="empresa">Criar vaga</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((v) => (
            <li key={v.id}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-seed text-sm font-semibold">{v.area}</p>
                    <h2 className="text-ink text-xl font-semibold break-words">{v.titulo}</h2>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
                <p className="text-ink-soft mt-2 text-sm">
                  {v.salario ? formatBRL(v.salario) : "Salário a combinar"}
                  {v.entrevista_em ? ` · Entrevista ${formatDateTime(v.entrevista_em)}` : ""}
                </p>
                {v.status === "pendente" && <p className="text-amber-deep mt-2 text-sm font-medium">Aguardando aprovação da YL.</p>}
                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <span className="text-ink font-semibold">
                    {v.candidaturas?.[0]?.count ?? 0} inscrito{(v.candidaturas?.[0]?.count ?? 0) === 1 ? "" : "s"}
                  </span>
                  <Link href={`/empresa/vagas/${v.id}/`} className="bg-seed-soft text-seed-deep hover:bg-seed/15 inline-flex min-h-11 items-center rounded-full px-5 font-semibold">
                    Ver inscritos e editar
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
