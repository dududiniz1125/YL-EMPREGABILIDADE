import { CheckCircle2, Smartphone } from "lucide-react"

import { BlurFade } from "@/components/magicui/blur-fade"
import { ShineBorder } from "@/components/magicui/shine-border"
import { LazyCandidatoForm } from "@/components/forms/lazy-forms"
import { SectionHeading } from "@/components/site/section-heading"

const perks = [
  "Cadastro gratuito e rápido",
  "Provinha online da sua área",
  "Aviso de vagas compatíveis pelo WhatsApp",
]

export function Candidatos() {
  return (
    <section id="candidatos" aria-labelledby="candidatos-title" className="relative overflow-x-clip py-20 sm:py-28">
      <div aria-hidden className="absolute top-10 -left-40 -z-10 size-[560px] rounded-full bg-[radial-gradient(closest-side,rgb(125_190_60/0.14),transparent)]" />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 [&>*]:min-w-0">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="candidatos-title"
            tone="candidato"
            eyebrow="Para candidatos"
            title={
              <>
                Seu recomeço <span className="text-sprout-deep italic">começa aqui.</span>
              </>
            }
            description="Conte um pouco sobre você e a área em que quer trabalhar. A gente cuida de levar o seu perfil até as empresas certas."
          />
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="text-ink flex items-center gap-3 font-medium">
                <CheckCircle2 className="text-sprout-deep size-5 shrink-0" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <p className="text-ink-soft border-line mt-8 flex items-start gap-3 rounded-2xl border bg-white/60 p-4 text-sm">
            <Smartphone className="text-sprout-deep mt-0.5 size-5 shrink-0" aria-hidden />
            Dá para preencher tudo pelo celular. Leva uns 3 minutos.
          </p>
        </div>

        <BlurFade inView>
          <div className="bg-card relative rounded-[2rem] p-5 shadow-[var(--shadow-lift)] sm:p-9">
            <ShineBorder borderWidth={2} duration={16} shineColor={["#7dbe3c", "#e2a33d", "#3f6e1f"]} />
            <LazyCandidatoForm />
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
