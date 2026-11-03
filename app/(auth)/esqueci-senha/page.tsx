import type { Metadata } from "next"

import { AuthCard } from "@/components/auth/auth-card"
import { ForgotForm } from "@/components/auth/forgot-form"

export const metadata: Metadata = { title: "Esqueci minha senha", robots: { index: false } }

export default async function EsqueciPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams
  return (
    <AuthCard tone="neutral">
      <ForgotForm initialEmail={email ?? ""} />
    </AuthCard>
  )
}
