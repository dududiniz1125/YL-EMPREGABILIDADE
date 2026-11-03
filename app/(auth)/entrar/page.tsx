import type { Metadata } from "next"
import Link from "next/link"

import { AuthAlert, AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { getSession } from "@/lib/auth"
import { roleHome, safeNext } from "@/lib/roles"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua área na YL Empregabilidade.",
  robots: { index: false },
}

const mensagens: Record<string, { tone: "error" | "info" | "success"; text: string }> = {
  "sem-permissao": { tone: "error", text: "Essa área não é para o seu tipo de conta. Entre com a conta certa." },
  "link-invalido": { tone: "error", text: "Esse link expirou ou já foi usado. Peça um novo." },
  confirmado: { tone: "success", text: "E-mail confirmado! Agora é só entrar." },
  "senha-alterada": { tone: "success", text: "Senha alterada. Entre com a nova senha." },
  saiu: { tone: "info", text: "Você saiu da sua conta." },
}

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; next?: string; erro?: string; ok?: string }>
}) {
  const sp = await searchParams
  const next = safeNext(sp.next)
  const tipo = sp.tipo === "empresa" || next?.startsWith("/empresa") ? "empresa" : "candidato"
  const aviso = mensagens[sp.erro ?? sp.ok ?? ""]
  const session = await getSession()

  return (
    <AuthCard tone={tipo}>
      {aviso && (
        <div className="mb-5">
          <AuthAlert tone={aviso.tone}>{aviso.text}</AuthAlert>
        </div>
      )}
      {!isSupabaseConfigured ? (
        <div>
          <h1 className="text-ink text-3xl font-semibold">Área em configuração</h1>
          <p className="text-ink-soft mt-3">
            O acesso com conta e senha está sendo ativado. Volte em breve.
          </p>
        </div>
      ) : session ? (
        <div>
          <h1 className="text-ink text-3xl font-semibold">Você já está conectado</h1>
          <p className="text-ink-soft mt-2">Entrou como {session.email}.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={roleHome[session.role]}
              className="bg-sprout-deep inline-flex h-12 items-center justify-center rounded-full font-semibold text-white"
            >
              Ir para minha área
            </Link>
            <form action="/auth/sair/" method="post">
              <button className="border-line text-ink h-12 w-full rounded-full border bg-white font-semibold">
                Sair e entrar com outra conta
              </button>
            </form>
          </div>
        </div>
      ) : (
        <LoginForm initialTipo={tipo} next={next} />
      )}
    </AuthCard>
  )
}
