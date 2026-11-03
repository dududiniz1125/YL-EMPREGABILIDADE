import { PageHeader } from "@/components/app/app-shell"
import { SubmitButton } from "@/components/app/confirm-submit"
import { Card, Flash } from "@/components/app/ui"
import { inputClass } from "@/components/forms/fields"
import { salvarConfig } from "@/app/admin/actions"
import { requireRole } from "@/lib/auth"
import { getServerSupabase } from "@/lib/supabase/server"

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-ink font-semibold">{label}</span>
      {children}
      {hint && <span className="text-ink-soft text-sm">{hint}</span>}
    </label>
  )
}

export default async function AdminConfig({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams
  const supabase = await getServerSupabase()
  const [, { data: c }] = await Promise.all([
    requireRole("admin"),
    supabase.from("configuracoes").select("areas, whatsapp, email, telefone, endereco, mostrar_numeros").eq("id", 1).single(),
  ])
  if (!c) return null
  return (
    <>
      {sp.ok && <Flash>Configurações salvas. O site é atualizado em instantes.</Flash>}
      {sp.erro && <Flash tone="error">Não foi possível salvar.</Flash>}
      <PageHeader title="Configurações" description="O que aparece no site e nos formulários." />
      <Card className="max-w-3xl">
        <form action={salvarConfig} className="space-y-6">
          <F label="Áreas / funções" hint="Uma por linha. Alimentam os formulários, os filtros e a faixa de áreas do site. “Outra” fica sempre no fim.">
            <textarea name="areas" rows={8} defaultValue={(c.areas as string[]).join("\n")} className={`${inputClass} h-auto py-3`} />
          </F>
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="WhatsApp da YL" hint="Só números, com DDI e DDD (ex.: 5511999999999). Vazio esconde o botão flutuante.">
              <input name="whatsapp" inputMode="numeric" defaultValue={c.whatsapp} className={inputClass} />
            </F>
            <F label="E-mail de contato">
              <input name="email" type="email" defaultValue={c.email} className={inputClass} />
            </F>
            <F label="Telefone" hint="Vazio = não aparece no rodapé.">
              <input name="telefone" type="tel" defaultValue={c.telefone} className={inputClass} />
            </F>
            <F label="Endereço" hint="Vazio = não aparece.">
              <input name="endereco" defaultValue={c.endereco} className={inputClass} />
            </F>
          </div>
          <label className="border-input has-[:checked]:bg-sprout-soft/50 flex min-h-14 items-start gap-3 rounded-2xl border bg-white p-4">
            <input type="checkbox" name="mostrar_numeros" defaultChecked={c.mostrar_numeros} className="mt-0.5 size-5 shrink-0 accent-[#3f6e1f]" />
            <span>
              <span className="text-ink block font-semibold">Mostrar a seção de números no site</span>
              <span className="text-ink-soft text-sm">Candidatos, vagas abertas, contratações e empresas aprovadas, direto do banco. Ligue quando os números já forem bons de mostrar.</span>
            </span>
          </label>
          <SubmitButton tone="admin" className="h-12">Salvar configurações</SubmitButton>
        </form>
      </Card>
    </>
  )
}
