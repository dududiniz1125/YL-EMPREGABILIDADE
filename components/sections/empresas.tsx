import Link from "next/link"
import { ArrowRight, BadgeCheck, CalendarClock, Users } from "lucide-react"

import { BlurFade } from "@/components/magicui/blur-fade"
import { ShineBorder } from "@/components/magicui/shine-border"
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
            <h3 className="text-ink text-2xl font-semibold sm:text-3xl">Cadastre sua empresa</h3>
            <ol className="mt-6 space-y-4">
              {[
                ["Crie a conta da empresa", "Dados da empresa, do responsável e uma senha."],
                ["Publique suas vagas", "Função, salário, local e data/horário da entrevista."],
                ["Receba os inscritos", "Candidatos com nota da provinha e experiências. O WhatsApp libera na etapa de entrevista."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="bg-seed font-display flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-ink font-semibold">{t}</p>
                    <p className="text-ink-soft">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-ink-soft bg-seed-soft/70 mt-6 rounded-2xl p-4 text-[0.95rem]">
              Nossa equipe confere cada empresa e cada vaga antes de publicar. Enquanto isso, você já pode preparar suas vagas.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro/empresa/"
                className="bg-seed hover:bg-seed-deep inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-lg font-semibold text-white shadow-[0_10px_24px_-12px_rgb(138_75_30/0.8)]"
              >
                Cadastrar empresa <ArrowRight className="size-5" aria-hidden />
              </Link>
              <Link
                href="/entrar/?tipo=empresa"
                className="border-line text-ink hover:bg-paper-dim inline-flex h-14 items-center justify-center rounded-full border bg-white px-6 font-semibold"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
