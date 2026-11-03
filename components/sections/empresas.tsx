import { BadgeCheck, CalendarClock, Users } from "lucide-react"

import { BlurFade } from "@/components/magicui/blur-fade"
import { ShineBorder } from "@/components/magicui/shine-border"
import { LazyEmpresaForm } from "@/components/forms/lazy-forms"
import { SectionHeading } from "@/components/site/section-heading"

const perks = [
  { icon: BadgeCheck, text: "Candidatos avaliados pela provinha da área" },
  { icon: CalendarClock, text: "Entrevistas no dia e horário que você definir" },
  { icon: Users, text: "Acompanhamento dos inscritos com a nossa equipe" },
]

export function Empresas() {
  return (
    <section
      id="empresas"
      aria-labelledby="empresas-title"
      className="bg-seed-soft/40 border-line/60 relative border-y py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 [&>*]:min-w-0">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="empresas-title"
            tone="empresa"
            eyebrow="Para empresas"
            title={
              <>
                Encontre as pessoas <span className="text-seed italic">certas</span> para a sua equipe.
              </>
            }
            description="Publique sua vaga com data e horário de entrevista. Nós levamos até você candidatos que já passaram pela provinha da área."
          />
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p.text} className="text-ink flex items-center gap-3 font-medium">
                <p.icon className="text-seed size-5 shrink-0" aria-hidden />
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <BlurFade inView>
          <div className="bg-card relative rounded-[2rem] p-5 shadow-[var(--shadow-lift)] sm:p-9">
            <ShineBorder borderWidth={2} duration={16} shineColor={["#8a4b1e", "#e2a33d", "#5c3414"]} />
            <LazyEmpresaForm />
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
