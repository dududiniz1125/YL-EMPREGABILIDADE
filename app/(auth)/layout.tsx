import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Logo } from "@/components/site/logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip">
      <div
        aria-hidden
        className="absolute -top-56 -left-48 -z-10 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(125_190_60/0.16),transparent)]"
      />
      <div
        aria-hidden
        className="absolute top-40 -right-56 -z-10 size-[600px] rounded-full bg-[radial-gradient(closest-side,rgb(226_163_61/0.14),transparent)]"
      />
      <header className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/" />
        <Link
          href="/"
          className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium"
        >
          <ArrowLeft className="size-4" aria-hidden /> Voltar ao site
        </Link>
      </header>
      <main id="conteudo" className="px-4 pt-4 pb-16 sm:px-6 sm:pt-10">
        {children}
      </main>
    </div>
  )
}
