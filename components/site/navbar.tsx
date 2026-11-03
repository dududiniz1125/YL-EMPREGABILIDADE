"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { ScrollProgress } from "@/components/magicui/scroll-progress"
import { AuthButton } from "@/components/site/auth-button"
import { Logo } from "@/components/site/logo"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { navLinks } from "@/lib/nav"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

export function Navbar({ onHome = true }: { onHome?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>("inicio")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Scroll-spy
  useEffect(() => {
    if (!onHome) return
    const els = navLinks
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: "-45% 0px -50% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [onHome])

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-line/80 bg-paper/85 border-b shadow-[0_1px_0_rgb(28_43_42/0.03)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <ScrollProgress className="h-[3px]" aria-hidden />
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((l) => {
              const isActive = onHome && active === l.id
              return (
                <li key={l.id}>
                  <a
                    href={href(l.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative inline-flex min-h-11 items-center rounded-full px-3 text-[0.92rem] font-medium transition-colors",
                      isActive ? "text-ink" : "text-ink-soft hover:text-ink"
                    )}
                  >
                    {l.label}
                    <span
                      aria-hidden
                      className={cn(
                        "bg-sprout-deep absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full transition-transform duration-300",
                        isActive ? "scale-x-100" : "scale-x-0"
                      )}
                    />
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <AuthButton className="hidden sm:inline-flex" />
          <div className="hidden items-center gap-2 md:flex">
            <a
              href={href("candidatos")}
              className="bg-sprout-deep hover:bg-sprout-deep/90 inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold text-white shadow-sm transition-colors"
            >
              Sou candidato
            </a>
            <a
              href={href("empresas")}
              className="border-seed/30 text-seed-deep hover:bg-seed-soft hidden h-11 items-center rounded-full border bg-white/60 px-5 text-sm font-semibold transition-colors xl:inline-flex"
            >
              Sou empresa
            </a>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="border-line text-ink hover:bg-paper-dim inline-flex size-11 items-center justify-center rounded-full border bg-white/70 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" className="bg-paper w-[86vw] max-w-sm border-l-0 p-0">
              <SheetHeader className="border-line border-b px-6 py-5">
                <SheetTitle className="font-display text-left text-xl">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navegação do site {siteConfig.name}
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Menu móvel" className="px-3 py-3">
                <ul className="flex flex-col">
                  {navLinks.map((l) => (
                    <li key={l.id}>
                      <a
                        href={href(l.id)}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex min-h-12 items-center rounded-xl px-3 text-lg font-medium",
                          onHome && active === l.id
                            ? "bg-sprout-soft text-sprout-deep"
                            : "text-ink hover:bg-paper-dim"
                        )}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex flex-col gap-3 p-6">
                <AuthButton
                  onNavigate={() => setOpen(false)}
                  className="border-line h-12 border bg-white text-base"
                />
                <a
                  href={href("candidatos")}
                  onClick={() => setOpen(false)}
                  className="bg-sprout-deep inline-flex h-12 items-center justify-center rounded-full font-semibold text-white"
                >
                  Sou candidato
                </a>
                <a
                  href={href("empresas")}
                  onClick={() => setOpen(false)}
                  className="border-seed/40 text-seed-deep inline-flex h-12 items-center justify-center rounded-full border bg-white font-semibold"
                >
                  Sou empresa
                </a>
                {!onHome && (
                  <Link href="/" className="text-ink-soft mt-2 text-center text-sm underline">
                    Voltar ao início
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
