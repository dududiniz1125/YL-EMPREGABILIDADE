import { NumberTicker } from "@/components/magicui/number-ticker"
import { SectionHeading } from "@/components/site/section-heading"
import { siteConfig } from "@/lib/site-config"

/** Só aparece com stats.enabled = true e valores reais no site-config. */
export function Numeros() {
  const s = siteConfig.stats
  if (!s.enabled) return null
  const items = [
    { label: "candidatos cadastrados", value: s.candidatos },
    { label: "vagas abertas", value: s.vagas },
    { label: "contratações", value: s.contratacoes },
    { label: "empresas parceiras", value: s.empresas },
  ].filter((i) => i.value > 0)
  if (!items.length) return null

  return (
    <section aria-labelledby="numeros-title" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="numeros-title" eyebrow="Em números" title="A ponte em movimento" align="center" />
        <dl className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((i) => (
            <div key={i.label} className="border-line bg-card flex flex-col-reverse rounded-3xl border p-6 text-center shadow-[var(--shadow-soft)]">
              <dt className="text-ink-soft mt-1 text-sm font-medium">{i.label}</dt>
              <dd className="font-display text-sprout-deep text-4xl font-semibold sm:text-5xl">
                <NumberTicker value={i.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
