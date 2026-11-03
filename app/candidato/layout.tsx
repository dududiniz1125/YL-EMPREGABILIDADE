import type { Metadata } from "next"

import { AppShell, type NavItem } from "@/components/app/app-shell"
import { requireRole } from "@/lib/auth"

export const metadata: Metadata = { title: "Área do candidato", robots: { index: false, follow: false } }

const nav: NavItem[] = [
  { href: "/candidato/", label: "Início", icon: "home", exact: true },
  { href: "/candidato/vagas/", label: "Vagas", icon: "vagas" },
  { href: "/candidato/candidaturas/", label: "Candidaturas", icon: "candidaturas" },
  { href: "/candidato/prova/", label: "Prova", icon: "prova" },
  { href: "/candidato/perfil/", label: "Perfil", icon: "perfil" },
]

export default async function CandidatoLayout({ children }: { children: React.ReactNode }) {
  const s = await requireRole("candidato")
  return (
    <AppShell title="Área do candidato" tone="candidato" nav={nav} userLabel={s.email}>
      {children}
    </AppShell>
  )
}
