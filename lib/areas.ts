/**
 * Áreas/funções atendidas, agrupadas por categoria.
 * É a lista padrão (usada quando o banco ainda não tem a lista) e a base do
 * SQL de atualização. Depois, o admin edita em /admin/configuracoes.
 */
export type Categoria = { nome: string; areas: string[] }

export const OUTRA = "Outra"

export const CATEGORIAS_PADRAO: Categoria[] = [
  {
    nome: "Alimentação e hotelaria",
    areas: [
      "Garçom / Garçonete",
      "Cumim",
      "Cozinheiro(a)",
      "Auxiliar de cozinha",
      "Chapeiro(a)",
      "Pizzaiolo(a)",
      "Confeiteiro(a)",
      "Padeiro(a)",
      "Barista",
      "Bartender",
      "Copeiro(a)",
      "Recepcionista de hotel",
      "Camareiro(a)",
    ],
  },
  {
    nome: "Administrativo e escritório",
    areas: [
      "Auxiliar administrativo",
      "Assistente administrativo",
      "Recepcionista",
      "Secretário(a)",
      "Auxiliar de escritório",
      "Assistente financeiro",
      "Auxiliar de contabilidade",
      "Assistente de RH",
      "Analista administrativo",
      "Faturista",
      "Almoxarife",
    ],
  },
  {
    nome: "Comércio e vendas",
    areas: [
      "Vendedor(a)",
      "Vendedor(a) externo",
      "Representante comercial",
      "Consultor(a) de vendas",
      "Operador(a) de caixa",
      "Repositor(a)",
      "Promotor(a) de vendas",
      "Fiscal de loja",
      "Gerente de loja",
      "Estoquista",
    ],
  },
  {
    nome: "Educação e esportes",
    areas: [
      "Professor(a) de educação física",
      "Professor(a) de ensino fundamental",
      "Professor(a) de educação infantil",
      "Professor(a) de inglês",
      "Auxiliar de classe",
      "Monitor(a) escolar",
      "Personal trainer",
      "Instrutor(a) de academia",
      "Recreador(a)",
    ],
  },
  {
    nome: "Saúde",
    areas: [
      "Técnico(a) de enfermagem",
      "Enfermeiro(a)",
      "Cuidador(a) de idosos",
      "Auxiliar de saúde bucal",
      "Recepcionista de clínica",
      "Farmacêutico(a)",
      "Atendente de farmácia",
      "Fisioterapeuta",
    ],
  },
  {
    nome: "Limpeza e serviços gerais",
    areas: [
      "Auxiliar de limpeza",
      "Faxineiro(a)",
      "Diarista",
      "Zelador(a)",
      "Porteiro(a)",
      "Jardineiro(a)",
      "Lavador(a) de veículos",
    ],
  },
  {
    nome: "Logística e transporte",
    areas: [
      "Motorista",
      "Motorista de caminhão",
      "Entregador(a)",
      "Motoboy",
      "Auxiliar de logística",
      "Conferente",
      "Operador(a) de empilhadeira",
      "Ajudante de carga e descarga",
    ],
  },
  {
    nome: "Construção e manutenção",
    areas: [
      "Pedreiro(a)",
      "Servente de obras",
      "Eletricista",
      "Encanador(a)",
      "Pintor(a)",
      "Marceneiro(a)",
      "Técnico(a) de manutenção",
      "Mestre de obras",
    ],
  },
  {
    nome: "Beleza e estética",
    areas: ["Cabeleireiro(a)", "Manicure / Pedicure", "Barbeiro(a)", "Esteticista", "Maquiador(a)", "Depilador(a)"],
  },
  {
    nome: "Atendimento e telemarketing",
    areas: [
      "Atendente",
      "Operador(a) de telemarketing",
      "Atendente de SAC",
      "Operador(a) de cobrança",
      "Recepcionista de eventos",
    ],
  },
  {
    nome: "Tecnologia",
    areas: [
      "Suporte técnico / Help desk",
      "Técnico(a) de informática",
      "Desenvolvedor(a)",
      "Analista de sistemas",
      "Designer gráfico",
      "Social media",
    ],
  },
  {
    nome: "Segurança",
    areas: ["Vigilante", "Controlador(a) de acesso", "Agente de segurança", "Bombeiro(a) civil", "Monitor(a) de CFTV"],
  },
  {
    nome: "Indústria e produção",
    areas: [
      "Auxiliar de produção",
      "Operador(a) de máquinas",
      "Montador(a)",
      "Soldador(a)",
      "Torneiro(a) mecânico",
      "Inspetor(a) de qualidade",
      "Costureiro(a)",
    ],
  },
  { nome: "Outra", areas: [OUTRA] },
]

/** Lista plana (na ordem das categorias), com "Outra" no fim. */
export function flattenAreas(cats: Categoria[]): string[] {
  const all = cats.flatMap((c) => c.areas).filter((a) => a !== OUTRA)
  return [...Array.from(new Set(all)), OUTRA]
}

/** Remove acentos e caixa, para a busca. */
export function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
}

/** Formato de texto que o admin edita: "# Categoria" seguido de uma função por linha. */
export function categoriasToText(cats: Categoria[]) {
  return cats
    .filter((c) => !(c.areas.length === 1 && c.areas[0] === OUTRA))
    .map((c) => `# ${c.nome}\n${c.areas.join("\n")}`)
    .join("\n\n")
}

export function textToCategorias(text: string): Categoria[] {
  const cats: Categoria[] = []
  let atual: Categoria | null = null
  const vistas = new Set<string>()
  for (const raw of text.split("\n")) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith("#")) {
      const nome = line.replace(/^#+/, "").trim()
      if (!nome) continue
      atual = { nome, areas: [] }
      cats.push(atual)
      continue
    }
    if (line === OUTRA || vistas.has(normalize(line))) continue
    vistas.add(normalize(line))
    if (!atual) {
      atual = { nome: "Outras funções", areas: [] }
      cats.push(atual)
    }
    atual.areas.push(line)
  }
  const limpas = cats.filter((c) => c.areas.length > 0 && normalize(c.nome) !== "outra")
  return [...limpas, { nome: "Outra", areas: [OUTRA] }]
}

/** Exemplos variados (primeiras funções de cada categoria), para a faixa e os cards da landing. */
export function amostraAreas(cats: Categoria[], porCategoria = 2) {
  return cats.filter((c) => c.nome !== "Outra").flatMap((c) => c.areas.slice(0, porCategoria))
}
