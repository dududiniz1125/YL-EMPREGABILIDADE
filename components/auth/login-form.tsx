"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase, Loader2, LogIn, UserRound } from "lucide-react"

import { AuthAlert } from "@/components/auth/auth-card"
import { PasswordInput } from "@/components/auth/password-input"
import { CheckboxField, TextField } from "@/components/forms/fields"
import { authErrorMessage } from "@/lib/auth-errors"
import { roleHome, safeNext, type Role } from "@/lib/roles"
import { getBrowserSupabase, resetBrowserSupabase } from "@/lib/supabase/client"
import { REMEMBER_COOKIE } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

type Tipo = "candidato" | "empresa"

const MAX_TENTATIVAS = 5
const ESPERA_MS = 30_000

export function LoginForm({ initialTipo, next }: { initialTipo: Tipo; next: string | null }) {
  const router = useRouter()
  const [tipo, setTipo] = useState<Tipo>(initialTipo)
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [lembrar, setLembrar] = useState(true)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [naoConfirmado, setNaoConfirmado] = useState(false)
  const [reenviado, setReenviado] = useState(false)
  const falhas = useRef(0)
  const [bloqueadoAte, setBloqueadoAte] = useState(0)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setNaoConfirmado(false)
    if (Date.now() < bloqueadoAte) {
      setErro("Muitas tentativas. Aguarde 30 segundos e tente de novo.")
      return
    }
    if (!email.trim() || !senha) {
      setErro("Preencha e-mail e senha.")
      return
    }
    setLoading(true)
    // "continuar conectado": sem ele, a sessão termina ao fechar o navegador
    document.cookie = lembrar
      ? `${REMEMBER_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
      : `${REMEMBER_COOKIE}=0; Path=/; SameSite=Lax`
    resetBrowserSupabase()
    const supabase = getBrowserSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    if (error || !data.user) {
      setLoading(false)
      falhas.current += 1
      if (falhas.current >= MAX_TENTATIVAS) {
        falhas.current = 0
        setBloqueadoAte(Date.now() + ESPERA_MS)
      }
      setNaoConfirmado(error?.code === "email_not_confirmed")
      setErro(authErrorMessage(error))
      return
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle()
    const role = (profile?.role as Role | undefined) ?? null
    if (!role) {
      await supabase.auth.signOut()
      setLoading(false)
      setErro("Sua conta não está completa. Fale com a gente pelo e-mail do rodapé.")
      return
    }
    const destino = safeNext(next)
    const home = roleHome[role]
    router.replace(destino && destino.startsWith(home) ? destino : home)
    router.refresh()
  }

  async function reenviar() {
    const supabase = getBrowserSupabase()
    await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm/` },
    })
    setReenviado(true)
  }

  const isEmp = tipo === "empresa"

  return (
    <div>
      <div role="tablist" aria-label="Tipo de conta" className="border-line grid grid-cols-2 gap-1 rounded-full border bg-white p-1.5">
        {(
          [
            ["candidato", "Sou candidato", UserRound],
            ["empresa", "Sou empresa", Briefcase],
          ] as const
        ).map(([v, label, Icon]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={tipo === v}
            onClick={() => setTipo(v)}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full text-[0.95rem] font-semibold transition-colors",
              tipo === v
                ? v === "empresa"
                  ? "bg-seed text-white shadow-sm"
                  : "bg-sprout-deep text-white shadow-sm"
                : "text-ink-soft hover:text-ink"
            )}
          >
            <Icon className="size-4" aria-hidden /> {label}
          </button>
        ))}
      </div>

      <h1 className="text-ink mt-7 text-3xl font-semibold">{isEmp ? "Entrar como empresa" : "Entrar como candidato"}</h1>
      <p className="text-ink-soft mt-2">
        {isEmp ? "Acompanhe suas vagas e os inscritos." : "Acompanhe suas candidaturas e faça a provinha da sua área."}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4" aria-label="Entrar">
        <TextField
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
        />
        <PasswordInput
          label="Senha"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CheckboxField
            checked={lembrar}
            onChange={(e) => setLembrar(e.target.checked)}
            tone={tipo}
            className="min-h-11 border-0 bg-transparent px-0 has-[:checked]:bg-transparent"
          >
            Continuar conectado
          </CheckboxField>
          <Link
            href={`/esqueci-senha/${email ? `?email=${encodeURIComponent(email)}` : ""}`}
            className={cn("inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline", isEmp ? "text-seed" : "text-sprout-deep")}
          >
            Esqueci minha senha
          </Link>
        </div>

        <div aria-live="polite">
          {erro && <AuthAlert>{erro}</AuthAlert>}
          {naoConfirmado && !reenviado && (
            <button type="button" onClick={reenviar} className="text-ink mt-2 min-h-11 text-sm font-semibold underline">
              Reenviar e-mail de confirmação
            </button>
          )}
          {reenviado && (
            <div className="mt-2">
              <AuthAlert tone="success">Se houver uma conta com este e-mail, enviamos um novo link.</AuthAlert>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-lg font-semibold text-white transition-colors disabled:opacity-70",
            isEmp ? "bg-seed hover:bg-seed-deep" : "bg-sprout-deep hover:bg-sprout-deep/90"
          )}
        >
          {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <LogIn className="size-5" aria-hidden />}
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="text-ink-soft mt-6 text-center">
        Ainda não tem conta?{" "}
        <Link
          href={isEmp ? "/cadastro/empresa/" : "/cadastro/candidato/"}
          className={cn("inline-flex min-h-11 items-center font-semibold underline underline-offset-4", isEmp ? "text-seed" : "text-sprout-deep")}
        >
          {isEmp ? "Cadastrar minha empresa" : "Criar minha conta"}
        </Link>
      </p>
    </div>
  )
}
