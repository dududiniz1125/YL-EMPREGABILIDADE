import { BarChart3, BellRing, CalendarCheck, ClipboardCheck, ClipboardList, Headset, Mail, MailCheck } from "lucide-react"

import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { SectionHeading } from "@/components/site/section-heading"
import { getPublicConfig } from "@/lib/public-config"
import { cn } from "@/lib/utils"

function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "bg-card border-line/80 relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 shadow-[var(--shadow-soft)] sm:p-8",
        className
      )}
    >
      {children}
    </div>
  )
}

function CardIcon({ icon: Icon, className }: { icon: typeof ClipboardList; className?: string }) {
  return (
    <span className={cn("inline-flex size-12 items-center justify-center rounded-2xl", className)}>
      <Icon className="size-6" aria-hidden strokeWidth={1.8} />
    </span>
  )
}

export async function Sistema() {
  const { areas: all } = await getPublicConfig()
  const areas = all.filter((a) => a !== "Outra")
  return (
    <section id="sistema" aria-labelledby="sistema-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="sistema-title"
          eyebrow="Por trás da plataforma"
          title="Ferramentas que fazem a ponte funcionar"
          description="Avaliação, comunicação e acompanhamento integrados, para que cada conexão seja rápida e certeira."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-[auto_auto] [&>*]:min-w-0">
          {/* Provas por área — destaque */}
          <BlurFade inView className="md:col-span-2">
            <Card className="bg-sprout-soft/40">
              <BorderBeam size={120} duration={9} colorFrom="#7dbe3c" colorTo="#e2a33d" borderWidth={2} />
              <div className="flex items-center gap-3">
                <CardIcon icon={ClipboardList} className="bg-sprout-deep text-white" />
                <span className="bg-amber-soft text-amber-deep rounded-full px-3 py-1 text-xs font-semibold">
                  Nosso diferencial
                </span>
              </div>
              <h3 className="text-ink mt-5 text-2xl font-semibold sm:text-3xl">Provas por área</h3>
              <p className="text-ink-soft mt-2 max-w-xl leading-relaxed">
                Testes online por área de atuação avaliam o conhecimento técnico antes da entrevista.
                A empresa recebe candidatos já triados, e o candidato mostra o que sabe fazer.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Exemplos de áreas com prova">
                {areas.map((a) => (
                  <li
                    key={a}
                    className="border-sprout/40 text-sprout-deep rounded-full border bg-white px-3 py-1.5 text-sm font-medium"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </Card>
          </BlurFade>

          {/* Avisos por e-mail */}
          <BlurFade inView delay={0.08} className="md:row-span-2">
            <Card>
              <CardIcon icon={Mail} className="bg-sprout-soft text-sprout-deep" />
              <h3 className="text-ink mt-5 text-2xl font-semibold">Avisos por e-mail</h3>
              <p className="text-ink-soft mt-2 leading-relaxed">
                Cada etapa importante chega no seu e-mail, e tudo também fica registrado na sua área da plataforma.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  [MailCheck, "Confirmação do cadastro"],
                  [ClipboardCheck, "Provinha liberada na sua área"],
                  [BellRing, "Vaga compatível com o seu perfil"],
                  [CalendarCheck, "Convite para entrevista"],
                ].map(([Icon, label]) => {
                  const I = Icon as typeof Mail
                  return (
                    <li
                      key={label as string}
                      className="border-line/80 flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-[var(--shadow-soft)]"
                    >
                      <span className="bg-sprout-soft text-sprout-deep flex size-9 shrink-0 items-center justify-center rounded-xl">
                        <I className="size-4.5" strokeWidth={2} aria-hidden />
                      </span>
                      <span className="text-ink text-sm font-semibold">{label as string}</span>
                    </li>
                  )
                })}
              </ul>
              <p className="text-ink-soft mt-auto pt-6 text-sm">
                Dúvidas? Nossa equipe responde por e-mail, de pessoa para pessoa.
              </p>
            </Card>
          </BlurFade>

          {/* Power BI */}
          <BlurFade inView delay={0.12}>
            <Card>
              <CardIcon icon={BarChart3} className="bg-amber-soft text-amber-deep" />
              <h3 className="text-ink mt-5 text-xl font-semibold">Dashboards e métricas</h3>
              <p className="text-ink-soft mt-2 leading-relaxed">
                Com o Power BI, acompanhamos candidatos disponíveis por função, contratações e o
                desempenho de cada processo.
              </p>
              <div aria-hidden className="mt-6 flex h-16 items-end gap-2">
                {[40, 65, 50, 85, 70, 95].map((h, i) => (
                  <span
                    key={i}
                    className={cn("flex-1 rounded-t-[4px]", i % 2 ? "bg-amber/70" : "bg-seed/45")}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </Card>
          </BlurFade>

          {/* Atendimento humano */}
          <BlurFade inView delay={0.16}>
            <Card>
              <CardIcon icon={Headset} className="bg-seed-soft text-seed" />
              <h3 className="text-ink mt-5 text-xl font-semibold">Atendimento humano</h3>
              <p className="text-ink-soft mt-2 leading-relaxed">
                Tecnologia ajuda, mas quem cuida de cada conexão são pessoas. Nossa equipe acompanha
                candidatos e empresas em cada etapa.
              </p>
            </Card>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
