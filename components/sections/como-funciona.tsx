"use client"

import { useRef } from "react"
import { motion, useScroll, useSpring } from "motion/react"
import {
  BadgeCheck,
  Briefcase,
  CalendarClock,
  ClipboardList,
  FileText,
  MessageCircle,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { SectionHeading } from "@/components/site/section-heading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type Step = { icon: LucideIcon; title: string; text: string }

const candidato: Step[] = [
  {
    icon: FileText,
    title: "Faça seu cadastro",
    text: "Informe seus dados de contato e até 3 experiências anteriores. Leva poucos minutos e dá para fazer pelo celular.",
  },
  {
    icon: Wallet,
    title: "Conte sua pretensão salarial",
    text: "Assim só chegam até você vagas que fazem sentido para o seu momento.",
  },
  {
    icon: ClipboardList,
    title: "Faça a provinha online da sua área",
    text: "Um teste rápido sobre a função que você busca (garçom, cumim, cozinha e outras), para mostrar o que você sabe.",
  },
  {
    icon: MessageCircle,
    title: "Receba o contato pelo WhatsApp",
    text: "Quando surgir uma vaga compatível com o seu perfil, a gente chama você pelo WhatsApp.",
  },
]

const empresa: Step[] = [
  {
    icon: CalendarClock,
    title: "Publique sua vaga",
    text: "Informe a função, o salário e a data e o horário da entrevista.",
  },
  {
    icon: BadgeCheck,
    title: "Receba candidatos já triados",
    text: "Os candidatos chegam até você já avaliados pela provinha da área.",
  },
  {
    icon: Briefcase,
    title: "Acompanhe os inscritos",
    text: "Veja quem se inscreveu em cada vaga e siga o processo até a contratação, com o apoio da nossa equipe.",
  },
]

function Steps({ steps, tone }: { steps: Step[]; tone: "candidato" | "empresa" }) {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const accent =
    tone === "candidato"
      ? { num: "bg-sprout-deep text-white", line: "bg-sprout-deep", icon: "text-sprout-deep" }
      : { num: "bg-seed text-white", line: "bg-seed", icon: "text-seed" }

  return (
    <ol ref={ref} className="relative mt-10 space-y-5">
      <div aria-hidden className="bg-line absolute top-6 bottom-6 left-6 w-0.5 sm:left-7" />
      <motion.div
        aria-hidden
        style={{ scaleY }}
        className={cn("absolute top-6 bottom-6 left-6 w-0.5 origin-top sm:left-7", accent.line)}
      />
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-5 sm:gap-7">
          <span
            className={cn(
              "font-display relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full text-xl font-semibold ring-8 ring-[var(--paper)] sm:size-14 sm:text-2xl",
              accent.num
            )}
          >
            {i + 1}
          </span>
          <div className="border-line/80 flex-1 rounded-2xl border bg-white/80 p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <div className="flex items-start gap-3">
              <s.icon className={cn("mt-1 size-5 shrink-0", accent.icon)} aria-hidden />
              <div>
                <h3 className="text-ink font-sans text-lg font-semibold">{s.title}</h3>
                <p className="text-ink-soft mt-1 leading-relaxed">{s.text}</p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function ComoFunciona() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-title"
      className="bg-paper-dim/60 border-line/60 border-y py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 [&>*]:min-w-0">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="como-funciona-title"
            eyebrow="Como funciona"
            title="Simples para quem procura. Simples para quem contrata."
            description="Escolha o seu lado da ponte e veja o passo a passo."
          />
        </div>

        <Tabs defaultValue="candidato" className="w-full gap-0">
          <TabsList
            aria-label="Escolha seu perfil"
            className="border-line h-auto w-full self-start rounded-full border bg-white p-1.5 shadow-sm sm:w-auto"
          >
            <TabsTrigger
              value="candidato"
              className="data-[state=active]:bg-sprout-deep text-ink-soft h-11 flex-1 gap-2 rounded-full px-3 text-[0.95rem] sm:px-5 font-semibold data-[state=active]:text-white data-[state=active]:shadow-sm sm:flex-none"
            >
              <UserRound aria-hidden /> Sou candidato
            </TabsTrigger>
            <TabsTrigger
              value="empresa"
              className="data-[state=active]:bg-seed text-ink-soft h-11 flex-1 gap-2 rounded-full px-3 text-[0.95rem] sm:px-5 font-semibold data-[state=active]:text-white data-[state=active]:shadow-sm sm:flex-none"
            >
              <Briefcase aria-hidden /> Sou empresa
            </TabsTrigger>
          </TabsList>
          <TabsContent value="candidato">
            <Steps steps={candidato} tone="candidato" />
            <a
              href="#candidatos"
              className="text-sprout-deep mt-8 ml-[4.25rem] inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline sm:ml-[5.25rem]"
            >
              Começar meu cadastro →
            </a>
          </TabsContent>
          <TabsContent value="empresa">
            <Steps steps={empresa} tone="empresa" />
            <a
              href="#empresas"
              className="text-seed mt-8 ml-[4.25rem] inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline sm:ml-[5.25rem]"
            >
              Publicar uma vaga →
            </a>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
