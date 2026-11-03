import type { Metadata } from "next"

import { AuthCard } from "@/components/auth/auth-card"
import { CandidatoSignup } from "@/components/auth/candidato-signup"
import { getPublicConfig } from "@/lib/public-config"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export const metadata: Metadata = {
  title: "Criar conta de candidato",
  description: "Cadastre-se na YL Empregabilidade, faça a provinha da sua área e receba vagas compatíveis.",
}

export const revalidate = 300

export default async function CadastroCandidatoPage() {
  const { areas } = await getPublicConfig()
  return (
    <AuthCard wide>
      {isSupabaseConfigured ? (
        <CandidatoSignup areas={areas} />
      ) : (
        <p className="text-ink-soft">O cadastro com conta está sendo ativado. Volte em breve.</p>
      )}
    </AuthCard>
  )
}
