import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/site/footer"
import { Navbar } from "@/components/site/navbar"
import { Eyebrow } from "@/components/site/section-heading"
import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: `Como a ${siteConfig.name} coleta, usa e protege seus dados pessoais, conforme a LGPD.`,
  alternates: { canonical: "/privacidade/" },
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-ink mt-12 text-2xl font-semibold">{children}</h2>
}

export default function PrivacidadePage() {
  return (
    <>
      <Navbar onHome={false} />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <Eyebrow>Privacidade · LGPD</Eyebrow>
        <h1 className="text-ink mt-3 text-4xl font-semibold sm:text-5xl">Política de Privacidade</h1>
        <p className="text-ink-soft mt-4">
          <strong className="text-ink">Última atualização:</strong> {siteConfig.privacyUpdatedAt}
        </p>

        <div className="text-ink-soft [&_li]:mt-1.5 [&_p]:mt-4 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
          <H2>1. Quem somos</H2>
          <p>
            A {siteConfig.name} (CNPJ {siteConfig.cnpj}), com sede em {siteConfig.city}, é uma
            plataforma de recolocação profissional que conecta candidatos a empresas. Somos a
            controladora dos dados pessoais tratados por meio deste site.
          </p>

          <H2>2. Dados que coletamos</H2>
          <p>Coletamos somente os dados que você informa nos formulários do site:</p>
          <p className="text-ink font-semibold">Cadastro de candidato</p>
          <ul>
            <li>Nome completo, WhatsApp e, se você quiser, e-mail;</li>
            <li>Cidade e bairro (não pedimos endereço completo);</li>
            <li>Área de interesse;</li>
            <li>Até 3 experiências anteriores (empresa, função e tempo), se informadas;</li>
            <li>Pretensão salarial e disponibilidade de turno, se informadas.</li>
          </ul>
          <p className="text-ink font-semibold">Publicação de vaga (empresas)</p>
          <ul>
            <li>Nome da empresa, CNPJ (opcional), nome do responsável, WhatsApp e e-mail;</li>
            <li>
              Dados da vaga: título, área/função, número de vagas, local de trabalho, data e horário
              da entrevista, salário/faixa e descrição.
            </li>
          </ul>
          <p>
            Também registramos a sua concordância com esta política no momento do envio. Este site
            não usa cookies de rastreamento nem ferramentas de publicidade.
          </p>

          <H2>3. Como usamos seus dados</H2>
          <p>
            Usamos os dados exclusivamente para conectar candidatos a oportunidades de emprego
            compatíveis com seu perfil, enviar a provinha online da área escolhida, avisar sobre
            vagas e entrevistas (principalmente pelo WhatsApp) e informar às empresas sobre
            candidatos disponíveis. Não vendemos seus dados.
          </p>

          <H2>4. Com quem compartilhamos</H2>
          <ul>
            <li>
              <strong className="text-ink">Empresas com vagas compatíveis:</strong> apresentamos o perfil
              do candidato às empresas que têm vagas alinhadas à área de interesse dele.
            </li>
            <li>
              <strong className="text-ink">Formspree</strong>: serviço usado como operador para receber e
              encaminhar o envio dos formulários deste site até a nossa equipe.
            </li>
            <li>
              <strong className="text-ink">Ferramentas de comunicação e gestão</strong> que usamos na
              operação (como a plataforma de atendimento por WhatsApp e os painéis de acompanhamento),
              sempre para as finalidades descritas aqui.
            </li>
            <li>Autoridades, quando exigido por lei.</li>
          </ul>

          <H2>5. Base legal (LGPD)</H2>
          <p>
            O tratamento é feito com base no seu consentimento (Art. 7º, I, da Lei 13.709/2018) e
            na execução de procedimentos preliminares relacionados a um contrato de trabalho do qual
            você seja parte (Art. 7º, V). Você pode revogar o consentimento a qualquer momento.
          </p>

          <H2>6. Por quanto tempo guardamos</H2>
          <p>
            Mantemos os dados enquanto o seu cadastro estiver ativo ou pelo tempo necessário para as
            finalidades acima. Você pode pedir a exclusão quando quiser.
          </p>

          <H2>7. Seus direitos</H2>
          <p>
            Nos termos da LGPD, você pode: confirmar se tratamos seus dados; acessá-los; corrigir
            dados incompletos ou desatualizados; pedir anonimização, bloqueio ou eliminação de dados
            desnecessários; pedir a portabilidade; saber com quem compartilhamos; e revogar seu
            consentimento.
          </p>

          <H2>8. Contato</H2>
          <p>
            Para exercer seus direitos ou tirar dúvidas sobre esta política, escreva para{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-sprout-deep font-semibold underline underline-offset-2">
              {siteConfig.email}
            </a>
            .
          </p>
        </div>

        <Link
          href="/"
          className="border-line text-ink hover:bg-paper-dim mt-14 inline-flex h-12 items-center rounded-full border bg-white px-6 font-semibold"
        >
          ← Voltar ao início
        </Link>
      </main>
      <Footer onHome={false} />
    </>
  )
}
