import Link from "next/link"
import { MessageCircle } from "lucide-react"

import { PageHeader } from "@/components/app/app-shell"
import { ConfirmSubmit, SubmitButton } from "@/components/app/confirm-submit"
import { FilterTabs } from "@/components/app/filter-tabs"
import { Card, EmptyState, Flash, StatusBadge } from "@/components/app/ui"
import { setEmpresaStatus } from "@/app/admin/actions"
import { requireRole } from "@/lib/auth"
import { formatDate, onlyDigitsPhone } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"

export default async function AdminEmpresas({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string }> }) {
  const sp = await searchParams
  let q = (await getServerSupabase())
    .from("empresas")
    .select("id, nome, cnpj, responsavel, whatsapp, email, bairro, status, created_at, vagas(count)")
    .order("created_at", { ascending: false })
  if (sp.status) q = q.eq("status", sp.status)
  const [, { data }] = await Promise.all([requireRole("admin"), q])
  type Row = { id: string; nome: string; cnpj: string | null; responsavel: string; whatsapp: string; email: string; bairro: string | null; status: string; created_at: string; vagas: { count: number }[] }
  const rows = (data ?? []) as unknown as Row[]
  const back = `/admin/empresas/${sp.status ? `?status=${sp.status}` : ""}`

  return (
    <>
      {sp.ok && <Flash>Empresa atualizada.</Flash>}
      <PageHeader title="Empresas" description="Aprove, bloqueie e fale com as empresas." />
      <FilterTabs base="/admin/empresas/" current={sp.status} options={[["", "Todas"], ["pendente", "Pendentes"], ["aprovada", "Aprovadas"], ["bloqueada", "Bloqueadas"]]} />
      {rows.length === 0 ? (
        <EmptyState title="Nenhuma empresa aqui" />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {rows.map((e) => (
            <li key={e.id}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-ink text-xl font-semibold break-words">{e.nome}</h2>
                    <p className="text-ink-soft text-sm">
                      {e.responsavel} · {e.email}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <p className="text-ink-soft mt-2 text-sm">
                  {e.cnpj ? `CNPJ ${e.cnpj} · ` : ""}
                  {e.bairro ? `${e.bairro} · ` : ""}cadastro em {formatDate(e.created_at)}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  <Link href={`/admin/vagas/?empresa=${e.id}`} className="border-line inline-flex min-h-11 items-center rounded-full border bg-white px-4 font-semibold">
                    Ver vagas ({e.vagas?.[0]?.count ?? 0})
                  </Link>
                  <a
                    href={`https://wa.me/${onlyDigitsPhone(e.whatsapp)}?text=${encodeURIComponent(`Olá, ${e.responsavel.split(" ")[0]}! Aqui é da YL Empregabilidade.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-sprout-soft text-sprout-deep inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold"
                  >
                    <MessageCircle className="size-4" aria-hidden /> WhatsApp
                  </a>
                  {e.status !== "aprovada" && (
                    <form action={setEmpresaStatus}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="status" value="aprovada" />
                      <input type="hidden" name="back" value={back} />
                      <SubmitButton pendingLabel="Aprovando…">Aprovar</SubmitButton>
                    </form>
                  )}
                  {e.status !== "bloqueada" && (
                    <form action={setEmpresaStatus}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="status" value="bloqueada" />
                      <input type="hidden" name="back" value={back} />
                      <ConfirmSubmit
                        label="Bloquear"
                        tone="outline"
                        title={`Bloquear ${e.nome}?`}
                        text="A empresa continua conseguindo entrar, mas não cria novas vagas. Você pode desbloquear depois."
                        confirmLabel="Sim, bloquear"
                      />
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
