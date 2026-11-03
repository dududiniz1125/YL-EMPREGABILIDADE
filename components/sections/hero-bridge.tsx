"use client"

import { forwardRef, useRef } from "react"
import Image from "next/image"
import {
  Building2,
  ChefHat,
  ConciergeBell,
  Store,
  User,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"

import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { cn } from "@/lib/utils"

const greenBeam = {
  duration: 4.5,
  pathColor: "#7dbe3c",
  pathOpacity: 0.25,
  pathWidth: 2.5,
  gradientStartColor: "#7dbe3c",
  gradientStopColor: "#3f6e1f",
}
const brownBeam = {
  duration: 4.5,
  pathColor: "#8a4b1e",
  pathOpacity: 0.2,
  pathWidth: 2.5,
  gradientStartColor: "#e2a33d",
  gradientStopColor: "#8a4b1e",
}

const Node = forwardRef<
  HTMLDivElement,
  { icon: LucideIcon; label: string; side: "candidato" | "empresa"; className?: string }
>(({ icon: Icon, label, side, className }, ref) => (
  <div className={cn("flex flex-col items-center gap-1.5", className)}>
    <div
      ref={ref}
      className={cn(
        "relative z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white shadow-[var(--shadow-soft)] sm:size-14",
        side === "candidato"
          ? "border-sprout/60 text-sprout-deep"
          : "border-seed/40 text-seed"
      )}
    >
      <Icon className="size-5 sm:size-6" aria-hidden strokeWidth={1.8} />
    </div>
    <span className="text-ink-soft text-[0.7rem] font-medium sm:text-xs">{label}</span>
  </div>
))
Node.displayName = "Node"

/**
 * A "ponte", agora viva: candidatos (esquerda) → YL (centro) → empresas (direita).
 * Ilustração decorativa — os rótulos são genéricos.
 */
export function HeroBridge() {
  const containerRef = useRef<HTMLDivElement>(null)
  const yl = useRef<HTMLDivElement>(null)
  const c1 = useRef<HTMLDivElement>(null)
  const c2 = useRef<HTMLDivElement>(null)
  const c3 = useRef<HTMLDivElement>(null)
  const e1 = useRef<HTMLDivElement>(null)
  const e2 = useRef<HTMLDivElement>(null)
  const e3 = useRef<HTMLDivElement>(null)


  return (
    <figure
      className="border-line/70 relative mx-auto w-full max-w-xl rounded-[2rem] border bg-white/75 p-5 shadow-[var(--shadow-lift)] sm:p-8"
      aria-label="Ilustração: candidatos se conectam às empresas por meio da YL"
    >
      <div
        ref={containerRef}
        className="relative flex items-center justify-between gap-2"
      >
        <div className="flex flex-col gap-5 sm:gap-7">
          <Node ref={c1} icon={ConciergeBell} label="Garçom" side="candidato" />
          <Node ref={c2} icon={ChefHat} label="Cozinha" side="candidato" />
          <Node ref={c3} icon={User} label="Você" side="candidato" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div
            ref={yl}
            className="border-amber/50 relative z-10 flex size-24 items-center justify-center rounded-full border-2 bg-white shadow-[0_0_0_8px_rgb(226_163_61/0.12),var(--shadow-lift)] sm:size-28"
          >
            <Image
              src="/logo-mark-md.webp"
              alt="YL"
              width={216}
              height={240}
              priority
              className="h-16 w-auto sm:h-20"
            />
          </div>
          <span className="text-amber-deep font-mono text-[0.65rem] font-medium tracking-[0.14em] uppercase">
            a ponte
          </span>
        </div>

        <div className="flex flex-col gap-5 sm:gap-7">
          <Node ref={e1} icon={UtensilsCrossed} label="Restaurante" side="empresa" />
          <Node ref={e2} icon={Store} label="Comércio" side="empresa" />
          <Node ref={e3} icon={Building2} label="Empresa" side="empresa" />
        </div>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={c1}
          toRef={yl}
          curvature={30}
          delay={0.0}
          {...greenBeam}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={c2}
          toRef={yl}
          curvature={0}
          delay={0.6}
          {...greenBeam}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={c3}
          toRef={yl}
          curvature={-30}
          delay={1.2}
          {...greenBeam}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={yl}
          toRef={e1}
          curvature={30}
          delay={1.2}
          {...brownBeam}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={yl}
          toRef={e2}
          curvature={0}
          delay={1.8}
          {...brownBeam}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={yl}
          toRef={e3}
          curvature={-30}
          delay={2.4}
          {...brownBeam}
        />
      </div>
      <figcaption className="border-line/70 text-ink-soft mt-6 flex items-center justify-between border-t pt-4 text-xs font-medium sm:text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="bg-sprout size-2.5 rounded-full" aria-hidden /> Candidatos
        </span>
        <span className="inline-flex items-center gap-2">
          Empresas <span className="bg-seed size-2.5 rounded-full" aria-hidden />
        </span>
      </figcaption>
    </figure>
  )
}
