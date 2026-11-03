"use client"

import { Gauge, HeartHandshake, ShieldCheck } from "lucide-react"

import { BlurFade } from "@/components/magicui/blur-fade"
import { MagicCard } from "@/components/magicui/magic-card"

const values = [
  {
    icon: Gauge,
    title: "Eficiência",
    text: "Processos simples, claros e rápidos, dos dois lados da ponte.",
  },
  {
    icon: HeartHandshake,
    title: "Humanidade",
    text: "Por trás de cada vaga e de cada currículo existe uma pessoa. É isso que guia como trabalhamos.",
  },
  {
    icon: ShieldCheck,
    title: "Confiança",
    text: "Relações de longo prazo entre empresas e profissionais, construídas com transparência.",
  },
]

export function ValuesCards() {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {values.map((v, i) => (
        <li key={v.title}>
          <BlurFade inView delay={i * 0.08} className="h-full">
            <MagicCard
              className="h-full rounded-3xl shadow-[var(--shadow-soft)] [--color-background:var(--card-bg)]"
              gradientColor="#e7f1da"
              gradientOpacity={0.9}
              gradientFrom="#7dbe3c"
              gradientTo="#e2a33d"
              gradientSize={260}
            >
              <div className="p-7">
                <span className="bg-sprout-soft text-sprout-deep inline-flex size-12 items-center justify-center rounded-2xl">
                  <v.icon className="size-6" aria-hidden strokeWidth={1.8} />
                </span>
                <h3 className="text-ink mt-5 text-2xl font-semibold">{v.title}</h3>
                <p className="text-ink-soft mt-2 leading-relaxed">{v.text}</p>
              </div>
            </MagicCard>
          </BlurFade>
        </li>
      ))}
    </ul>
  )
}
