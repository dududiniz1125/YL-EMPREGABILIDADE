import { Marquee } from "@/components/magicui/marquee"
import { SectionHeading } from "@/components/site/section-heading"
import { siteConfig } from "@/lib/site-config"

/** Pronto para uso: ligue features.depoimentos e preencha `depoimentos` com relatos reais. */
export function Depoimentos() {
  const list = siteConfig.depoimentos
  if (!siteConfig.features.depoimentos || list.length === 0) return null
  return (
    <section aria-labelledby="depoimentos-title" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="depoimentos-title" eyebrow="Quem atravessou a ponte" title="Histórias de recomeço" />
      </div>
      <div className="relative mt-10">
        <Marquee pauseOnHover className="[--duration:45s]">
          {list.map((d) => (
            <figure key={d.nome} className="border-line bg-card w-80 rounded-3xl border p-6 shadow-[var(--shadow-soft)]">
              <blockquote className="text-ink leading-relaxed">“{d.texto}”</blockquote>
              <figcaption className="text-ink-soft mt-4 text-sm">
                <strong className="text-ink">{d.nome}</strong> · {d.funcao}
              </figcaption>
            </figure>
          ))}
        </Marquee>
        <div aria-hidden className="from-paper pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r" />
        <div aria-hidden className="from-paper pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l" />
      </div>
    </section>
  )
}
