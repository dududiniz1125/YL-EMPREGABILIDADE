import { PageHeader } from "@/components/app/app-shell"
import { SubmitButton } from "@/components/app/confirm-submit"
import { btnClass, EmptyState, Flash, StatusBadge } from "@/components/app/ui"
import { VagaCard } from "@/components/app/vaga-card"
import { inputClass } from "@/components/forms/fields"
import { candidatar } from "@/app/candidato/actions"
import { requireRole } from "@/lib/auth"
import type { Vaga } from "@/lib/data"
import { getPublicConfig } from "@/lib/public-config"
import { getServerSupabase } from "@/lib/supabase/server"

export default async function VagasPage({ searchParams }: { searchParams: Promise<{ area?: string; bairro?: string; ok?: string; erro?: string }> }) {
  const sp = await searchParams
  await requireRole("candidato")
  const supabase = await getServerSupabase()
  const { areas } = await getPublicConfig()
  let q = supabase.from("vagas").select("*").eq("status", "aberta").order("created_at", { ascending: false }).limit(100)
  if (sp.area) q = q.eq("area", sp.area)
  if (sp.bairro) q = q.ilike("bairro", `%${sp.bairro.replace(/[%_]/g, "")}%`)
  const [{ data: vagas }, { data: minhas }] = await Promise.all([q, supabase.from("candidaturas").select("vaga_id, status")])
  const inscritas = new Map((minhas ?? []).map((c) => [c.vaga_id, c.status]))
  const back = `/candidato/vagas/?${new URLSearchParams({ ...(sp.area ? { area: sp.area } : {}), ...(sp.bairro ? { bairro: sp.bairro } : {}) })}`

  return (
    <>
      {sp.ok === "candidatura" && <Flash>Candidatura enviada! Acompanhe em “Candidaturas”.</Flash>}
      {sp.erro && <Flash tone="error">Não foi possível se candidatar. A vaga pode ter sido encerrada.</Flash>}
      <PageHeader title="Vagas abertas" description="Filtre por área e bairro e candidate-se com um toque." />
      <form className="bg-card border-line/80 mb-6 grid gap-3 rounded-3xl border p-4 sm:grid-cols-[1fr_1fr_auto]" role="search">
        <label className="flex flex-col gap-1.5">
          <span className="text-ink text-sm font-semibold">Área</span>
          <select name="area" defaultValue={sp.area ?? ""} className={inputClass}>
            <option value="">Todas as áreas</option>
            {areas.filter((a) => a !== "Outra").map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-ink text-sm font-semibold">Bairro</span>
          <input name="bairro" defaultValue={sp.bairro ?? ""} placeholder="Ex.: Pinheiros" className={inputClass} />
        </label>
        <button className={btnClass("candidato", "h-12 self-end")}>Filtrar</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {(vagas as Vaga[] | null)?.length ? (
          (vagas as Vaga[]).map((v) => (
            <VagaCard key={v.id} vaga={v}>
              {inscritas.has(v.id) ? (
                <span className="text-ink-soft inline-flex items-center gap-2 text-sm font-medium">
                  Você já se candidatou <StatusBadge status={inscritas.get(v.id)!} />
                </span>
              ) : (
                <form action={candidatar}>
                  <input type="hidden" name="vaga_id" value={v.id} />
                  <input type="hidden" name="back" value={back} />
                  <SubmitButton pendingLabel="Enviando…">Quero me candidatar</SubmitButton>
                </form>
              )}
            </VagaCard>
          ))
        ) : (
          <div className="md:col-span-2">
            <EmptyState title="Nenhuma vaga com esses filtros" text="Tente outra área ou deixe o bairro em branco." />
          </div>
        )}
      </div>
    </>
  )
}
