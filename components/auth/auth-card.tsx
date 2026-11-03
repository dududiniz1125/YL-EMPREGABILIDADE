import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { cn } from "@/lib/utils"

/** Cartão das telas de acesso (Border Beam discreto + Blur Fade na entrada). */
export function AuthCard({
  children,
  tone = "candidato",
  className,
  wide = false,
}: {
  children: React.ReactNode
  tone?: "candidato" | "empresa" | "neutral"
  className?: string
  wide?: boolean
}) {
  const colors =
    tone === "empresa"
      ? { from: "#8a4b1e", to: "#e2a33d" }
      : tone === "neutral"
        ? { from: "#e2a33d", to: "#7dbe3c" }
        : { from: "#7dbe3c", to: "#e2a33d" }
  return (
    <BlurFade className={cn("mx-auto w-full", wide ? "max-w-2xl" : "max-w-md")}>
      <div
        className={cn(
          "bg-card border-line/80 relative overflow-hidden rounded-[2rem] border p-5 shadow-[var(--shadow-lift)] sm:p-8",
          className
        )}
      >
        <BorderBeam size={110} duration={10} colorFrom={colors.from} colorTo={colors.to} borderWidth={2} />
        {children}
      </div>
    </BlurFade>
  )
}

export function AuthAlert({
  tone = "error",
  children,
}: {
  tone?: "error" | "info" | "success"
  children: React.ReactNode
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-4 py-3 text-[0.95rem] leading-relaxed",
        tone === "error" && "bg-destructive/10 text-destructive font-medium",
        tone === "info" && "bg-amber-soft text-ink",
        tone === "success" && "bg-sprout-soft text-sprout-deep font-medium"
      )}
    >
      {children}
    </div>
  )
}
