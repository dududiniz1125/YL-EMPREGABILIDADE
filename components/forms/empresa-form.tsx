"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Send } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  CheckboxField,
  FormStatus,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/forms/fields"
import { SuccessPanel } from "@/components/forms/success-panel"
import { submitToFormspree } from "@/lib/formspree"
import { maskCnpj, maskCurrency, maskPhone, onlyDigits } from "@/lib/masks"
import { siteConfig } from "@/lib/site-config"

const schema = z.object({
  empresa: z.string().trim().min(2, "Informe o nome da empresa."),
  responsavel: z.string().trim().min(2, "Informe o nome do responsável."),
  whatsapp: z
    .string()
    .refine((v) => [10, 11].includes(onlyDigits(v).length), "Informe um WhatsApp com DDD, ex.: (11) 99999-9999."),
  email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
  cnpj: z.string().refine((v) => v === "" || onlyDigits(v).length === 14, "CNPJ incompleto."),
  titulo: z.string().trim().min(3, "Dê um título para a vaga."),
  area: z.string().min(1, "Escolha a área/função."),
  quantidade: z.string(),
  local: z.string().trim(),
  dataEntrevista: z.string(),
  horaEntrevista: z.string(),
  salario: z.string(),
  descricao: z.string().trim().max(2000, "Use no máximo 2000 caracteres."),
  consentimento: z.boolean().refine((v) => v, "É preciso concordar para publicar a vaga."),
})

type FormValues = z.infer<typeof schema>

const defaults: FormValues = {
  empresa: "",
  responsavel: "",
  whatsapp: "",
  email: "",
  cnpj: "",
  titulo: "",
  area: "",
  quantidade: "1",
  local: "",
  dataEntrevista: "",
  horaEntrevista: "",
  salario: "",
  descricao: "",
  consentimento: false,
}

const fmtDate = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "")

export default function EmpresaForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults, mode: "onTouched" })

  const whatsapp = register("whatsapp")
  const cnpj = register("cnpj")
  const salario = register("salario")

  const onSubmit = async (v: FormValues) => {
    setStatus("idle")
    const entrevista = [fmtDate(v.dataEntrevista), v.horaEntrevista].filter(Boolean).join(" às ")
    const res = await submitToFormspree(siteConfig.formspree.empresa, {
      _subject: `Nova vaga: ${v.titulo} — ${v.empresa}`,
      _replyto: v.email,
      tipo: "Empresa",
      empresa: v.empresa,
      responsavel: v.responsavel,
      whatsapp: v.whatsapp,
      email: v.email,
      cnpj: v.cnpj || "(não informado)",
      titulo_vaga: v.titulo,
      area_funcao: v.area,
      numero_vagas: v.quantidade || "1",
      local_trabalho: v.local || "(não informado)",
      entrevista: entrevista || "(a combinar)",
      salario: v.salario || "(a combinar)",
      descricao: v.descricao || "(sem descrição)",
      consentimento_lgpd: "Sim",
    })
    if (res.ok) setStatus("success")
    else {
      setErrorMsg(res.message)
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <SuccessPanel
        tone="empresa"
        title="Vaga recebida!"
        message={siteConfig.messages.empresaSucesso}
        resetLabel="Publicar outra vaga"
        onReset={() => {
          reset(defaults)
          setStatus("idle")
        }}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8" aria-label="Publicação de vaga">
      <fieldset className="space-y-5">
        <legend className="text-ink font-display mb-4 text-xl font-semibold">Sobre a empresa</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Nome da empresa" required autoComplete="organization" error={errors.empresa?.message} {...register("empresa")} />
          <TextField label="Responsável" required autoComplete="name" placeholder="Quem vai falar com a YL" error={errors.responsavel?.message} {...register("responsavel")} />
          <TextField
            label="WhatsApp"
            required
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(11) 99999-9999"
            error={errors.whatsapp?.message}
            {...whatsapp}
            onChange={(e) => {
              e.target.value = maskPhone(e.target.value)
              void whatsapp.onChange(e)
            }}
          />
          <TextField label="E-mail" required type="email" inputMode="email" autoComplete="email" placeholder="contato@suaempresa.com.br" error={errors.email?.message} {...register("email")} />
        </div>
        <TextField
          label="CNPJ"
          optional
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          wrapperClassName="sm:max-w-sm"
          error={errors.cnpj?.message}
          {...cnpj}
          onChange={(e) => {
            e.target.value = maskCnpj(e.target.value)
            void cnpj.onChange(e)
          }}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-ink font-display mb-4 text-xl font-semibold">Sobre a vaga</legend>
        <TextField label="Título da vaga" required placeholder="Ex.: Garçom — turno noite" error={errors.titulo?.message} {...register("titulo")} />
        <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
          <SelectField label="Área / função" required options={siteConfig.areas} placeholder="Selecione" error={errors.area?.message} {...register("area")} />
          <TextField label="Nº de vagas" type="number" min={1} inputMode="numeric" {...register("quantidade")} />
        </div>
        <TextField label="Bairro / local de trabalho" optional placeholder="Ex.: Vila Madalena, São Paulo" {...register("local")} />
        <div className="grid items-end gap-5 sm:grid-cols-3">
          <TextField label="Data da entrevista" optional type="date" {...register("dataEntrevista")} />
          <TextField label="Horário" optional type="time" {...register("horaEntrevista")} />
          <TextField
            label="Salário / faixa"
            optional
            inputMode="numeric"
            placeholder="R$ 0,00"
            {...salario}
            onChange={(e) => {
              e.target.value = maskCurrency(e.target.value)
              void salario.onChange(e)
            }}
          />
        </div>
        <TextareaField label="Descrição" optional rows={4} placeholder="Atividades, benefícios, escala, requisitos…" error={errors.descricao?.message} {...register("descricao")} />
      </fieldset>

      <div className="space-y-4">
        <CheckboxField tone="empresa" error={errors.consentimento?.message} {...register("consentimento")} className="items-start py-3">
          Concordo com o tratamento dos dados informados para a divulgação desta vaga, conforme a{" "}
          <Link href="/privacidade/" className="text-seed font-semibold underline underline-offset-2" target="_blank">
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
          className="bg-seed hover:bg-seed-deep inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-lg font-semibold text-white shadow-[0_10px_24px_-12px_rgb(138_75_30/0.8)] transition-colors disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden /> Enviando…
            </>
          ) : (
            <>
              <Send className="size-5" aria-hidden /> Publicar vaga
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
