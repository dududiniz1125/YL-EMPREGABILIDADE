import Link from "next/link"

import { PageHeader } from "@/components/app/app-shell"
import { SubmitButton } from "@/components/app/confirm-submit"
import { Card, Flash, StatusBadge } from "@/components/app/ui"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { setEmpresaStatus, setVagaStatus } from "@/app/admin/actions"
import { requireRole } from "@/lib/auth"
import { formatDate } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"

const count = (r: { count: number | null }) => r.count ?? 0

async function carregarPainel() {
  const db = await getServerSupabase()
  const agora = Date.now()
  const semana = new Date(agora - 7 * 86400_000).toISOString()
  const oitoSemanas = new Date(agora - 56 * 86400_000).toISOString()
  const head = { count: "exact" as const, head: true }
  const [cands, empPend, vagasAbertas, candSemana, contratacoes, areasRes, recentes, empresasPend, vagasPend] = await Promise.all([
    db.from("candidatos").select("id", head),
    db.from("empresas").select("id", head).eq("status", "pendente"),
    db.from("vagas").select("id", head).eq("status", "aberta"),
    db.from("candidaturas").select("id", head).gte("created_at", semana),
    db.from("candidaturas").select("id", head).eq("status", "contratado"),
    db.from("candidatos").select("area_principal"),
    db.from("candidatos").select("created_at").gte("created_at", oitoSemanas),
    db.from("empresas").select("id, nome, responsavel, created_at").eq("status", "pendente").order("created_at").limit(10),
    db.from("vagas").select("id, titulo, area, created_at, empresas(nome, status)").eq("status", "pendente").order("created_at").limit(10),
  ])

  const porArea = new Map<string, number>()
  for (const r of areasRes.data ?? []) porArea.set(r.area_principal, (porArea.get(r.area_principal) ?? 0) + 1)
  const areasOrdenadas = [...porArea.entries()].sort((a, b) => b[1] - a[1])

  // cadastros por semana (8 semanas, da mais antiga para a atual)
  const semanas = Array.from({ length: 8 }, (_, i) => ({ inicio: agora - (8 - i) * 7 * 86400_000, n: 0 }))
  for (const r of recentes.data ?? []) {
    const t = new Date(r.created_at).getTime()
    const idx = Math.min(7, Math.floor((t - semanas[0].inicio) / (7 * 86400_000)))
    if (idx >= 0) semanas[idx].n++
  }
  const max = Math.max(1, ...semanas.map((s) => s.n))

  return { cands, empPend, vagasAbertas, candSemana, contratacoes, areasOrdenadas, semanas, max, empresasPend, vagasPend }
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  await requireRole("admin")
  const { cands, empPend, vagasAbertas, candSemana, contratacoes, areasOrdenadas, semanas, max, empresasPend, vagasPend } = await carregarPainel()
  const stats = [
    { label: "Candidatos cadastrados", value: count(cands), href: "/admin/candidatos/" },
    { label: "Empresas pendentes", value: count(empPend), href: "/admin/empresas/?status=pendente", alert: count(empPend) > 0 },
    { label: "Vagas abertas", value: count(vagasAbertas), href: "/admin/vagas/?status=aberta" },
    { label: "Candidaturas na semana", value: count(candSemana), href: "/admin/candidaturas/" },
    { label: "Contratações", value: count(contratacoes), href: "/admin/candidaturas/?status=contratado" },
  ]
  type VagaPend = { id: string; titulo: string; area: string; created_at: string; empresas: { nome: string; status: string } | null }

  return (
    <>
      {sp.bemvindo && <Flash>Bem-vindo(a) ao painel.</Flash>}
      {sp.ok && <Flash>Feito.</Flash>}
      {sp.erro === "empresa-pendente" && <Flash tone="error">Aprove a empresa antes de abrir a vaga.</Flash>}
      <PageHeader title="Início" description="Visão geral da YL e o que precisa da sua atenção." />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block h-full">
              <Card className={`h-full transition-shadow hover:shadow-[var(--shadow-lift)] ${s.alert ? "border-amber/60 bg-amber-soft/40" : ""}`}>
                <p className="font-display text-ink text-4xl font-semibold">
                  {s.value > 0 ? <NumberTicker value={s.value} className="text-ink" /> : 0}
                </p>
                <p className="text-ink-soft mt-1 text-sm leading-snug">{s.label}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <h2 className="text-ink text-xl font-semibold">Cadastros de candidatos por semana</h2>
          <div className="mt-6 flex h-44 items-end gap-2" role="img" aria-label={`Cadastros nas últimas 8 semanas: ${semanas.map((s) => s.n).join(", ")}`}>
            {semanas.map((s, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-ink text-xs font-semibold">{s.n}</span>
                <div className={`w-full rounded-t-md ${i === 7 ? "bg-sprout-deep" : "bg-sprout/50"}`} style={{ height: `${Math.max(3, (s.n / max) * 100)}%` }} />
                <span className="text-ink-soft text-[0.65rem]">{new Date(s.inicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-ink text-xl font-semibold">Candidatos por área</h2>
          <ul className="mt-4 space-y-2">
            {areasOrdenadas.length === 0 && <li className="text-ink-soft">Nenhum candidato ainda.</li>}
            {areasOrdenadas.slice(0, 8).map(([a, n]) => (
              <li key={a}>
                <Link href={`/admin/candidatos/?area=${encodeURIComponent(a)}`} className="flex min-h-9 items-center justify-between gap-3">
                  <span className="text-ink truncate">{a}</span>
                  <span className="bg-sprout-soft text-sprout-deep rounded-full px-2.5 py-0.5 text-sm font-semibold">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <h2 className="text-ink mt-10 text-2xl font-semibold">Precisa de atenção</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-ink text-lg font-semibold">Empresas aguardando aprovação</h3>
          <ul className="divide-line mt-3 divide-y">
            {!empresasPend.data?.length && <li className="text-ink-soft py-3">Nada pendente.</li>}
            {empresasPend.data?.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-ink font-semibold">{e.nome}</p>
                  <p className="text-ink-soft text-sm">
                    {e.responsavel} · desde {formatDate(e.created_at)}
                  </p>
                </div>
                <form action={setEmpresaStatus}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="status" value="aprovada" />
                  <input type="hidden" name="back" value="/admin/" />
                  <SubmitButton tone="candidato" pendingLabel="Aprovando…">Aprovar</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="text-ink text-lg font-semibold">Vagas aguardando aprovação</h3>
          <ul className="divide-line mt-3 divide-y">
            {!vagasPend.data?.length && <li className="text-ink-soft py-3">Nada pendente.</li>}
            {(vagasPend.data as unknown as VagaPend[] | null)?.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link href={`/admin/vagas/${v.id}/`} className="text-ink font-semibold underline-offset-4 hover:underline">
                    {v.titulo}
                  </Link>
                  <p className="text-ink-soft flex flex-wrap items-center gap-2 text-sm">
                    {v.empresas?.nome} {v.empresas?.status !== "aprovada" && <StatusBadge status={v.empresas?.status ?? "pendente"} />}
                  </p>
                </div>
                <form action={setVagaStatus}>
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="status" value="aberta" />
                  <input type="hidden" name="back" value="/admin/" />
                  <SubmitButton tone="candidato" pendingLabel="Aprovando…">Aprovar vaga</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
