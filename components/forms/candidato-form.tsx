"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Send, Trash2 } from "lucide-react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import {
  CheckboxField,
  FormStatus,
  SelectField,
  TextField,
} from "@/components/forms/fields"
import { SuccessPanel } from "@/components/forms/success-panel"
import { submitToFormspree } from "@/lib/formspree"
import { maskCurrency, maskPhone, onlyDigits } from "@/lib/masks"
import { siteConfig } from "@/lib/site-config"

const TURNOS = ["Manhã", "Tarde", "Noite", "Fim de semana"] as const

const schema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo."),
    whatsapp: z
      .string()
      .refine((v) => [10, 11].includes(onlyDigits(v).length), "Informe um WhatsApp com DDD, ex.: (11) 99999-9999."),
    email: z
      .string()
      .trim()
      .refine((v) => v === "" || z.email().safeParse(v).success, "E-mail inválido."),
    cidade: z.string().trim().min(2, "Informe sua cidade e bairro."),
    area: z.string().min(1, "Escolha uma área de interesse."),
    areaOutra: z.string().trim(),
    experiencias: z
      .array(
        z.object({
          empresa: z.string().trim(),
          funcao: z.string().trim(),
          tempo: z.string().trim(),
        })
      )
      .max(3),
    pretensao: z.string(),
    turnos: z.array(z.string()),
    consentimento: z.boolean().refine((v) => v, "É preciso concordar para enviar o cadastro."),
  })
  .refine((d) => d.area !== "Outra" || d.areaOutra.length >= 2, {
    path: ["areaOutra"],
    message: "Conte qual é a área.",
  })

type FormValues = z.infer<typeof schema>

const defaults: FormValues = {
  nome: "",
  whatsapp: "",
  email: "",
  cidade: "",
  area: "",
  areaOutra: "",
  experiencias: [{ empresa: "", funcao: "", tempo: "" }],
  pretensao: "",
  turnos: [],
  consentimento: false,
}

