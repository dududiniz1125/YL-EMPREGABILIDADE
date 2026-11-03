"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"

function FormSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-busy="true" aria-label="Carregando formulário">
      <div className="bg-paper-dim h-6 w-40 animate-pulse rounded-lg" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="bg-paper-dim h-4 w-28 animate-pulse rounded" />
          <div className="bg-paper-dim/70 h-12 w-full animate-pulse rounded-xl" />
        </div>
      ))}
      <div className="bg-paper-dim h-14 w-full animate-pulse rounded-full" />
    </div>
  )
}

const CandidatoForm = dynamic(() => import("@/components/forms/candidato-form"), {
  ssr: false,
  loading: FormSkeleton,
})
const EmpresaForm = dynamic(() => import("@/components/forms/empresa-form"), {
  ssr: false,
  loading: FormSkeleton,
})

/**
 * Só baixa o JS do formulário (react-hook-form + zod) quando o usuário
 * se aproxima dele: o carregamento inicial fica leve, mesmo em 3G/4G fraco.
 */
function WhenNear({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: "800px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref}>{near ? children : <FormSkeleton />}</div>
}

export function LazyCandidatoForm() {
  return (
    <WhenNear>
      <CandidatoForm />
    </WhenNear>
  )
}

export function LazyEmpresaForm() {
  return (
    <WhenNear>
      <EmpresaForm />
    </WhenNear>
  )
}
