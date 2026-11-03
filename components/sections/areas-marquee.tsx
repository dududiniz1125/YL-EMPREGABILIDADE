import { Sprout } from "lucide-react"

import { Marquee } from "@/components/magicui/marquee"
import { siteConfig } from "@/lib/site-config"

export function AreasMarquee() {
  const areas = siteConfig.areas.filter((a) => a !== "Outra")
  return (
    <section aria-label="Áreas atendidas" className="border-line/70 border-y bg-white/50 py-5">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 sm:flex-row sm:gap-6 sm:px-6">
        <p className="text-ink-soft shrink-0 font-mono text-xs font-medium tracking-[0.14em] uppercase">
          Áreas atendidas
        </p>
        <div className="relative w-full overflow-hidden">
          <Marquee pauseOnHover repeat={3} className="[--duration:32s] [--gap:0.75rem]">
            {areas.map((a) => (
              <span
                key={a}
                className="border-line text-ink inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium whitespace-nowrap"
              >
                <Sprout className="text-sprout-deep size-4" aria-hidden />
                {a}
              </span>
            ))}
            <span className="border-amber/40 bg-amber-soft text-amber-deep inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap">
              e outras funções
            </span>
          </Marquee>
          <div aria-hidden className="from-paper pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r sm:w-20" />
          <div aria-hidden className="from-paper pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l sm:w-20" />
        </div>
      </div>
    </section>
  )
}