export default function CandidatoForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults, mode: "onTouched" })

  const { fields, append, remove } = useFieldArray({ control, name: "experiencias" })
  const area = useWatch({ control, name: "area" })

  const whatsapp = register("whatsapp")
  const pretensao = register("pretensao")

  const onSubmit = async (v: FormValues) => {
    setStatus("idle")
    const exps = v.experiencias.filter((e) => e.empresa || e.funcao || e.tempo)
    const payload: Record<string, unknown> = {
      _subject: `Novo cadastro de candidato: ${v.nome}`,
      tipo: "Candidato",
      nome: v.nome,
      whatsapp: v.whatsapp,
      email: v.email || "(não informado)",
      cidade_bairro: v.cidade,
      area_interesse: v.area === "Outra" ? `Outra: ${v.areaOutra}` : v.area,
      pretensao_salarial: v.pretensao || "(não informada)",
      disponibilidade: v.turnos.length ? v.turnos.join(", ") : "(não informada)",
      consentimento_lgpd: "Sim",
    }
    if (v.email) payload._replyto = v.email
    exps.forEach((e, i) => {
      payload[`experiencia_${i + 1}`] = [e.empresa, e.funcao, e.tempo].filter(Boolean).join(" · ")
    })
    const res = await submitToFormspree(siteConfig.formspree.candidato, payload)
    if (res.ok) {
      setStatus("success")
    } else {
      setErrorMsg(res.message)
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <SuccessPanel
        tone="candidato"
        title="Recebemos seu cadastro!"
        message={siteConfig.messages.candidatoSucesso}
        resetLabel="Fazer outro cadastro"
        onReset={() => {
          reset(defaults)
          setStatus("idle")
        }}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8" aria-label="Cadastro de candidato">
      <fieldset className="space-y-5">
        <legend className="text-ink font-display mb-4 text-xl font-semibold">Seus dados</legend>
        <TextField label="Nome completo" required autoComplete="name" placeholder="Como está no seu documento" error={errors.nome?.message} {...register("nome")} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="WhatsApp"
            required
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(11) 99999-9999"
            error={errors.whatsapp?.message}
            hint="É por aqui que enviamos a provinha e as vagas."
            {...whatsapp}
            onChange={(e) => {
              e.target.value = maskPhone(e.target.value)
              void whatsapp.onChange(e)
            }}
          />
          <TextField label="E-mail" optional type="email" inputMode="email" autoComplete="email" placeholder="voce@exemplo.com" error={errors.email?.message} {...register("email")} />
        </div>
        <TextField label="Cidade / bairro" required autoComplete="address-level2" placeholder="Ex.: São Paulo, Pinheiros" error={errors.cidade?.message} {...register("cidade")} />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-ink font-display mb-4 text-xl font-semibold">Área e experiência</legend>
        <SelectField
          label="Área de interesse"
          required
          options={siteConfig.areas}
          placeholder="Selecione uma área"
          hint="Depois do cadastro, você faz uma provinha online desta área."
          error={errors.area?.message}
          {...register("area")}
        />
        {area === "Outra" && (
          <TextField label="Qual área?" required placeholder="Ex.: Recepção" error={errors.areaOutra?.message} {...register("areaOutra")} />
        )}

        <div className="space-y-3">
          <p className="text-ink text-[0.95rem] font-semibold">
            Experiências anteriores <span className="text-ink-soft font-normal">(até 3, opcional)</span>
          </p>
          {fields.map((f, i) => (
            <div key={f.id} className="border-line/80 bg-paper/60 rounded-2xl border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-ink-soft text-sm font-semibold">Experiência {i + 1}</span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-ink-soft hover:text-destructive inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm"
                  >
                    <Trash2 className="size-4" aria-hidden /> Remover
                    <span className="sr-only"> experiência {i + 1}</span>
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField label="Empresa" placeholder="Nome da empresa" {...register(`experiencias.${i}.empresa`)} />
                <TextField label="Função" placeholder="Ex.: Garçom" {...register(`experiencias.${i}.funcao`)} />
                <TextField label="Tempo" placeholder="Ex.: 1 ano e 6 meses" {...register(`experiencias.${i}.tempo`)} />
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
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-ink font-display mb-4 text-xl font-semibold">Pretensão e disponibilidade</legend>
        <TextField
          label="Pretensão salarial"
          optional
          inputMode="numeric"
          placeholder="R$ 0,00"
          wrapperClassName="sm:max-w-xs"
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TURNOS.map((t, i) => (
              <CheckboxField key={t} id={`turno-${i}`} value={t} {...register("turnos")}>
                {t}
              </CheckboxField>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <div className="space-y-4">
        <CheckboxField error={errors.consentimento?.message} {...register("consentimento")} className="items-start py-3">
          Concordo com o uso dos meus dados para fins de recolocação profissional, conforme a{" "}
          <Link href="/privacidade/" className="text-sprout-deep font-semibold underline underline-offset-2" target="_blank">
            Política de Privacidade
          </Link>
          . <span className="text-destructive" aria-hidden>*</span>
        </CheckboxField>
        {errors.consentimento && (
          <p className="text-destructive -mt-2 text-sm font-medium">{errors.consentimento.message}</p>
        )}

        <FormStatus status={status} message={errorMsg} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-sprout-deep hover:bg-sprout-deep/90 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-lg font-semibold text-white shadow-[0_10px_24px_-12px_rgb(63_110_31/0.8)] transition-colors disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden /> Enviando…
            </>
          ) : (
            <>
              <Send className="size-5" aria-hidden /> Enviar meu cadastro
            </>
          )}
        </button>
        <p className="text-ink-soft text-center text-sm">
          Campos com <span className="text-destructive">*</span> são obrigatórios.
        </p>
      </div>
    </form>
  )
}
