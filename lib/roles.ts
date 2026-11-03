export type Role = "candidato" | "empresa" | "admin"

export const roleHome: Record<Role, string> = {
  candidato: "/candidato",
  empresa: "/empresa",
  admin: "/admin",
}

/** Área protegida a que um caminho pertence (ou null se for público). */
export function areaOf(pathname: string): Role | null {
  if (pathname === "/candidato" || pathname.startsWith("/candidato/")) return "candidato"
  if (pathname === "/empresa" || pathname.startsWith("/empresa/")) return "empresa"
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin"
  return null
}

/** Só aceita redirecionar para caminhos internos (evita open redirect). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null
  return next
}
