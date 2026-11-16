"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { notifySignup } from "@/app/(auth)/cadastro/actions"
import { AuthAlert } from "@/components/auth/auth-card"
import { passwordProblem } from "@/components/auth/new-password-form"
import { PasswordInput } from "@/components/auth/password-input"
import { AreaChips, AreaCombobox } from "@/components/forms/area-combobox"
import { CheckboxField, TextField } from "@/components/forms/fields"
import { SuccessPanel } from "@/components/forms/success-panel"
import type { Categoria } from "@/lib/areas"
import { authErrorMessage } from "@/lib/auth-errors"
import { maskCurrency } from "@/lib/masks"
import { currencyToNumber } from "@/lib/parse"
import { getBrowserSupabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export const TURNOS = ["Manhã", "Tarde", "Noite", "Fim de semana"] as const

const schema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo."),
    email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
    cidade: z.string().trim().min(2, "Informe sua cidade e bairro."),
    area: z.string().trim().min(2, "Escolha a sua área principal (ou escreva qual é em “Outra”)."),
    outrasAreas: z.array(z.string()),
    experiencias: z.array(z.object({ empresa: z.string().trim(), funcao: z.string().trim(), tempo: z.string().trim() })).max(3),
    pretensao: z.string(),
    turnos: z.array(z.string()),
    senha: z.string().superRefine((v, ctx) => {
      const p = passwordProblem(v)
      if (p) ctx.addIssue({ code: "custom", message: p })
    }),
    confirma: z.string(),
    consentimento: z.boolean().refine((v) => v, "É preciso concordar para criar a conta."),
  })
  .refine((d) => d.senha === d.confirma, { path: ["confirma"], message: "As senhas não são iguais." })

type Values = z.infer<typeof schema>

const STEPS = [
  { title: "Dados e contato", fields: ["nome", "email", "cidade", "area"] },
  { title: "Experiência e pretensão", fields: ["experiencias", "pretensao", "turnos"] },
  { title: "Senha e consentimento", fields: ["senha", "confirma", "consentimento"] },
] as const

