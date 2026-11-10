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
            controladora dos dados pessoais tratados por meio deste site e da plataforma.
          </p>

          <H2>2. Dados que coletamos</H2>
          <p>Coletamos somente o que você informa ao criar sua conta e usar a plataforma:</p>
          <p className="text-ink font-semibold">Candidatos</p>
          <ul>
            <li>Nome completo, e-mail e senha (a senha é guardada de forma criptografada; ninguém da YL tem acesso a ela);</li>
            <li>Cidade e bairro (não pedimos endereço completo);</li>
            <li>Área principal e outras áreas de interesse;</li>
            <li>Até 3 experiências anteriores (empresa, função e tempo), se informadas;</li>
            <li>Pretensão salarial e disponibilidade de turno, se informadas;</li>
            <li>Respostas e nota da provinha online da área;</li>
            <li>Candidaturas às vagas e o andamento de cada uma;</li>
            <li>Data e hora em que você concordou com esta política.</li>
          </ul>
          <p className="text-ink font-semibold">Empresas</p>
          <ul>
            <li>Nome da empresa, CNPJ (opcional), bairro, nome do responsável, e-mail e senha;</li>
            <li>
              Dados das vagas: título, área/função, número de vagas, bairro, salário, data e horário da entrevista e
              descrição.
            </li>
          </ul>
          <p>
            Para manter você conectado, usamos apenas cookies essenciais de sessão. Este site não usa cookies de
            rastreamento nem ferramentas de publicidade.
          </p>

          <H2>3. Onde os dados ficam</H2>
          <p>
            Os dados ficam salvos em um banco de dados na plataforma <strong className="text-ink">Supabase</strong>,
            com acesso protegido por conta e senha e regras que limitam o que cada pessoa pode ver. O site é hospedado
            na <strong className="text-ink">Vercel</strong>. A cada novo cadastro, a equipe recebe um aviso por e-mail
            pelo <strong className="text-ink">Formspree</strong>, só com nome, área e cidade.
          </p>

          <H2>4. Como usamos seus dados</H2>
          <p>
            Usamos os dados exclusivamente para conectar candidatos a vagas compatíveis, aplicar a provinha da área,
            avisar sobre vagas e entrevistas por e-mail e apoiar as empresas na seleção. Não
            vendemos seus dados.
          </p>

          <H2>5. Quem tem acesso</H2>
          <ul>
            <li>
              <strong className="text-ink">Você:</strong> vê e edita o seu próprio cadastro, suas candidaturas e sua nota.
            </li>
            <li>
              <strong className="text-ink">Equipe YL:</strong> acessa os cadastros para fazer a ponte entre candidatos
              e empresas.
            </li>
            <li>
              <strong className="text-ink">Empresas:</strong> veem apenas os candidatos que se inscreveram nas vagas
              delas, e só nome, área, experiências e nota da prova. O e-mail do candidato só aparece para a empresa
              quando ele chega à etapa de entrevista. Empresas não veem cidade nem pretensão salarial.
            </li>
            <li>
              <strong className="text-ink">Fornecedores</strong> que operam a plataforma (Supabase, Vercel, Formspree e
              as ferramentas de e-mail e de painéis que usamos), sempre para as finalidades descritas
              aqui.
            </li>
            <li>Autoridades, quando exigido por lei.</li>
          </ul>

          <H2>6. Base legal (LGPD)</H2>
          <p>
            O tratamento é feito com base no seu consentimento (Art. 7º, I, da Lei 13.709/2018) e na execução de
            procedimentos preliminares relacionados a um contrato de trabalho (Art. 7º, V). Você pode revogar o
            consentimento a qualquer momento.
          </p>

          <H2>7. Seus direitos e como excluir sua conta</H2>
          <p>
            Nos termos da LGPD, você pode confirmar se tratamos seus dados, acessá-los, corrigi-los, pedir
            anonimização, bloqueio ou eliminação, pedir a portabilidade, saber com quem compartilhamos e revogar seu
            consentimento.
          </p>
          <p>
            <strong className="text-ink">Para excluir sua conta:</strong> candidatos podem fazer isso sozinhos em{" "}
            <em>Minha área → Perfil → Excluir minha conta</em>. A exclusão apaga na hora o cadastro, as candidaturas e
            a nota da prova. Empresas, ou quem preferir, podem pedir a exclusão pelo e-mail abaixo; atendemos no prazo
            previsto na LGPD. Mantemos os dados enquanto a conta estiver ativa.
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
