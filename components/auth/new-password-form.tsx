"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { AuthAlert } from "@/components/auth/auth-card"
import { PasswordInput } from "@/components/auth/password-input"
import { authErrorMessage } from "@/lib/auth-errors"
import { getBrowserSupabase } from "@/lib/supabase/client"

export function passwordProblem(p: string) {
  if (p.length < 8) return "Use pelo menos 8 caracteres."
  if (!/[a-zA-Z]/.test(p) || !/\d/.test(p)) return "Misture letras e números."
  return null
}

/**
 * Formulário de nova senha. Usado em /redefinir-senha e nas telas de
 * "trocar senha" das áreas logadas (onDone decide o que acontece depois).
 */
export function NewPasswordForm({
  onDoneHref,
  submitLabel = "Salvar nova senha",
  afterSave,
}: {
  onDoneHref?: string
  submitLabel?: string
  afterSave?: () => Promise<void>
}) {
  const router = useRouter()
  const [senha, setSenha] = useState("")
  const [confirma, setConfirma] = useState("")
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    const prob = passwordProblem(senha)
    if (prob) return setErro(prob)
    if (senha !== confirma) return setErro("As senhas não são iguais.")
    setLoading(true)
    const { error } = await getBrowserSupabase().auth.updateUser({ password: senha })
    if (error) {
      setLoading(false)
      return setErro(authErrorMessage(error))
    }
    if (afterSave) await afterSave()
    setLoading(false)
    setOk(true)
    setSenha("")
    setConfirma("")
    if (onDoneHref) {
      router.replace(onDoneHref)
      router.refresh()
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" aria-label="Nova senha">
      <PasswordInput
        label="Nova senha"
        autoComplete="new-password"
        required
        hint="Pelo menos 8 caracteres, com letras e números."
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <PasswordInput
        label="Repita a nova senha"
        autoComplete="new-password"
        required
        value={confirma}
        onChange={(e) => setConfirma(e.target.value)}
      />
      <div aria-live="polite">
        {erro && <AuthAlert>{erro}</AuthAlert>}
        {ok && !onDoneHref && <AuthAlert tone="success">Senha alterada com sucesso.</AuthAlert>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-ink inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-lg font-semibold text-white disabled:opacity-70"
      >
        {loading && <Loader2 className="size-5 animate-spin" aria-hidden />}
        {loading ? "Salvando…" : submitLabel}
      </button>
    </form>
  )
}