export function CandidatoSignup({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [erro, setErro] = useState<string | null>(null)
  const [done, setDone] = useState<{ email: string; area: string } | null>(null)

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nome: "",
      email: "",
      cidade: "",
      area: "",
      outrasAreas: [],
      experiencias: [{ empresa: "", funcao: "", tempo: "" }],
      pretensao: "",
      turnos: [],
      senha: "",
      confirma: "",
      consentimento: false,
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: "experiencias" })
  const area = useWatch({ control, name: "area" })
  const pretensao = register("pretensao")

  async function goNext() {
    const ok = await trigger([...STEPS[step].fields] as (keyof Values)[], { shouldFocus: true })
    if (ok) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  async function onSubmit(v: Values) {
    setErro(null)
    const areaPrincipal = v.area.trim()
    const { error } = await getBrowserSupabase().auth.signUp({
      email: v.email.trim(),
      password: v.senha,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm/`,
        data: {
          role: "candidato",
          nome: v.nome.trim(),
          cidade: v.cidade.trim(),
          area_principal: areaPrincipal,
          outras_areas: v.outrasAreas.filter((a) => a !== areaPrincipal),
          pretensao_salarial: currencyToNumber(v.pretensao),
          turnos: v.turnos,
          experiencias: v.experiencias.filter((e) => e.empresa || e.funcao || e.tempo),
          consentimento: true,
        },
      },
    })
    if (error) {
      setErro(authErrorMessage(error))
      return
    }
    void notifySignup("candidato", { nome: v.nome, area: areaPrincipal, cidade: v.cidade })
    setDone({ email: v.email.trim(), area: areaPrincipal })
  }

  if (done) {
    return (
      <SuccessPanel
        tone="candidato"
        title="Conta criada!"
        message={`Enviamos um link de confirmação para ${done.email}. Confirme o e-mail e entre na sua área: você já pode se candidatar às vagas de ${done.area}. Se a sua área tiver provinha, ela aparece lá também.`}
        resetLabel="Ir para entrar"
        onReset={() => router.push("/entrar/?tipo=candidato")}
      />
    )
  }

  const pct = ((step + 1) / STEPS.length) * 100

  return (
    <div>
      <p className="text-sprout-deep font-mono text-xs font-medium tracking-[0.16em] uppercase">
        Passo {step + 1} de {STEPS.length}
      </p>
      <h1 className="text-ink mt-2 text-3xl font-semibold">{STEPS[step].title}</h1>
      <div
        className="bg-paper-dim mt-4 h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-label="Progresso do cadastro"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={step + 1}
      >
        <div className="bg-sprout-deep h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-5" aria-label="Cadastro de candidato">
        <div className={cn("space-y-5", step !== 0 && "hidden")}>
          <TextField label="Nome completo" required autoComplete="name" error={errors.nome?.message} {...register("nome")} />
          <TextField
            label="E-mail"
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="voce@exemplo.com"
            hint="É por aqui que entramos em contato sobre vagas e entrevistas. Você também usa este e-mail para entrar."
            error={errors.email?.message}
            {...register("email")}
          />
          <TextField label="Cidade / bairro" required autoComplete="address-level2" placeholder="Ex.: São Paulo, Pinheiros" error={errors.cidade?.message} {...register("cidade")} />
          <Controller
            control={control}
            name="area"
            render={({ field }) => (
              <AreaCombobox
                label="Área principal"
                required
                categorias={categorias}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.area?.message}
                hint="Busque pela função, por exemplo: vendedor, professor, auxiliar administrativo."
              />
            )}
          />
          <Controller
            control={control}
            name="outrasAreas"
            render={({ field }) => (
              <AreaChips
                label="Outras áreas que topa"
                categorias={categorias}
                value={field.value}
                onChange={field.onChange}
                exclude={area ? [area] : []}
                max={5}
              />
            )}
          />
        </div>

        <div className={cn("space-y-5", step !== 1 && "hidden")}>
          <div className="space-y-3">
            <p className="text-ink text-[0.95rem] font-semibold">
              Experiências anteriores <span className="text-ink-soft font-normal">(até 3, opcional)</span>
            </p>
            {fields.map((f, i) => (
              <div key={f.id} className="border-line/80 bg-paper/60 rounded-2xl border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-ink-soft text-sm font-semibold">Experiência {i + 1}</span>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)} className="text-ink-soft hover:text-destructive inline-flex min-h-11 items-center gap-1.5 px-2 text-sm">
                      <Trash2 className="size-4" aria-hidden /> Remover<span className="sr-only"> experiência {i + 1}</span>
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField label="Empresa" {...register(`experiencias.${i}.empresa`)} />
                  <TextField label="Função" placeholder="Ex.: Garçom" {...register(`experiencias.${i}.funcao`)} />
                  <TextField label="Tempo" placeholder="Ex.: 1 ano" {...register(`experiencias.${i}.tempo`)} />
                </div>
              </div>
            ))}
            {fields.length < 3 && (
              <button
                type="button"
                onClick={() => append({ empresa: "", funcao: "", tempo: "" })}
                className="border-sprout-deep/40 text-sprout-deep hover:bg-sprout-soft inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-dashed px-5 font-semibold"
              >
                <Plus className="size-4" aria-hidden /> Adicionar experiência
              </button>
            )}
          </div>
          <TextField
            label="Pretensão salarial"
            optional
            inputMode="numeric"
            placeholder="R$ 0,00"
            {...pretensao}
            onChange={(e) => {
              e.target.value = maskCurrency(e.target.value)
              void pretensao.onChange(e)
            }}
          />
          <fieldset>
            <legend className="text-ink mb-1.5 text-[0.95rem] font-semibold">
              Disponibilidade de turno <span className="text-ink-soft font-normal">(opcional)</span>
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {TURNOS.map((t) => (
                <CheckboxField key={t} value={t} {...register("turnos")}>
                  {t}
                </CheckboxField>
              ))}
            </div>
          </fieldset>
        </div>

        <div className={cn("space-y-5", step !== 2 && "hidden")}>
          <PasswordInput label="Crie uma senha" required autoComplete="new-password" hint="Pelo menos 8 caracteres, com letras e números." error={errors.senha?.message} {...register("senha")} />
          <PasswordInput label="Repita a senha" required autoComplete="new-password" error={errors.confirma?.message} {...register("confirma")} />
          <CheckboxField error={errors.consentimento?.message} className="items-start py-3" {...register("consentimento")}>
            Concordo com o uso dos meus dados para recolocação profissional, conforme a{" "}
            <Link href="/privacidade/" target="_blank" className="text-sprout-deep font-semibold underline underline-offset-2">
              Política de Privacidade
            </Link>
            . <span className="text-destructive" aria-hidden>*</span>
          </CheckboxField>
          {errors.consentimento && <p className="text-destructive -mt-2 text-sm font-medium">{errors.consentimento.message}</p>}
        </div>

        <div aria-live="polite">{erro && <AuthAlert>{erro}</AuthAlert>}</div>

        <div className="flex gap-3 pt-1">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="border-line text-ink hover:bg-paper-dim inline-flex h-14 items-center justify-center gap-2 rounded-full border bg-white px-5 font-semibold"
            >
              <ArrowLeft className="size-5" aria-hidden /> Voltar
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="bg-sprout-deep hover:bg-sprout-deep/90 inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-lg font-semibold text-white"
            >
              Continuar <ArrowRight className="size-5" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-sprout-deep hover:bg-sprout-deep/90 inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-lg font-semibold text-white disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="size-5 animate-spin" aria-hidden />}
              {isSubmitting ? "Criando conta…" : "Criar minha conta"}
            </button>
          )}
        </div>
      </form>

      <p className="text-ink-soft mt-6 text-center">
        Já tem conta?{" "}
        <Link href="/entrar/?tipo=candidato" className="text-sprout-deep inline-flex min-h-11 items-center font-semibold underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
