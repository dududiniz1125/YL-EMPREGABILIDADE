import { cn } from "@/lib/utils"

type Tone = "neutral" | "candidato" | "empresa"

const eyebrowTone: Record<Tone, string> = {
  neutral: "text-amber-deep",
  candidato: "text-sprout-deep",
  empresa: "text-seed",
}

export function Eyebrow({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <p
      className={cn(
        "font-mono text-xs font-medium tracking-[0.16em] uppercase",
        eyebrowTone[tone],
        className
      )}
    >
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "neutral",
  align = "left",
  id,
  className,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  tone?: Tone
  align?: "left" | "center"
  id?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className="text-ink mt-3 text-[2rem] leading-[1.1] font-semibold sm:text-[2.6rem]"
      >
        {title}
      </h2>
      {description && (
        <p className="text-ink-soft mt-4 text-lg leading-relaxed">{description}</p>
      )}
    </div>
  )
}
