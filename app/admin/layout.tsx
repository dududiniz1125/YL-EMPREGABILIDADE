import type { Metadata } from "next"
import Link from "next/link"
import { KeyRound } from "lucide-react"

import { AppShell, type NavItem } from "@/components/app/app-shell"
import { adminNav } from "@/lib/admin-nav"
import { requireRole } from "@/lib/auth"

export const metadata: Metadata = { title: "Painel YL", robots: { index: false, follow: false } }


const mobileNav: NavItem[] = [
  adminNav[0],
  adminNav[1],
  adminNav[2],
  adminNav[3],
  { href: "/admin/mais/", label: "Mais", icon: "mais" },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireRole("admin")
  const banner = s.mustChangePassword ? (
    <div role="alert" className="bg-amber-soft text-ink border-amber/40 flex flex-wrap items-center gap-3 border-b px-4 py-3 sm:px-10">
      <KeyRound className="text-amber-deep size-5 shrink-0" aria-hidden />
      <p className="flex-1">
        <strong>Troque sua senha.</strong> A senha inicial é provisória e já foi compartilhada.
      </p>
      <Link href="/admin/conta/" className="bg-ink text-paper inline-flex min-h-11 items-center rounded-full px-5 font-semibold">
        Trocar agora
      </Link>
    </div>
  ) : null
  return (
    <AppShell title="Painel YL" tone="admin" nav={adminNav} mobileNav={mobileNav} userLabel={s.email} banner={banner}>
      {children}
    </AppShell>
  )
}
