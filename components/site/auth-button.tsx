"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { LogIn, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

// Só olha se existe o cookie de sessão do Supabase (sem carregar a biblioteca
// inteira na landing). Quem decide o acesso de verdade é o servidor.
const hasSession = () => /(?:^|; )sb-[^=]+-auth-token(?:\.0)?=/.test(document.cookie)
const subscribe = () => () => {}

/** "Entrar" para visitantes e "Minha área" para quem já está logado. */
export function AuthButton({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const logged = useSyncExternalStore(subscribe, hasSession, () => false)
  return (
    <Link
      href={logged ? "/minha-area/" : "/entrar/"}
      onClick={onNavigate}
      className={cn(
        "text-ink hover:bg-paper-dim inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
        className
      )}
    >
      {logged ? <UserRound className="size-4" aria-hidden /> : <LogIn className="size-4" aria-hidden />}
      {logged ? "Minha área" : "Entrar"}
    </Link>
  )
}
