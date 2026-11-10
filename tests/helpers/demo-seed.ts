/**
 * Dados de DEMONSTRAÇÃO para o banco de TESTE local (screenshots/revisão).
 * Nunca rode contra o banco de produção.
 */
import { adminDb, candidatoMeta, createUser, empresaMeta } from "./supa"

export async function seedDemo() {
  const db = adminDb()
  const emp = await createUser(empresaMeta({ empresa: "Restaurante Exemplo", responsavel: "Responsável Exemplo", bairro: "Pinheiros" }), "demo.empresa")
  const empPend = await createUser(empresaMeta({ empresa: "Lanchonete Exemplo", responsavel: "Outro Responsável", bairro: "Moema" }), "demo.empresa2")
  await db.from("empresas").update({ status: "aprovada" }).eq("id", emp.id)

  const iso = (d: number, h = 14) => new Date(Date.now() + d * 86400_000).toISOString().slice(0, 10) + `T${String(h + 3).padStart(2, "0")}:00:00Z`
  const { data: vagas } = await db
    .from("vagas")
    .insert([
      { empresa_id: emp.id, titulo: "Garçom — turno noite", area: "Garçom / Garçonete", quantidade: 2, bairro: "Pinheiros", salario: 2200, entrevista_em: iso(3), descricao: "Atendimento no salão, de terça a sábado, das 18h às 0h.", status: "aberta" },
      { empresa_id: emp.id, titulo: "Cumim — fim de semana", area: "Cumim", quantidade: 1, bairro: "Pinheiros", salario: 1700, entrevista_em: iso(4, 10), status: "aberta" },
      { empresa_id: emp.id, titulo: "Auxiliar de cozinha", area: "Auxiliar de cozinha", quantidade: 1, bairro: "Pinheiros", salario: 1900, status: "pendente" },
      { empresa_id: empPend.id, titulo: "Atendente de balcão", area: "Atendimento", quantidade: 1, bairro: "Moema", status: "pendente" },
    ])
    .select("id, area")

  await db.from("provas").delete().in("area", ["Garçom / Garçonete", "Cumim"])
  const { data: prova } = await db.from("provas").insert({ area: "Garçom / Garçonete", titulo: "Prova de garçom" }).select("id").single()
  const qs = [
    ["Ao receber um cliente, o que fazer primeiro?", ["Cumprimentar e acomodar", "Trazer a conta", "Recolher a mesa"], 0],
    ["De que lado se serve a bebida?", ["Pela direita do cliente", "Pela esquerda", "Tanto faz"], 0],
    ["O cliente reclamou do prato. O que fazer?", ["Ignorar", "Ouvir, pedir desculpas e chamar o responsável", "Discutir"], 1],
  ] as const
  await db.from("questoes").insert(qs.map(([e, a, c], i) => ({ prova_id: prova!.id, ordem: i + 1, enunciado: e, alternativas: a, correta: c })))
  await db.from("provas").insert({ area: "Cumim", titulo: "Prova de cumim" })

  const nomes = [
    ["Candidata Exemplo", "Garçom / Garçonete"],
    ["Candidato Dois", "Garçom / Garçonete"],
    ["Candidata Três", "Cumim"],
    ["Candidato Quatro", "Cozinheiro(a)"],
    ["Candidata Cinco", "Garçom / Garçonete"],
  ]
  const cands = []
  for (const [nome, area] of nomes) {
    cands.push(await createUser(candidatoMeta({ nome, area_principal: area }), "demo.cand"))
  }
  const garcom = vagas!.find((v) => v.area === "Garçom / Garçonete")!.id
  const cumim = vagas!.find((v) => v.area === "Cumim")!.id
  const ins = [
    { candidato_id: cands[0].id, vaga_id: garcom, status: "entrevista" },
    { candidato_id: cands[1].id, vaga_id: garcom, status: "em_analise" },
    { candidato_id: cands[4].id, vaga_id: garcom, status: "inscrito" },
    { candidato_id: cands[2].id, vaga_id: cumim, status: "contratado" },
    { candidato_id: cands[3].id, vaga_id: cumim, status: "nao_selecionado" },
  ]
  for (const i of ins) await db.from("candidaturas").insert(i)
  await db.from("respostas_prova").insert([
    { candidato_id: cands[0].id, prova_id: prova!.id, respostas: {}, acertos: 3, total: 3, nota: 10 },
    { candidato_id: cands[1].id, prova_id: prova!.id, respostas: {}, acertos: 2, total: 3, nota: 6.7 },
  ])
  return { emp, empPend, cand: cands[4], candComProva: cands[0], vagaGarcom: garcom, prova: prova!.id }
}
