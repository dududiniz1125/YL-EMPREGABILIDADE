import { notFound } from "next/navigation"

import { ButtonLink, Card } from "@/components/app/ui"
import { ProvaRunner } from "@/components/app/prova-runner"
import { requireRole } from "@/lib/auth"
import { getServerSupabase } from "@/lib/supabase/server"

export default async function ProvaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await requireRole("candidato")
  const supabase = await getServerSupabase()
  const { data: ja } = await supabase.from("respostas_prova").select("nota").eq("prova_id", id).eq("candidato_id", s.userId).maybeSingle()
  if (ja) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <h1 className="text-ink text-2xl font-semibold">Você já fez esta prova</h1>
        <p className="text-ink-soft mt-2">Sua nota: {Number(ja.nota).toLocaleString("pt-BR")}</p>
        <ButtonLink href="/candidato/" className="mt-5">Voltar ao início</ButtonLink>
      </Card>
    )
  }
  const { data } = await supabase.rpc("get_prova", { p_prova: id })
  const rows = (data ?? []) as { prova_id: string; titulo: string; area: string; questao_id: string; enunciado: string; alternativas: string[] }[]
  if (!rows.length) notFound()
  return (
    <ProvaRunner
      provaId={id}
      titulo={rows[0].titulo}
      area={rows[0].area}
      questoes={rows.map((r) => ({ id: r.questao_id, enunciado: r.enunciado, alternativas: r.alternativas }))}
    />
  )
}
