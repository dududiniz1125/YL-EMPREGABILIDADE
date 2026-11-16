import { SubmitButton } from "@/components/app/confirm-submit"
import { AreaCombobox } from "@/components/forms/area-combobox"
import { inputClass } from "@/components/forms/fields"
import type { Categoria } from "@/lib/areas"
import type { Vaga } from "@/lib/data"
import { formatBRL, isoToBrt } from "@/lib/parse"

function F({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-ink text-[0.95rem] font-semibold">
        {label}
        {optional && <span className="text-ink-soft font-normal"> (opcional)</span>}
      </span>
      {children}
    </label>
  )
}

/** Formulário de vaga (empresa e admin). Funciona sem JavaScript. */
export function VagaForm({
  action,
  categorias,
  vaga,
  submitLabel,
  tone = "empresa",
}: {
  action: (f: FormData) => Promise<void>
  categorias: Categoria[]
  vaga?: Partial<Vaga>
  submitLabel: string
  tone?: "empresa" | "admin"
}) {
  const e = isoToBrt(vaga?.entrevista_em)
  return (
    <form action={action} className="space-y-5">
      {vaga?.id && <input type="hidden" name="id" value={vaga.id} />}
      <F label="Título da vaga">
        <input name="titulo" required minLength={3} defaultValue={vaga?.titulo ?? ""} placeholder="Ex.: Vendedor(a) — loja no centro" className={inputClass} />
      </F>
      <div className="grid items-start gap-5 sm:grid-cols-[1fr_160px]">
        <AreaCombobox
          label="Área / função"
          name="area"
          required
          categorias={categorias}
          defaultValue={vaga?.area ?? ""}
          tone={tone === "admin" ? "admin" : "empresa"}
          placeholder="Busque a função (ex.: vendedor)"
        />
        <F label="Nº de vagas">
          <input name="quantidade" type="number" min={1} max={999} inputMode="numeric" defaultValue={vaga?.quantidade ?? 1} className={inputClass} />
        </F>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <F label="Bairro / local" optional>
          <input name="bairro" defaultValue={vaga?.bairro ?? ""} placeholder="Ex.: Vila Madalena" className={inputClass} />
        </F>
        <F label="Salário / faixa" optional>
          <input name="salario" inputMode="numeric" defaultValue={vaga?.salario ? formatBRL(vaga.salario) : ""} placeholder="R$ 0,00" className={inputClass} />
        </F>
        <F label="Data da entrevista" optional>
          <input name="data" type="date" defaultValue={e.date} className={inputClass} />
        </F>
        <F label="Horário" optional>
          <input name="hora" type="time" defaultValue={e.time} className={inputClass} />
        </F>
      </div>
      <F label="Descrição" optional>
        <textarea name="descricao" rows={5} maxLength={3000} defaultValue={vaga?.descricao ?? ""} placeholder="Atividades, escala, benefícios, requisitos…" className={`${inputClass} h-auto py-3`} />
      </F>
      <SubmitButton tone={tone} className="h-12 w-full sm:w-auto">
        {submitLabel}
      </SubmitButton>
    </form>
  )
}
