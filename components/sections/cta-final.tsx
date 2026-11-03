import { ArrowRight } from "lucide-react"

import { DotPattern } from "@/components/magicui/dot-pattern"

export function CtaFinal() {
  return (
    <section aria-labelledby="cta-title" className="px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="from-sprout-deep via-[#5d7a1f] to-amber-deep relative mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br px-6 py-16 text-center text-white sm:px-12 sm:py-20">
        <DotPattern
          width={20}
          height={20}
          className="fill-white/15 [mask-image:radial-gradient(420px_circle_at_center,white,transparent)]"
        />
        <p className="relative font-mono text-xs font-medium tracking-[0.16em] text-white/80 uppercase">
          Da semente à contratação
        </p>
        <h2 id="cta-title" className="relative mx-auto mt-4 max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">
          Pronto para atravessar a ponte?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/85">
          Seja para recomeçar ou para contratar, o primeiro passo leva só alguns minutos.
        </p>
        <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#candidatos"
            className="text-sprout-deep inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Sou candidato <ArrowRight className="size-4" aria-hidden />
          </a>
          <a
            href="#empresas"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 border-white/70 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            Sou empresa
          </a>
        </div>
      </div>
    </section>
  )
}
