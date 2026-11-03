"use client"

import { useEffect, useRef } from "react"
import { CheckCircle2 } from "lucide-react"

import { Confetti, type ConfettiRef } from "@/components/magicui/confetti"
import { cn } from "@/lib/utils"

export function SuccessPanel({
  title,
  message,
  onReset,
  resetLabel,
  tone,
}: {
  title: string
  message: string
  onReset: () => void
  resetLabel: string
  tone: "candidato" | "empresa"
}) {
  const confettiRef = useRef<ConfettiRef>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return
    const colors =
      tone === "candidato"
        ? ["#7dbe3c", "#3f6e1f", "#e2a33d", "#f6f2e9"]
        : ["#8a4b1e", "#e2a33d", "#5c3414", "#7dbe3c"]
    const t = setTimeout(() => {
      const base = { spread: 75, startVelocity: 42, ticks: 220, colors }
      void confettiRef.current?.fire({ ...base, particleCount: 80, angle: 60, origin: { x: 0.15, y: 0.75 } })
      void confettiRef.current?.fire({ ...base, particleCount: 80, angle: 120, origin: { x: 0.85, y: 0.75 } })
    }, 80)
    return () => clearTimeout(t)
  }, [tone])

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <Confetti
        ref={confettiRef}
        manualstart
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] size-full"
      />
      <span
        className={cn(
          "flex size-16 items-center justify-center rounded-full",
          tone === "candidato" ? "bg-sprout-soft text-sprout-deep" : "bg-seed-soft text-seed"
        )}
      >
        <CheckCircle2 className="size-8" aria-hidden />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="text-ink mt-5 text-2xl font-semibold outline-none sm:text-3xl">
        {title}
      </h3>
      <p className="text-ink-soft mt-3 max-w-md text-lg leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="border-line text-ink hover:bg-paper-dim mt-8 inline-flex h-12 items-center rounded-full border bg-white px-6 font-semibold"
      >
        {resetLabel}
      </button>
    </div>
  )
}
