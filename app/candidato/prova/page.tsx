import { ClipboardList } from "lucide-react"

import { PageHeader } from "@/components/app/app-shell"
import { ButtonLink, Card, EmptyState } from "@/components/app/ui"
import { requireRole } from "@/lib/auth"
import { formatDate } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"

export default async function ProvasPage() {
  const supabase = await getServerSupabase()
  const [, { data: c }, { data: todas }, { data: feitas }] = await Promise.all([
    requireRole("candidato"),
    supabase.from("candidatos").select("area_principal, outras_areas").maybeSingle(),
    supabase.from("provas").select("id, titulo, area").eq("ativa", true),
    supabase.from("respostas_prova").select("prova_id, nota, created_at"),
  ])
  const minhasAreas = [c?.area_principal, ...(c?.outras_areas ?? [])].filter(Boolean) as string[]
  const provas = (todas ?? []).filter((p) => minhasAreas.includes(p.area))
  const done = new Map((feitas ?? []).map((r) => [r.prova_id, r]))

  return (
    <>
      <PageHeader
        title="Provinha da sua área"
        description="Um teste rápido de múltipla escolha. Cada prova é feita uma vez e a nota aparece para as empresas das vagas em que você se candidatar."
      />
      {!provas?.length ? (
        <EmptyState title="Ainda não há prova para as suas áreas" text="Assim que a prova da sua área ficar pronta, ela aparece aqui e avisamos você por e-mail." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {provas.map((p) => {
            const r = done.get(p.id)
            return (
              <li key={p.id}>
                <Card className="flex h-full flex-col">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-soft text-amber-deep inline-flex size-11 items-center justify-center rounded-2xl">
                      <ClipboardList className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sprout-deep text-sm font-semibold">{p.area}</p>
                      <h2 className="text-ink text-lg font-semibold">{p.titulo}</h2>
                    </div>
                  </div>
                  <div className="mt-5">
                    {r ? (
                      <p className="text-ink">
                        Concluída em {formatDate(r.created_at)} · <strong>nota {Number(r.nota).toLocaleString("pt-BR")}</strong>
                      </p>
                    ) : (
                      <ButtonLink href={`/candidato/prova/${p.id}/`}>Começar a prova</ButtonLink>
                    )}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
