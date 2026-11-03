import type { NavItem } from "@/components/app/app-shell"

export const adminNav: NavItem[] = [
  { href: "/admin/", label: "Início", icon: "home", exact: true },
  { href: "/admin/candidatos/", label: "Candidatos", icon: "candidatos" },
  { href: "/admin/empresas/", label: "Empresas", icon: "empresas" },
  { href: "/admin/vagas/", label: "Vagas", icon: "vagas" },
  { href: "/admin/candidaturas/", label: "Candidaturas", icon: "candidaturas" },
  { href: "/admin/provas/", label: "Provas", icon: "provas" },
  { href: "/admin/configuracoes/", label: "Configurações", icon: "config" },
  { href: "/admin/log/", label: "Registro de ações", icon: "log" },
  { href: "/admin/conta/", label: "Minha conta", icon: "perfil" },
]
