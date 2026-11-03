import { PageHeader } from "@/components/app/app-shell"
import { ChangePassword } from "@/components/app/change-password"
import { SubmitButton } from "@/components/app/confirm-submit"
import { Card, Flash, StatusBadge } from "@/components/app/ui"
import { inputClass } from "@/components/forms/fields"
import { salvarEmpresa } from "@/app/empresa/actions"
import { requireRole } from "@/lib/auth"
import { getServerSupabase } from "@/lib/supabase/server"

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-ink text-[0.95rem] font-semibold">{label}</span>
      {children}
    </label>
  )
}

export default async function DadosEmpresaPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams
  const s = await requireRole("empresa")
  const { data: e } = await (await getServerSupabase()).from("empresas").select("*").eq("id", s.userId).single()
  if (!e) return null
  return (
    <>
      {sp.ok && <Flash>Dados atualizados.</Flash>}
      {sp.erro && <Flash tone="error">Confira nome da empresa, responsável e WhatsApp.</Flash>}
      <PageHeader title="Dados da empresa" description={<span className="inline-flex items-center gap-2">Situação do cadastro: <StatusBadge status={e.status} /></span>} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <form action={salvarEmpresa} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <F label="Nome da empresa">
                <input name="nome" required defaultValue={e.nome} className={inputClass} />
              </F>
              <F label="CNPJ">
                <input name="cnpj" inputMode="numeric" defaultValue={e.cnpj ?? ""} className={inputClass} />
              </F>
              <F label="Responsável">
                <input name="responsavel" required defaultValue={e.responsavel} className={inputClass} />
              </F>
              <F label="WhatsApp">
                <input name="whatsapp" required type="tel" inputMode="tel" defaultValue={e.whatsapp} className={inputClass} />
              </F>
              <F label="E-mail de acesso">
                <input value={e.email} readOnly disabled className={inputClass} />
              </F>
              <F label="Bairro">
                <input name="bairro" defaultValue={e.bairro ?? ""} className={inputClass} />
              </F>
            </div>
            <SubmitButton tone="empresa" className="h-12">Salvar dados</SubmitButton>
          </form>
        </Card>
        <Card>
          <h2 className="text-ink text-xl font-semibold">Trocar senha</h2>
          <div className="mt-4">
            <ChangePassword />
          </div>
        </Card>
      </div>
    </>
  )
}
