import { Building2, Clock, MessageCircle, UserRound } from "lucide-react"

import { SectionHeading } from "@/components/site/section-heading"
import { siteConfig } from "@/lib/site-config"

/**
 * Área de acesso. Enquanto `features.login` estiver desligada, mostra o aviso
 * "em breve" (sem simular um login que não funciona). Quando houver autenticação
 * real, ligue a flag e conecte os cards abaixo ao sistema.
 */
export function Acesso() {
  if (siteConfig.features.login) {
    return (
      <section id="acesso" aria-labelledby="acesso-title" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading id="acesso-title" eyebrow="Acesso" title="Entre na sua conta" />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              { icon: UserRound, title: "Área do candidato", text: "Acompanhe suas inscrições e entrevistas.", href: "#" },
              { icon: Building2, title: "Área da empresa", text: "Acompanhe suas vagas e os inscritos.", href: "#" },
            ].map((c) => (
              <a key={c.title} href={c.href} className="border-line bg-card rounded-3xl border p-7 shadow-[var(--shadow-soft)]">
                <c.icon className="text-sprout-deep size-7" aria-hidden />
                <h3 className="mt-4 text-2xl font-semibold">{c.title}</h3>
                <p className="text-ink-soft mt-1">{c.text}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="acesso" aria-labelledby="acesso-title" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-line bg-card grid items-center gap-8 rounded-[2rem] border p-6 shadow-[var(--shadow-soft)] sm:p-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="bg-amber-soft text-amber-deep inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
              <Clock className="size-4" aria-hidden /> Em breve
            </span>
            <h2 id="acesso-title" className="text-ink mt-4 text-2xl font-semibold sm:text-3xl">
              Área do candidato e da empresa
            </h2>
            <p className="text-ink-soft mt-3 text-lg leading-relaxed">
              Estamos preparando um espaço para você acompanhar inscrições, vagas e entrevistas.
              Por enquanto, todo o acompanhamento é feito pelo WhatsApp, de forma próxima e rápida.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="#candidatos"
              className="bg-sprout-deep inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold text-white"
            >
              <UserRound className="size-4" aria-hidden /> Fazer meu cadastro
            </a>
            <a
              href="#empresas"
              className="border-seed/40 text-seed-deep hover:bg-seed-soft inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 bg-white px-6 font-semibold"
            >
              <Building2 className="size-4" aria-hidden /> Publicar uma vaga
            </a>
            <p className="text-ink-soft mt-1 flex items-center justify-center gap-2 text-sm">
              <MessageCircle className="size-4" aria-hidden /> Retorno pelo WhatsApp
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
