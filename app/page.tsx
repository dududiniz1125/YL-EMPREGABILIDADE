import { Footer } from "@/components/site/footer"
import { Navbar } from "@/components/site/navbar"
import { WhatsappFloat } from "@/components/site/whatsapp-float"
import { Acesso } from "@/components/sections/acesso"
import { AreasMarquee } from "@/components/sections/areas-marquee"
import { Candidatos } from "@/components/sections/candidatos"
import { ComoFunciona } from "@/components/sections/como-funciona"
import { CtaFinal } from "@/components/sections/cta-final"
import { Depoimentos } from "@/components/sections/depoimentos"
import { Empresas } from "@/components/sections/empresas"
import { Hero } from "@/components/sections/hero"
import { Numeros } from "@/components/sections/numeros"
import { QuemSomos } from "@/components/sections/quem-somos"
import { Sistema } from "@/components/sections/sistema"

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="conteudo">
        <Hero />
        <AreasMarquee />
        <QuemSomos />
        <ComoFunciona />
        <Sistema />
        <Numeros />
        <Depoimentos />
        <Candidatos />
        <Empresas />
        <Acesso />
        <CtaFinal />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  )
}
