import { PageHeader } from "@/components/app/app-shell"
import { ConfirmSubmit, SubmitButton } from "@/components/app/confirm-submit"
import { Card, Flash } from "@/components/app/ui"
import { ChangePassword } from "@/components/app/change-password"
import { inputClass } from "@/components/forms/fields"
import { excluirMinhaConta, salvarPerfil } from "@/app/candidato/actions"
import { TURNOS } from "@/components/auth/candidato-signup"
import { requireRole } from "@/lib/auth"
import type { Experiencia } from "@/lib/data"
import { getPublicConfig } from "@/lib/public-config"
import { formatBRL } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-ink text-[0.95rem] font-semibold">{label}</span>
      {children}
      {hint && <span className="text-ink-soft text-sm">{hint}</span>}
    </label>
  )
}

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams
  const s = await requireRole("candidato")
  const supabase = await getServerSupabase()
  const [{ data: c }, { areas }] = await Promise.all([
    supabase.from("candidatos").select("*").eq("id", s.userId).single(),
    getPublicConfig(),
  ])
  if (!c) return null
  const exps = (c.experiencias ?? []) as Experiencia[]
  const areaOptions = Array.from(new Set([...areas.filter((a) => a !== "Outra"), c.area_principal]))

  return (
    <>
      {sp.ok === "perfil" && <Flash>Perfil atualizado.</Flash>}
      {sp.erro === "dados" && <Flash tone="error">Confira nome, WhatsApp, cidade e área: são obrigatórios.</Flash>}
      {sp.erro && sp.erro !== "dados" && <Flash tone="error">Não foi possível salvar agora. Tente de novo.</Flash>}
      <PageHeader title="Meu perfil" description="Mantenha seus dados em dia: é assim que as vagas certas chegam até você." />

      <Card>
        <form action={salvarPerfil} className="space-y-5">
          <h2 className="text-ink text-xl font-semibold">Dados e contato</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome completo">
              <input name="nome" required defaultValue={c.nome} autoComplete="name" className={inputClass} />
            </Field>
            <Field label="WhatsApp">
              <input name="whatsapp" required type="tel" inputMode="tel" defaultValue={c.whatsapp} className={inputClass} />
            </Field>
            <Field label="E-mail" hint="O e-mail de acesso não pode ser alterado por aqui.">
              <input value={c.email} readOnly disabled className={inputClass} />
            </Field>
            <Field label="Cidade / bairro">
              <input name="cidade" required defaultValue={c.cidade} className={inputClass} />
            </Field>
            <Field label="Área principal">
              <select name="area_principal" defaultValue={c.area_principal} className={inputClass}>
                {areaOptions.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Pretensão salarial">
              <input name="pretensao" inputMode="numeric" defaultValue={c.pretensao_salarial ? formatBRL(c.pretensao_salarial) : ""} placeholder="R$ 0,00" className={inputClass} />
            </Field>
          </div>
          <fieldset>
            <legend className="text-ink mb-2 text-[0.95rem] font-semibold">Outras áreas que topa</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {areas.filter((a) => a !== "Outra").map((a) => (
                <label key={a} className="border-input has-[:checked]:bg-sprout-soft/50 flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4">
                  <input type="checkbox" name="outras_areas" value={a} defaultChecked={c.outras_areas?.includes(a)} className="size-5 accent-[#3f6e1f]" />
                  {a}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-ink mb-2 text-[0.95rem] font-semibold">Disponibilidade de turno</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TURNOS.map((t) => (
                <label key={t} className="border-input has-[:checked]:bg-sprout-soft/50 flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4">
                  <input type="checkbox" name="turnos" value={t} defaultChecked={c.turnos?.includes(t)} className="size-5 accent-[#3f6e1f]" />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-ink mb-2 text-[0.95rem] font-semibold">Experiências (até 3)</legend>
            {[0, 1, 2].map((i) => (
              <div key={i} className="border-line/80 bg-paper/60 grid gap-3 rounded-2xl border p-4 sm:grid-cols-3">
                <Field label={`Empresa ${i + 1}`}>
                  <input name={`exp_empresa_${i}`} defaultValue={exps[i]?.empresa ?? ""} className={inputClass} />
                </Field>
                <Field label="Função">
                  <input name={`exp_funcao_${i}`} defaultValue={exps[i]?.funcao ?? ""} className={inputClass} />
                </Field>
                <Field label="Tempo">
                  <input name={`exp_tempo_${i}`} defaultValue={exps[i]?.tempo ?? ""} className={inputClass} />
                </Field>
              </div>
            ))}
          </fieldset>
          <SubmitButton className="h-12 w-full sm:w-auto">Salvar alterações</SubmitButton>
        </form>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-ink text-xl font-semibold">Trocar senha</h2>
          <div className="mt-4">
            <ChangePassword />
          </div>
        </Card>
        <Card className="border-destructive/30">
          <h2 className="text-ink text-xl font-semibold">Excluir minha conta</h2>
          <p className="text-ink-soft mt-2">
            Apaga sua conta, seu cadastro, suas candidaturas e a nota da prova, como garante a LGPD. Não dá para desfazer.
          </p>
          <form action={excluirMinhaConta} className="mt-4">
            <ConfirmSubmit
              label="Excluir minha conta"
              title="Excluir sua conta?"
              text="Todos os seus dados serão apagados agora. Você pode criar uma conta nova depois, se quiser."
              confirmLabel="Sim, excluir tudo"
            />
          </form>
        </Card>
      </div>
    </>
  )
}
