import { Footer } from "@/components/site/footer"
import { Navbar } from "@/components/site/navbar"
import { WhatsappFloat } from "@/components/site/whatsapp-float"
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

// Regenera a cada 5 min (áreas, contatos e números vêm do banco)
export const revalidate = 300

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
        <CtaFinal />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  )
}
