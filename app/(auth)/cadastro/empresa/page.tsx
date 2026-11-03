import type { Metadata } from "next"

import { AuthCard } from "@/components/auth/auth-card"
import { EmpresaSignup } from "@/components/auth/empresa-signup"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export const metadata: Metadata = {
  title: "Cadastrar empresa",
  description: "Cadastre sua empresa na YL Empregabilidade e publique vagas.",
}

export default function CadastroEmpresaPage() {
  return (
    <AuthCard wide tone="empresa">
      {isSupabaseConfigured ? (
        <EmpresaSignup />
      ) : (
        <p className="text-ink-soft">O cadastro com conta está sendo ativado. Volte em breve.</p>
      )}
    </AuthCard>
  )
}
