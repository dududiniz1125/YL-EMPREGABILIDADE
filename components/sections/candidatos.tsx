import Link from "next/link"
import { ArrowRight, CheckCircle2, Smartphone } from "lucide-react"

import { BlurFade } from "@/components/magicui/blur-fade"
import { ShineBorder } from "@/components/magicui/shine-border"
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
            <h3 className="text-ink text-2xl font-semibold sm:text-3xl">Crie sua conta em 3 passos</h3>
            <ol className="mt-6 space-y-4">
              {[
                ["Dados e contato", "Nome, WhatsApp, e-mail e a área em que quer trabalhar."],
                ["Experiência e pretensão", "Até 3 empregos anteriores, salário desejado e turnos."],
                ["Senha", "Crie sua senha para acompanhar tudo na sua área."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="bg-sprout-deep font-display flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-ink font-semibold">{t}</p>
                    <p className="text-ink-soft">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-ink-soft bg-sprout-soft/60 mt-6 rounded-2xl p-4 text-[0.95rem]">
              Depois do cadastro, você faz a <strong className="text-ink">provinha online</strong> da sua área e já pode se candidatar às vagas abertas.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro/candidato/"
                className="bg-sprout-deep hover:bg-sprout-deep/90 inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-lg font-semibold text-white shadow-[0_10px_24px_-12px_rgb(63_110_31/0.8)]"
              >
                Criar minha conta <ArrowRight className="size-5" aria-hidden />
              </Link>
              <Link
                href="/entrar/?tipo=candidato"
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
