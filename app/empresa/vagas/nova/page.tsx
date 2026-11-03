import { PageHeader } from "@/components/app/app-shell"
import { Card, Flash } from "@/components/app/ui"
import { VagaForm } from "@/components/app/vaga-form"
import { criarVaga } from "@/app/empresa/actions"
import { requireRole } from "@/lib/auth"
import { getPublicConfig } from "@/lib/public-config"

export default async function NovaVagaPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams
  await requireRole("empresa")
  const { areas } = await getPublicConfig()
  return (
    <>
      {sp.erro && <Flash tone="error">Preencha o título e a área da vaga.</Flash>}
      <PageHeader title="Nova vaga" description="A vaga fica pendente até a nossa equipe aprovar. Leva pouco tempo." />
      <Card className="max-w-3xl">
        <VagaForm action={criarVaga} areas={areas} submitLabel="Enviar vaga para aprovação" />
      </Card>
    </>
  )
}
