import type { Metadata } from "next"
import { Clock, ShieldAlert } from "lucide-react"

import { AppShell, type NavItem } from "@/components/app/app-shell"
import { requireRole } from "@/lib/auth"
import { getServerSupabase } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Área da empresa", robots: { index: false, follow: false } }

const nav: NavItem[] = [
  { href: "/empresa/", label: "Minhas vagas", icon: "vagas", exact: true },
  { href: "/empresa/vagas/nova/", label: "Nova vaga", icon: "provas" },
  { href: "/empresa/dados/", label: "Dados", icon: "empresas" },
]

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const s = await requireRole("empresa")
  const supabase = await getServerSupabase()
  const { data: emp } = await supabase.from("empresas").select("nome, status").eq("id", s.userId).single()
  const banner =
    emp?.status === "pendente" ? (
      <div role="status" className="bg-amber-soft text-ink border-amber/40 flex items-start gap-3 border-b px-4 py-3 sm:px-10">
        <Clock className="text-amber-deep mt-0.5 size-5 shrink-0" aria-hidden />
        <p>
          <strong>Seu cadastro está em análise.</strong> Você já pode preparar suas vagas: elas serão publicadas depois que nossa equipe aprovar a empresa e cada vaga.
        </p>
      </div>
    ) : emp?.status === "bloqueada" ? (
      <div role="alert" className="bg-destructive/10 text-destructive flex items-start gap-3 px-4 py-3 sm:px-10">
        <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>Sua conta está bloqueada. Fale com a YL pelo e-mail ylempregabilidade@gmail.com.</p>
      </div>
    ) : null
  return (
    <AppShell title="Área da empresa" tone="empresa" nav={nav} userLabel={emp?.nome ?? s.email} banner={banner}>
      {children}
    </AppShell>
  )
}
