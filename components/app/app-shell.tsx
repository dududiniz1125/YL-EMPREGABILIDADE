"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  FileText,
  Home,
  KanbanSquare,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Logo } from "@/components/site/logo"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  vagas: Briefcase,
  candidaturas: KanbanSquare,
  perfil: UserRound,
  prova: ClipboardList,
  candidatos: Users,
  empresas: Building2,
  provas: FileText,
  config: Settings,
  log: ScrollText,
  numeros: BarChart3,
  mais: Menu,
}

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean }

function isActive(pathname: string, item: NavItem) {
  const p = pathname.replace(/\/$/, "")
  const h = item.href.replace(/\/$/, "")
  return item.exact ? p === h : p === h || p.startsWith(h + "/")
}

export function AppShell({
  title,
  tone,
  nav,
  mobileNav,
  userLabel,
  children,
  banner,
}: {
  title: string
  tone: "candidato" | "empresa" | "admin"
  nav: NavItem[]
  mobileNav?: NavItem[]
  userLabel: string
  children: React.ReactNode
  banner?: React.ReactNode
}) {
  const pathname = usePathname()
  const bottom = mobileNav ?? nav.slice(0, 5)
  const activeCls =
    tone === "empresa" ? "bg-seed-soft text-seed-deep" : tone === "admin" ? "bg-ink text-paper" : "bg-sprout-soft text-sprout-deep"
  const accentText = tone === "empresa" ? "text-seed" : tone === "admin" ? "text-ink" : "text-sprout-deep"

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr] lg:bg-[linear-gradient(to_right,rgb(255_253_248/0.7)_259px,var(--line)_259px,var(--line)_260px,transparent_260px)]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh flex-col px-4 py-5 lg:flex">
        <Logo href="/" />
        <p className={cn("mt-6 px-3 font-mono text-[0.7rem] font-medium tracking-[0.16em] uppercase", accentText)}>{title}</p>
        <nav aria-label={title} className="mt-2 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {nav.map((item) => {
              const Icon = ICONS[item.icon]
              const active = isActive(pathname, item)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium transition-colors",
                      active ? activeCls : "text-ink-soft hover:bg-paper-dim hover:text-ink"
                    )}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="border-line mt-4 border-t pt-4">
          <p className="text-ink-soft truncate px-3 text-sm" title={userLabel}>
            {userLabel}
          </p>
          <form action="/auth/sair/" method="post" className="mt-2">
            <button className="text-ink hover:bg-paper-dim flex min-h-11 w-full items-center gap-3 rounded-xl px-3 font-semibold">
              <LogOut className="size-5" aria-hidden /> Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Topo (celular) */}
        <header className="border-line bg-paper/90 sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 backdrop-blur lg:hidden">
          <Logo href="/" withWordmark={false} />
          <p className={cn("font-mono text-[0.68rem] font-medium tracking-[0.14em] uppercase", accentText)}>{title}</p>
          <form action="/auth/sair/" method="post">
            <button className="border-line text-ink inline-flex h-11 items-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold">
              <LogOut className="size-4" aria-hidden /> Sair
            </button>
          </form>
        </header>

        {banner}
        <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Barra inferior (celular) */}
      <nav
        aria-label={`${title} (atalhos)`}
        className="app-bottom-nav border-line bg-card/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${bottom.length}, minmax(0, 1fr))` }}>
          {bottom.map((item) => {
            const Icon = ICONS[item.icon]
            const active = isActive(pathname, item)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.72rem] font-semibold",
                    active ? accentText : "text-ink-soft"
                  )}
                >
                  <span className={cn("inline-flex h-8 w-12 items-center justify-center rounded-full", active && activeCls)}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="max-w-full truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

/** Título de página das áreas logadas */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-ink text-[1.9rem] leading-tight font-semibold sm:text-4xl">{title}</h1>
        {description && <p className="text-ink-soft mt-2 text-[1.02rem]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
