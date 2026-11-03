import { Building2, Sprout, Users } from "lucide-react"

import { BlurFade } from "@/components/magicui/blur-fade"
import { TextAnimate } from "@/components/magicui/text-animate"
import { Eyebrow, SectionHeading } from "@/components/site/section-heading"
import { ValuesCards } from "@/components/sections/values-cards"

const story = [
  {
    icon: Users,
    tag: "De um lado",
    tone: "text-sprout-deep bg-sprout-soft",
    text: "No fim da pandemia, muita gente tinha perdido o emprego e enfrentava grandes dificuldades para voltar ao mercado de trabalho.",
  },
  {
    icon: Building2,
    tag: "Do outro lado",
    tone: "text-seed bg-seed-soft",
    text: "Ao mesmo tempo, várias empresas tinham vagas abertas, mas não conseguiam chegar até o candidato ideal.",
  },
  {
    icon: Sprout,
    tag: "Então nasceu a YL",
    tone: "text-amber-deep bg-amber-soft",
    text: "A YL Empregabilidade surgiu para conectar talentos às oportunidades certas, aproximando empresas e profissionais de forma eficiente e humana.",
  },
]

const mission =
  "Criar pontes sólidas entre empresas e candidatos, promovendo oportunidades, desenvolvimento profissional e relações de confiança no mercado de trabalho."

export function QuemSomos() {
  return (
    <section id="quem-somos" aria-labelledby="quem-somos-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="quem-somos-title"
          eyebrow="Quem somos"
          title="De um momento difícil, nasceu uma ponte."
          description="Uma semente plantada num período de crise, que hoje cresce a cada pessoa recolocada."
        />

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3 md:gap-5">
          {story.map((s, i) => (
            <li key={s.tag} className="relative">
              {i < story.length - 1 && (
                <span
                  aria-hidden
                  className="from-sprout/60 to-amber/60 absolute top-7 right-[-1.25rem] left-[4.5rem] hidden h-0.5 rounded-full bg-gradient-to-r md:block"
                />
              )}
              <BlurFade inView delay={i * 0.15} className="h-full">
                <div className="flex h-full flex-col">
                  <span
                    className={`relative z-10 inline-flex size-14 items-center justify-center rounded-2xl ring-8 ring-[var(--paper)] ${s.tone}`}
                  >
                    <s.icon className="size-6" aria-hidden strokeWidth={1.8} />
                  </span>
                  <h3 className="text-ink mt-5 text-xl font-semibold">{s.tag}</h3>
                  <p className="text-ink-soft mt-2 text-[1.05rem] leading-relaxed">{s.text}</p>
                </div>
              </BlurFade>
            </li>
          ))}
        </ol>

        <figure className="bg-ink text-paper relative mt-20 overflow-hidden rounded-[2rem] px-6 py-12 sm:px-14 sm:py-16">
          <div aria-hidden className="absolute -top-40 -right-40 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(125_190_60/0.3),transparent)]" />
          <div aria-hidden className="absolute -bottom-40 -left-32 size-[380px] rounded-full bg-[radial-gradient(closest-side,rgb(226_163_61/0.22),transparent)]" />
          <Eyebrow className="text-amber relative">Nossa missão</Eyebrow>
          <blockquote className="relative mt-5">
            <TextAnimate
              as="p"
              by="word"
              animation="blurInUp"
              startOnView
              once
              duration={0.9}
              className="font-display text-[1.6rem] leading-snug font-medium sm:text-[2.3rem]"
            >
              {`“${mission}”`}
            </TextAnimate>
          </blockquote>
          <figcaption className="text-paper/70 relative mt-6 text-sm">
            Missão da YL Empregabilidade
          </figcaption>
        </figure>

        <div className="mt-20">
          <SectionHeading
            eyebrow="O que nos guia"
            title="Três compromissos por trás de cada conexão"
            className="mb-10"
          />
          <ValuesCards />
        </div>
      </div>
    </section>
  )
}
