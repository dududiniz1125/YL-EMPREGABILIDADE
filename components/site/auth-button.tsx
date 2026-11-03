"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LogIn, UserRound } from "lucide-react"

import { getBrowserSupabase } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

/** "Entrar" para visitantes e "Minha área" para quem já está logado. */
export function AuthButton({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const supabase = getBrowserSupabase()
    let alive = true
    supabase.auth.getSession().then(({ data }) => alive && setLogged(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setLogged(!!session))
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

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
