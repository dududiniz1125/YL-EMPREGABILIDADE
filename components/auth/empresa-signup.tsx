"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { notifySignup } from "@/app/(auth)/cadastro/actions"
import { AuthAlert } from "@/components/auth/auth-card"
import { passwordProblem } from "@/components/auth/new-password-form"
import { PasswordInput } from "@/components/auth/password-input"
import { CheckboxField, TextField } from "@/components/forms/fields"
import { SuccessPanel } from "@/components/forms/success-panel"
import { authErrorMessage } from "@/lib/auth-errors"
import { maskCnpj, onlyDigits } from "@/lib/masks"
import { getBrowserSupabase } from "@/lib/supabase/client"

const schema = z
  .object({
    empresa: z.string().trim().min(2, "Informe o nome da empresa."),
    cnpj: z.string().refine((v) => v === "" || onlyDigits(v).length === 14, "CNPJ incompleto."),
    responsavel: z.string().trim().min(2, "Informe o nome do responsável."),
    email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
    bairro: z.string().trim(),
    senha: z.string().superRefine((v, ctx) => {
      const p = passwordProblem(v)
      if (p) ctx.addIssue({ code: "custom", message: p })
    }),
    confirma: z.string(),
    consentimento: z.boolean().refine((v) => v, "É preciso concordar para criar a conta."),
  })
  .refine((d) => d.senha === d.confirma, { path: ["confirma"], message: "As senhas não são iguais." })

type Values = z.infer<typeof schema>

export function EmpresaSignup() {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { empresa: "", cnpj: "", responsavel: "", email: "", bairro: "", senha: "", confirma: "", consentimento: false },
  })
  const cnpj = register("cnpj")

  async function onSubmit(v: Values) {
    setErro(null)
    const { error } = await getBrowserSupabase().auth.signUp({
      email: v.email.trim(),
      password: v.senha,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm/`,
        data: {
          role: "empresa",
          empresa: v.empresa.trim(),
          cnpj: v.cnpj,
          responsavel: v.responsavel.trim(),
          bairro: v.bairro.trim(),
          consentimento: true,
        },
      },
    })
    if (error) return setErro(authErrorMessage(error))
    void notifySignup("empresa", { nome: v.empresa, cidade: v.bairro })
    setDone(v.email.trim())
  }

  if (done) {
    return (
      <SuccessPanel
        tone="empresa"
        title="Cadastro recebido!"
        message={`Enviamos um link de confirmação para ${done}. Depois de confirmar, entre na sua área: nossa equipe vai analisar o cadastro e, enquanto isso, você já pode preparar suas vagas.`}
        resetLabel="Ir para entrar"
        onReset={() => router.push("/entrar/?tipo=empresa")}
      />
    )
  }

  return (
    <div>
      <p className="text-seed font-mono text-xs font-medium tracking-[0.16em] uppercase">Cadastro de empresa</p>
      <h1 className="text-ink mt-2 text-3xl font-semibold">Cadastre sua empresa</h1>
      <p className="text-ink-soft mt-2">Leva 2 minutos. Nossa equipe confere os dados antes de liberar as vagas.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-5" aria-label="Cadastro de empresa">
        <fieldset className="space-y-5">
          <legend className="text-ink font-display mb-4 text-xl font-semibold">Empresa</legend>
          <TextField label="Nome da empresa" required autoComplete="organization" error={errors.empresa?.message} {...register("empresa")} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="CNPJ"
              optional
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              error={errors.cnpj?.message}
              {...cnpj}
              onChange={(e) => {
                e.target.value = maskCnpj(e.target.value)
                void cnpj.onChange(e)
              }}
            />
            <TextField label="Bairro" optional placeholder="Ex.: Pinheiros" {...register("bairro")} />
          </div>
        </fieldset>
        <fieldset className="space-y-5">
          <legend className="text-ink font-display mb-4 text-xl font-semibold">Responsável e acesso</legend>
          <TextField label="Nome do responsável" required autoComplete="name" error={errors.responsavel?.message} {...register("responsavel")} />
          <TextField
            label="E-mail"
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            hint="É por aqui que falamos com a empresa. Você também usa este e-mail para entrar."
            error={errors.email?.message}
            {...register("email")}
          />
          <PasswordInput label="Crie uma senha" required autoComplete="new-password" hint="Pelo menos 8 caracteres, com letras e números." error={errors.senha?.message} {...register("senha")} />
          <PasswordInput label="Repita a senha" required autoComplete="new-password" error={errors.confirma?.message} {...register("confirma")} />
        </fieldset>
        <CheckboxField tone="empresa" error={errors.consentimento?.message} className="items-start py-3" {...register("consentimento")}>
          Concordo com o tratamento dos dados informados, conforme a{" "}
          <Link href="/privacidade/" target="_blank" className="text-seed font-semibold underline underline-offset-2">
            Política de Privacidade
          </Link>
          . <span className="text-destructive" aria-hidden>*</span>
        </CheckboxField>
        {errors.consentimento && <p className="text-destructive -mt-2 text-sm font-medium">{errors.consentimento.message}</p>}
        <div aria-live="polite">{erro && <AuthAlert>{erro}</AuthAlert>}</div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-seed hover:bg-seed-deep inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-lg font-semibold text-white disabled:opacity-70"
        >
          {isSubmitting && <Loader2 className="size-5 animate-spin" aria-hidden />}
          {isSubmitting ? "Criando conta…" : "Criar conta da empresa"}
        </button>
      </form>
      <p className="text-ink-soft mt-6 text-center">
        Já tem conta?{" "}
        <Link href="/entrar/?tipo=empresa" className="text-seed inline-flex min-h-11 items-center font-semibold underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
