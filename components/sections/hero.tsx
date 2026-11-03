import { ArrowRight } from "lucide-react"

import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { BlurFade } from "@/components/magicui/blur-fade"
import { DotPattern } from "@/components/magicui/dot-pattern"
import { ShimmerLink } from "@/components/magicui/shimmer-button"
import { WordRotate } from "@/components/magicui/word-rotate"
import { HeroBridge } from "@/components/sections/hero-bridge"
import { siteConfig } from "@/lib/site-config"

export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate -mt-[72px] overflow-hidden pt-[72px]"
    >
      <DotPattern
        width={22}
        height={22}
        cr={1.1}
        className="fill-ink/15 -z-10 [mask-image:radial-gradient(640px_circle_at_30%_35%,white,transparent)]"
      />
      <div
        aria-hidden
        className="absolute -top-56 -left-48 -z-10 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(125_190_60/0.2),transparent)]"
      />
      <div
        aria-hidden
        className="absolute top-0 -right-56 -z-10 size-[600px] rounded-full bg-[radial-gradient(closest-side,rgb(226_163_61/0.18),transparent)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-20 lg:pb-24">
        <div>
          <BlurFade delay={0.05}>
            <div className="border-line inline-flex items-center rounded-full border bg-white/70 px-3.5 py-1.5 shadow-sm">
              <span className="bg-sprout mr-2 size-2 rounded-full" aria-hidden />
              <AnimatedShinyText className="text-ink-soft/90 via-ink mx-0 text-sm font-medium">
                Plataforma de recolocação profissional
              </AnimatedShinyText>
            </div>
          </BlurFade>

          {/* h1 e subtítulo sem fade: aparecem já no HTML (melhor LCP) */}
          <h1
              id="hero-title"
              className="text-ink mt-6 text-[2.6rem] leading-[1.05] font-semibold sm:text-6xl lg:text-[4.1rem]"
            >
              Conectamos{" "}
              <span className="sr-only">{siteConfig.rotatingRoles.join(", ")}</span>
              <span aria-hidden className="text-sprout-deep block italic">
                <WordRotate
                  words={[...siteConfig.rotatingRoles]}
                  duration={2600}
                  motionProps={{
                    initial: { opacity: 0, y: 24, filter: "blur(4px)" },
                    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
                    exit: { opacity: 0, y: -24, filter: "blur(4px)" },
                    transition: { duration: 0.35, ease: "easeOut" },
                  }}
                />
              </span>
              às oportunidades certas.
          </h1>

          <p className="text-ink-soft mt-6 max-w-xl text-lg leading-relaxed sm:text-xl">
              De um lado, gente pronta para recomeçar. Do outro, empresas com vagas abertas.
              A YL é a ponte entre os dois, com eficiência e um olhar humano.
          </p>

          <BlurFade delay={0.28}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ShimmerLink
                href="#candidatos"
                background="#3f6e1f"
                shimmerColor="#d9f0b8"
                className="h-13 px-7 text-base font-semibold shadow-[0_10px_24px_-10px_rgb(63_110_31/0.7)]"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  Quero uma vaga <ArrowRight className="size-4" aria-hidden />
                </span>
              </ShimmerLink>
              <a
                href="#empresas"
                className="border-seed/35 text-seed-deep hover:bg-seed-soft inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 bg-white/70 px-7 text-base font-semibold transition-colors"
              >
                Quero contratar
              </a>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={0.3} className="w-full">
          <HeroBridge />
        </BlurFade>
      </div>
    </section>
  )
}
