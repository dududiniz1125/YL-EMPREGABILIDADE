import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * Logo da YL. Os arquivos em /public foram recortados do print enviado
 * (scripts/process-logo.py). Ideal: pedir ao cliente o logo em vetor (SVG).
 */
export function Logo({
  className,
  href = "/#inicio",
  withWordmark = true,
}: {
  className?: string
  href?: string
  withWordmark?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex min-h-11 items-center gap-2.5 rounded-lg", className)}
    >
      <Image
        src="/logo-mark-sm.webp"
        alt=""
        width={101}
        height={112}
        priority
        className="h-10 w-auto"
      />
      {!withWordmark && <span className="sr-only">YL Empregabilidade</span>}
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-ink text-lg font-semibold tracking-tight">
            YL
          </span>{" "}
          <span className="text-ink-soft text-[0.62rem] font-semibold tracking-[0.18em] uppercase">
            Empregabilidade
          </span>
        </span>
      )}
    </Link>
  )
}
