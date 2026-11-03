import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { NewPasswordForm } from "@/components/auth/new-password-form"
import { getSession } from "@/lib/auth"
import { roleHome } from "@/lib/roles"

export const metadata: Metadata = { title: "Criar nova senha", robots: { index: false } }

export default async function RedefinirPage() {
  const session = await getSession()
  return (
    <AuthCard tone="neutral">
      {session ? (
        <>
          <h1 className="text-ink text-3xl font-semibold">Crie sua nova senha</h1>
          <p className="text-ink-soft mt-2 mb-6">Conta: {session.email}</p>
          <NewPasswordForm onDoneHref={`${roleHome[session.role]}/?senha=ok`} />
        </>
      ) : (
        <>
          <h1 className="text-ink text-3xl font-semibold">Link expirado</h1>
          <p className="text-ink-soft mt-2">Esse link de redefinição não vale mais. Peça um novo.</p>
          <Link
            href="/esqueci-senha/"
            className="bg-ink mt-6 inline-flex h-12 w-full items-center justify-center rounded-full font-semibold text-white"
          >
            Pedir novo link
          </Link>
        </>
      )}
    </AuthCard>
  )
}
