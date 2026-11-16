import { expect, test } from "@playwright/test"

import { waitForEmailLink } from "../helpers/mail"
import { adminDb, createUser, createVaga, empresaMeta, uniqueEmail } from "../helpers/supa"
import { cardWithHeading, loginUI, pickArea } from "../helpers/ui"

test("candidato: cadastro completo → confirmação → login → candidatura → status (área sem prova)", async ({ page }) => {
  const emp = await createUser(empresaMeta({ empresa: "Bistrô do Teste" }), "emp")
  await adminDb().from("empresas").update({ status: "aprovada" }).eq("id", emp.id)
  const titulo = `Professor de educação física ${Date.now()}`
  await createVaga(emp.id, "aberta", { titulo, area: "Professor(a) de educação física", bairro: "Pinheiros" })

  const email = uniqueEmail("cand")
  await page.goto("/cadastro/candidato/")
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1")

  // passo 1 — valida antes de avançar
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByText("Informe seu nome completo.")).toBeVisible()
  await page.getByLabel("Nome completo").fill("Joana Teste")
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Cidade / bairro").fill("São Paulo, Lapa")
  // busca sem acento encontra a função
  await pickArea(page, /^Área principal/, "educacao fisica", "Professor(a) de educação física")
  await page.getByRole("button", { name: "Continuar" }).click()

  // passo 2
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2")
  await page.getByLabel("Empresa").first().fill("Bar do Zé")
  await page.getByLabel("Função").first().fill("Professor")
  await page.getByLabel("Pretensão salarial").pressSequentially("220000")
  await page.getByLabel("Noite").check()
  await page.getByRole("button", { name: "Continuar" }).click()

  // passo 3
  await page.getByLabel("Crie uma senha").fill("Senha1234")
  await page.getByLabel("Repita a senha").fill("Senha1234")
  await page.getByLabel(/Concordo com o uso/).check()
  await page.getByRole("button", { name: "Criar minha conta" }).click()
  await expect(page.getByRole("heading", { name: "Conta criada!" })).toBeVisible()

  // antes de confirmar, o login avisa
  await loginUI(page, email, "Senha1234")
  await expect(page.getByText("Confirme seu e-mail antes de entrar.")).toBeVisible()

  const { link, subject } = await waitForEmailLink(email)
  expect(subject).toContain("YL Empregabilidade")
  await page.goto(link)
  await expect(page).toHaveURL(/\/candidato\/\?bemvindo=1/)

  // sair e entrar de novo pela tela de login
  await page.getByRole("button", { name: "Sair" }).first().click()
  await expect(page).toHaveURL(/\/entrar\/\?ok=saiu/)
  await loginUI(page, email, "Senha1234", /\/candidato\/$/)
  // área sem prova: nada de prova obrigatória
  await expect(page.getByText("Sua área não tem provinha")).toBeVisible()

  await page.goto(`/candidato/vagas/?area=${encodeURIComponent("Professor(a) de educação física")}`)
  await cardWithHeading(page, titulo).getByRole("button", { name: "Quero me candidatar" }).click()
  await expect(page.getByText("Candidatura enviada!")).toBeVisible()

  await page.goto("/candidato/candidaturas/")
  await expect(page.getByRole("heading", { name: titulo })).toBeVisible()
  await expect(page.getByText("Inscrito").first()).toBeVisible()
})
