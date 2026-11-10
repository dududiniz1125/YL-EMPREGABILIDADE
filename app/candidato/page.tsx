import Link from "next/link"
import { ArrowRight, ClipboardList, Sprout } from "lucide-react"

import { PageHeader } from "@/components/app/app-shell"
import { ButtonLink, Card, EmptyState, Flash, StatusBadge } from "@/components/app/ui"
import { VagaCard } from "@/components/app/vaga-card"
import { candidatar } from "@/app/candidato/actions"
import { SubmitButton } from "@/components/app/confirm-submit"
import { requireRole } from "@/lib/auth"
import { VAGA_COLS, type Vaga } from "@/lib/data"
import { getServerSupabase } from "@/lib/supabase/server"

export default async function CandidatoHome({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const supabase = await getServerSupabase()
  // RLS: o candidato só enxerga o próprio cadastro, candidaturas e notas
  const [, { data: cand }, { data: minhas }, { data: notas }] = await Promise.all([
    requireRole("candidato"),
    supabase.from("candidatos").select("nome, area_principal, status").maybeSingle(),
    supabase.from("candidaturas").select("vaga_id, status"),
    supabase.from("respostas_prova").select("prova_id, nota"),
  ])
  const area = cand?.area_principal ?? ""
  const [{ data: prova }, { data: vagas }] = await Promise.all([
    supabase.from("provas").select("id, titulo").eq("area", area).maybeSingle(),
    supabase.from("vagas").select(VAGA_COLS).eq("status", "aberta").eq("area", area).order("created_at", { ascending: false }).limit(4),
  ])
  const resposta = prova ? (notas ?? []).find((n) => n.prova_id === prova.id) ?? null : null
  const inscritas = new Map((minhas ?? []).map((c) => [c.vaga_id, c.status]))
  const primeiroNome = (cand?.nome ?? "").split(" ")[0]

  return (
    <>
      {sp.bemvindo && <Flash>E-mail confirmado. Bem-vindo(a) à YL!</Flash>}
      {sp.senha === "ok" && <Flash>Senha alterada com sucesso.</Flash>}
      {sp.ok === "candidatura" && <Flash>Candidatura enviada! Acompanhe em “Candidaturas”.</Flash>}
      <PageHeader title={`Olá, ${primeiroNome || "candidato"}!`} description="Aqui você acompanha seu perfil, a provinha e as vagas." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <span className="bg-sprout-soft text-sprout-deep inline-flex size-11 items-center justify-center rounded-2xl">
              <Sprout className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-ink-soft text-sm">Status do perfil</p>
              <p className="text-ink flex items-center gap-2 font-semibold">
                {cand && <StatusBadge status={cand.status} />} · {area}
              </p>
            </div>
          </div>
          <Link href="/candidato/perfil/" className="text-sprout-deep mt-4 inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">
            Ver e editar meu perfil →
          </Link>
        </Card>

        <Card className={!resposta && prova ? "border-amber/60 bg-amber-soft/40" : ""}>
          <div className="flex items-center gap-3">
            <span className="bg-amber-soft text-amber-deep inline-flex size-11 items-center justify-center rounded-2xl">
              <ClipboardList className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-ink-soft text-sm">Provinha da área</p>
              <p className="text-ink font-semibold">
                {!prova ? "Em preparação para a sua área" : resposta ? `Concluída · nota ${Number(resposta.nota).toLocaleString("pt-BR")}` : "Ainda não feita"}
              </p>
            </div>
          </div>
          {prova && !resposta && (
            <ButtonLink href={`/candidato/prova/${prova.id}/`} tone="candidato" className="mt-4 w-full sm:w-auto">
              Faça sua prova <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          )}
          {!prova && <p className="text-ink-soft mt-3 text-sm">Avisamos por e-mail quando ela estiver disponível.</p>}
        </Card>
      </div>

      <div className="mt-10 flex items-end justify-between gap-3">
        <h2 className="text-ink text-2xl font-semibold">Vagas abertas em {area}</h2>
        <Link href="/candidato/vagas/" className="text-sprout-deep inline-flex min-h-11 shrink-0 items-center font-semibold">
          Ver todas →
        </Link>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(vagas as Vaga[] | null)?.length ? (
          (vagas as Vaga[]).map((v) => (
            <VagaCard key={v.id} vaga={v}>
              {inscritas.has(v.id) ? (
                <StatusBadge status={inscritas.get(v.id)!} className="px-3 py-2 text-sm" />
              ) : (
                <form action={candidatar}>
                  <input type="hidden" name="vaga_id" value={v.id} />
                  <input type="hidden" name="back" value="/candidato/" />
                  <SubmitButton pendingLabel="Enviando…">Quero me candidatar</SubmitButton>
                </form>
              )}
            </VagaCard>
          ))
        ) : (
          <div className="md:col-span-2">
            <EmptyState title="Nenhuma vaga aberta na sua área agora" text="Novas vagas chegam toda semana. Avisamos você por e-mail." />
          </div>
        )}
      </div>
    </>
  )
}
