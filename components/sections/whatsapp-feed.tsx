"use client"

import { BellRing, CalendarCheck, ClipboardCheck, Sprout } from "lucide-react"

import { AnimatedList } from "@/components/magicui/animated-list"

const notifications = [
  { icon: Sprout, title: "Cadastro recebido", body: "Bem-vindo(a) à YL! Aqui está o link da sua provinha.", time: "agora" },
  { icon: ClipboardCheck, title: "Provinha concluída", body: "Obrigado! Seu perfil já está disponível para as empresas.", time: "2 min" },
  { icon: BellRing, title: "Nova vaga de garçom perto de você", body: "Turno noite · zona oeste. Quer participar?", time: "5 min" },
  { icon: CalendarCheck, title: "Entrevista confirmada", body: "Quinta-feira, 14h. Boa sorte!", time: "8 min" },
]

export function WhatsappFeed() {
  return (
    <div className="relative h-[300px] overflow-hidden" aria-hidden>
      <AnimatedList delay={1800} className="gap-3">
        {notifications.map((n) => (
          <div
            key={n.title}
            className="border-line/80 flex w-full items-start gap-3 rounded-2xl border bg-white p-3 shadow-[var(--shadow-soft)]"
          >
            <span className="bg-sprout-soft text-sprout-deep flex size-9 shrink-0 items-center justify-center rounded-xl">
              <n.icon className="size-4.5" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-ink truncate text-sm font-semibold">{n.title}</p>
                <span className="text-ink-soft shrink-0 text-[0.7rem]">{n.time}</span>
              </div>
              <p className="text-ink-soft text-[0.82rem] leading-snug">{n.body}</p>
            </div>
          </div>
        ))}
      </AnimatedList>
      <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t" />
    </div>
  )
}
