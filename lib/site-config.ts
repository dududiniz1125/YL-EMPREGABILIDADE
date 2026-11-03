/**
 * Todos os dados editáveis do site num só lugar.
 * Altere aqui e o site inteiro se atualiza.
 */
export const siteConfig = {
  name: "YL Empregabilidade",
  shortName: "YL",
  tagline: "Pontes entre talentos e oportunidades",
  description:
    "Plataforma de recolocação profissional que conecta pessoas em busca de emprego a empresas com vagas abertas, de forma eficiente e humana.",

  // URL pública. Em produção, defina NEXT_PUBLIC_SITE_URL (ex.: https://ylempregabilidade.com.br)
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://yl-empregabilidade.vercel.app").replace(/\/$/, ""),

  // Contato
  email: "ylempregabilidade@gmail.com",
  whatsapp: "" as string, // só números com DDI+DDD, ex.: "5511999999999" (vazio = esconde o botão flutuante)
  whatsappMessage: "Olá! Vim pelo site da YL Empregabilidade e gostaria de mais informações.",
  phone: "" as string, // ex.: "(11) 99999-9999" — vazio = não aparece
  address: "" as string, // vazio = não aparece
  city: "São Paulo, SP",
  cnpj: "48.294.895/0001-40",

  // Formulários (Formspree)
  formspree: {
    candidato: "https://formspree.io/f/xoeekjwa",
    empresa: "https://formspree.io/f/mvkkwzrg",
  },

  // Áreas/funções atendidas (a confirmar com o cliente)
  areas: [
    "Garçom / Garçonete",
    "Cumim",
    "Cozinheiro(a)",
    "Auxiliar de cozinha",
    "Atendimento",
    "Outra",
  ],
  // Palavras que giram no título do topo
  rotatingRoles: ["garçons", "cozinheiros", "cumins", "talentos"],

  // Mensagens de sucesso dos formulários
  messages: {
    candidatoSucesso:
      "Recebemos seu cadastro! Em breve você recebe o link da provinha pelo WhatsApp.",
    empresaSucesso:
      "Recebemos sua vaga! Nossa equipe vai entrar em contato para confirmar os detalhes.",
  },

  // Números: só aparecem se enabled === true (use apenas valores reais)
  stats: {
    enabled: false as boolean,
    candidatos: 0 as number,
    vagas: 0 as number,
    contratacoes: 0 as number,
    empresas: 0 as number,
  },

  // Funcionalidades futuras
  features: {
    login: false as boolean, // liga a área de login quando houver autenticação de verdade
    depoimentos: false as boolean, // liga a seção de depoimentos (preencha `depoimentos` abaixo)
  },

  // Depoimentos reais (vazio por enquanto — não invente)
  depoimentos: [] as { nome: string; funcao: string; texto: string }[],

  privacyUpdatedAt: "Novembro de 2026",
} as const

export type SiteConfig = typeof siteConfig

export function whatsappLink(message: string = siteConfig.whatsappMessage) {
  if (!siteConfig.whatsapp) return null
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`
}
