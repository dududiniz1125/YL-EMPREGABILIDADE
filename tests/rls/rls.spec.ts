import { expect, test } from "@playwright/test"

import {
  adminDb,
  anonDb,
  candidatoMeta,
  createAdmin,
  createUser,
  createVaga,
  empresaMeta,
  signIn,
} from "../helpers/supa"

/**
 * Testes de Row Level Security direto na API do Supabase (sem navegador).
 * Provam que cada papel só enxerga o que deve.
 */
test.describe.configure({ mode: "serial" })

test.describe("RLS", () => {
  let candA: { id: string; email: string }
  let candB: { id: string; email: string }
  let empX: { id: string; email: string }
  let empY: { id: string; email: string }
  let vagaX: string
  let vagaY: string
  let vagaPendente: string
  let vagaEncerrada: string

  test.beforeAll(async () => {
    candA = await createUser(candidatoMeta({ nome: "Ana A" }), "candA")
    candB = await createUser(candidatoMeta({ nome: "Bruno B" }), "candB")
    empX = await createUser(empresaMeta({ empresa: "Empresa X" }), "empX")
    empY = await createUser(empresaMeta({ empresa: "Empresa Y" }), "empY")
    await adminDb().from("empresas").update({ status: "aprovada" }).in("id", [empX.id, empY.id])
    vagaX = await createVaga(empX.id, "aberta", { titulo: "Vaga da X" })
    vagaY = await createVaga(empY.id, "aberta", { titulo: "Vaga da Y" })
    vagaPendente = await createVaga(empX.id, "pendente", { titulo: "Pendente" })
    vagaEncerrada = await createVaga(empX.id, "encerrada", { titulo: "Encerrada" })
  })

  test("trigger de cadastro cria perfil e ficha do candidato", async () => {
    const { data } = await adminDb().from("candidatos").select("nome, status, consentimento_lgpd_em").eq("id", candA.id).single()
    expect(data?.nome).toBe("Ana A")
    expect(data?.status).toBe("ativo")
    expect(data?.consentimento_lgpd_em).toBeTruthy()
  })

  test("banco não guarda mais WhatsApp (contato só por e-mail)", async () => {
    for (const t of ["candidatos", "empresas", "configuracoes"]) {
      const { error } = await adminDb().from(t).select("whatsapp").limit(1)
      expect(error, t).toBeTruthy()
    }
  })

  test("candidato não lê nem edita o cadastro de outro candidato", async () => {
    const a = await signIn(candA.email)
    const { data: own } = await a.from("candidatos").select("id").eq("id", candA.id)
    expect(own).toHaveLength(1)
    const { data: other } = await a.from("candidatos").select("*").eq("id", candB.id)
    expect(other).toHaveLength(0)
    const { data: all } = await a.from("candidatos").select("id")
    expect(all?.map((r) => r.id)).toEqual([candA.id])

    await a.from("candidatos").update({ nome: "Hackeado" }).eq("id", candB.id)
    const { data: b } = await adminDb().from("candidatos").select("nome").eq("id", candB.id).single()
    expect(b?.nome).toBe("Bruno B")
  })

  test("candidato não muda o próprio status nem vira admin", async () => {
    const a = await signIn(candA.email)
    await a.from("candidatos").update({ status: "contratado", nome: "Ana Alterada" }).eq("id", candA.id)
    const { data } = await adminDb().from("candidatos").select("status, nome").eq("id", candA.id).single()
    expect(data?.status).toBe("ativo")
    expect(data?.nome).toBe("Ana Alterada")

    const { error } = await a.from("profiles").update({ role: "admin" }).eq("id", candA.id)
    expect(error).toBeTruthy()
    const { data: p } = await adminDb().from("profiles").select("role").eq("id", candA.id).single()
    expect(p?.role).toBe("candidato")
  })

  test("cadastro pelo site nunca cria admin", async () => {
    const u = await createUser({ ...candidatoMeta(), role: "admin" }, "fakeadmin")
    const { data } = await adminDb().from("profiles").select("role").eq("id", u.id)
    expect(data).toHaveLength(0)
  })

  test("candidato só vê vagas abertas", async () => {
    const a = await signIn(candA.email)
    const { data } = await a.from("vagas").select("id, status")
    const ids = data!.map((v) => v.id)
    expect(ids).toContain(vagaX)
    expect(ids).toContain(vagaY)
    expect(ids).not.toContain(vagaPendente)
    expect(ids).not.toContain(vagaEncerrada)
    expect(data!.every((v) => v.status === "aberta")).toBe(true)
  })

  test("candidato não se candidata a vaga pendente e se candidata a vaga aberta", async () => {
    const a = await signIn(candA.email)
    const bad = await a.from("candidaturas").insert({ candidato_id: candA.id, vaga_id: vagaPendente })
    expect(bad.error).toBeTruthy()
    const ok = await a.from("candidaturas").insert({ candidato_id: candA.id, vaga_id: vagaX, status: "contratado" })
    expect(ok.error).toBeNull()
    const { data } = await a.from("candidaturas").select("status").eq("vaga_id", vagaX).single()
    expect(data?.status).toBe("inscrito") // status forçado pelo banco

    const b = await signIn(candB.email)
    expect((await b.from("candidaturas").insert({ candidato_id: candB.id, vaga_id: vagaY })).error).toBeNull()
    // candidato B não vê a candidatura de A
    const { data: seen } = await b.from("candidaturas").select("candidato_id")
    expect(seen?.every((c) => c.candidato_id === candB.id)).toBe(true)
  })

  test("empresa não lê a tabela de candidatos", async () => {
    const x = await signIn(empX.email)
    const { data } = await x.from("candidatos").select("*")
    expect(data).toHaveLength(0)
  })

  test("empresa só vê inscritos das próprias vagas, sem e-mail antes da entrevista", async () => {
    const x = await signIn(empX.email)
    const { data } = await x.from("inscritos_empresa").select("*")
    expect(data).toHaveLength(1)
    expect(data![0].vaga_id).toBe(vagaX)
    expect(data![0].nome).toBe("Ana Alterada")
    expect(data![0].email).toBeNull()
    expect(Object.keys(data![0])).not.toContain("whatsapp")
    expect(Object.keys(data![0])).not.toContain("cidade")

    const { data: cands } = await x.from("candidaturas").select("vaga_id")
    expect(cands?.every((c) => c.vaga_id === vagaX)).toBe(true)

    const y = await signIn(empY.email)
    const { data: dy } = await y.from("inscritos_empresa").select("vaga_id, nome")
    expect(dy).toHaveLength(1)
    expect(dy![0].vaga_id).toBe(vagaY)
  })

  test("empresa vê o e-mail só a partir da entrevista e não mexe em candidatura alheia", async () => {
    const x = await signIn(empX.email)
    const { data: rows } = await x.from("inscritos_empresa").select("candidatura_id")
    const minha = rows![0].candidatura_id as string

    const y = await signIn(empY.email)
    const foreign = await y.rpc("empresa_mudar_status", { p_candidatura: minha, p_status: "entrevista" })
    expect(foreign.error).toBeTruthy()

    expect((await x.rpc("empresa_mudar_status", { p_candidatura: minha, p_status: "em_analise" })).error).toBeNull()
    let { data } = await x.from("inscritos_empresa").select("email, status").eq("candidatura_id", minha).single()
    expect(data?.email).toBeNull()

    expect((await x.rpc("empresa_mudar_status", { p_candidatura: minha, p_status: "entrevista" })).error).toBeNull()
    ;({ data } = await x.from("inscritos_empresa").select("email, status").eq("candidatura_id", minha).single())
    expect(data?.status).toBe("entrevista")
    expect(data?.email).toBe(candA.email.toLowerCase())

    // linha do tempo registrada
    const a = await signIn(candA.email)
    const { data: ev } = await a.from("candidatura_eventos").select("status").eq("candidatura_id", minha).order("id")
    expect(ev?.map((e) => e.status)).toEqual(["inscrito", "em_analise", "entrevista"])
  })

  test("empresa não aprova a própria vaga e não vê vagas de outra empresa", async () => {
    const x = await signIn(empX.email)
    const { data: nova } = await x
      .from("vagas")
      .insert({ empresa_id: empY.id, titulo: "Tentativa", area: "Cumim", status: "aberta" })
      .select("empresa_id, status")
      .single()
    expect(nova?.status).toBe("pendente")
    expect(nova?.empresa_id).toBe(empX.id)

    await x.from("vagas").update({ status: "aberta" }).eq("id", vagaPendente)
    const { data: v } = await adminDb().from("vagas").select("status").eq("id", vagaPendente).single()
    expect(v?.status).toBe("pendente")

    const { data: list } = await x.from("vagas").select("empresa_id")
    expect(list?.every((r) => r.empresa_id === empX.id)).toBe(true)
  })

  test("empresa não muda o próprio status de aprovação", async () => {
    const pend = await createUser(empresaMeta(), "empPend")
    const c = await signIn(pend.email)
    await c.from("empresas").update({ status: "aprovada" }).eq("id", pend.id)
    const { data } = await adminDb().from("empresas").select("status").eq("id", pend.id).single()
    expect(data?.status).toBe("pendente")
  })

  test("provas: candidato não vê a resposta certa e só faz uma vez", async () => {
    const db = adminDb()
    const { data: prova } = await db.from("provas").insert({ area: `Área teste ${Date.now()}`, titulo: "Prova teste" }).select("id").single()
    const { data: qs } = await db
      .from("questoes")
      .insert([
        { prova_id: prova!.id, ordem: 1, enunciado: "1+1?", alternativas: ["1", "2", "3"], correta: 1 },
        { prova_id: prova!.id, ordem: 2, enunciado: "2+2?", alternativas: ["4", "5"], correta: 0 },
      ])
      .select("id, correta")

    const a = await signIn(candA.email)
    const { data: direct } = await a.from("questoes").select("*")
    expect(direct).toHaveLength(0)

    const { data: p } = await a.rpc("get_prova", { p_prova: prova!.id })
    expect(p).toHaveLength(2)
    expect(Object.keys(p![0])).not.toContain("correta")

    const respostas = Object.fromEntries(qs!.map((q) => [q.id, q.correta === 1 ? 1 : 1])) // 1 certa, 1 errada
    const { data: nota, error } = await a.rpc("enviar_prova", { p_prova: prova!.id, p_respostas: respostas })
    expect(error).toBeNull()
    expect(Number(nota)).toBe(5)

    const again = await a.rpc("enviar_prova", { p_prova: prova!.id, p_respostas: respostas })
    expect(again.error).toBeTruthy()

    const b = await signIn(candB.email)
    const { data: notasB } = await b.from("respostas_prova").select("*")
    expect(notasB).toHaveLength(0)

    const x = await signIn(empX.email)
    expect((await x.rpc("get_prova", { p_prova: prova!.id })).data).toHaveLength(0)
  })

  test("visitante sem login não lê dados", async () => {
    const anon = anonDb()
    for (const t of ["candidatos", "empresas", "vagas", "candidaturas", "profiles", "questoes", "admin_log"]) {
      const { data } = await anon.from(t).select("*")
      expect(data ?? [], t).toHaveLength(0)
    }
    const { data: cfg } = await anon.from("configuracoes").select("areas").single()
    expect(cfg?.areas.length).toBeGreaterThan(0)
    const { error } = await anon.from("configuracoes").update({ telefone: "x" }).eq("id", 1)
    const { data: after } = await adminDb().from("configuracoes").select("telefone").single()
    expect(error || after?.telefone !== "x").toBeTruthy()
  })

  test("admin vê e edita tudo", async () => {
    const adm = await createAdmin()
    const c = await signIn(adm.email)
    const { data: cands } = await c.from("candidatos").select("id")
    expect(cands!.map((r) => r.id)).toEqual(expect.arrayContaining([candA.id, candB.id]))
    const { data: vagas } = await c.from("vagas").select("id")
    expect(vagas!.map((r) => r.id)).toEqual(expect.arrayContaining([vagaPendente, vagaEncerrada]))
    expect((await c.from("vagas").update({ status: "aberta" }).eq("id", vagaPendente)).error).toBeNull()
    const { data: v } = await adminDb().from("vagas").select("status").eq("id", vagaPendente).single()
    expect(v?.status).toBe("aberta")
    expect((await c.from("admin_log").insert({ admin_id: adm.id, acao: "teste" })).error).toBeNull()

    // nem o admin muda papéis pelo site
    const { error } = await c.from("profiles").update({ role: "admin" }).eq("id", candB.id)
    expect(error).toBeTruthy()
  })
})
