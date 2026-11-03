"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Mail } from "lucide-react"

import { AuthAlert } from "@/components/auth/auth-card"
import { TextField } from "@/components/forms/fields"
import { authErrorMessage } from "@/lib/auth-errors"
import { getBrowserSupabase } from "@/lib/supabase/client"

export function ForgotForm({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErro("Informe um e-mail válido.")
      return
    }
    setLoading(true)
    const { error } = await getBrowserSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm/?next=/redefinir-senha/`,
    })
    setLoading(false)
    // Mesma resposta exista ou não a conta (não revela e-mails cadastrados)
    if (error && (error.status === 429 || error.code?.includes("rate_limit"))) {
      setErro(authErrorMessage(error))
      return
    }
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div>
        <span className="bg-sprout-soft text-sprout-deep inline-flex size-14 items-center justify-center rounded-full">
          <Mail className="size-7" aria-hidden />
        </span>
        <h1 className="text-ink mt-5 text-3xl font-semibold">Confira seu e-mail</h1>
        <div className="mt-4" aria-live="polite">
          <AuthAlert tone="success">
            Se existir uma conta com {email.trim()}, enviamos um link para criar uma nova senha. Ele vale por 1 hora.
          </AuthAlert>
        </div>
        <p className="text-ink-soft mt-4 text-sm">Não chegou? Veja a caixa de spam ou tente de novo em alguns minutos.</p>
        <Link href="/entrar/" className="text-sprout-deep mt-6 inline-flex min-h-11 items-center font-semibold underline">
          Voltar para entrar
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-ink text-3xl font-semibold">Esqueci minha senha</h1>
      <p className="text-ink-soft mt-2">Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.</p>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4" aria-label="Recuperar senha">
        <TextField
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
        />
        <div aria-live="polite">{erro && <AuthAlert>{erro}</AuthAlert>}</div>
        <button
          type="submit"
          disabled={loading}
          className="bg-ink inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-lg font-semibold text-white disabled:opacity-70"
        >
          {loading && <Loader2 className="size-5 animate-spin" aria-hidden />}
          {loading ? "Enviando…" : "Enviar link"}
        </button>
      </form>
      <Link href="/entrar/" className="text-ink-soft mt-6 inline-flex min-h-11 items-center text-sm font-semibold underline">
        Voltar para entrar
      </Link>
    </div>
  )
}
