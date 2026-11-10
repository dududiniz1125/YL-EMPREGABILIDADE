import { expect, test } from "@playwright/test"

import { waitForEmailLink } from "../helpers/mail"
import { candidatoMeta, createAdmin, createUser, uniqueEmail } from "../helpers/supa"
import { cardWithHeading, loginUI, newSession } from "../helpers/ui"

test("empresa → admin aprova → vaga → admin aprova → candidato se inscreve → entrevista libera o e-mail", async ({ page, browser }, info) => {
  const use = info.project.use as Record<string, unknown>
  const nomeEmpresa = `Cantina Teste ${Date.now()}`
  const email = uniqueEmail("empresa")

  // 1) cadastro da empresa
  await page.goto("/cadastro/empresa/")
  await page.getByLabel("Nome da empresa").fill(nomeEmpresa)
  await page.getByLabel("Nome do responsável").fill("Carla Dona")
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Crie uma senha").fill("Empresa123")
  await page.getByLabel("Repita a senha").fill("Empresa123")
  await page.getByLabel(/Concordo com o tratamento/).check()
  await page.getByRole("button", { name: "Criar conta da empresa" }).click()
  await expect(page.getByRole("heading", { name: "Cadastro recebido!" })).toBeVisible()
  await page.goto((await waitForEmailLink(email)).link)
  await expect(page).toHaveURL(/\/empresa\//)
  await expect(page.getByText("Seu cadastro está em análise.")).toBeVisible()

  // 2) empresa já rascunha uma vaga (fica pendente)
  const titulo = `Garçom fim de semana ${Date.now()}`
  await page.goto("/empresa/vagas/nova/")
  await page.getByLabel("Título da vaga").fill(titulo)
  await page.getByLabel("Área / função").selectOption("Garçom / Garçonete")
  await page.getByLabel("Bairro / local").fill("Moema")
  await page.getByRole("button", { name: "Enviar vaga para aprovação" }).click()
  await expect(page.getByText("Vaga enviada!")).toBeVisible()
  await expect(page.getByText("Aguardando aprovação da YL.")).toBeVisible()

  // 3) admin aprova empresa e vaga pelo painel
  const adm = await createAdmin()
  const admin = await newSession(browser, use)
  await loginUI(admin, adm.email, undefined, /\/admin\/$/)
  const empItem = admin.locator("li", { hasText: nomeEmpresa })
  await empItem.getByRole("button", { name: "Aprovar", exact: true }).click()
  await expect(admin.locator("li", { hasText: nomeEmpresa })).toHaveCount(1) // agora só na lista de vagas pendentes
  await admin.locator("li", { hasText: titulo }).getByRole("button", { name: "Aprovar vaga" }).click()
  await expect(admin.locator("li", { hasText: titulo })).toHaveCount(0)

  // 4) candidato se inscreve
  const cand = await createUser(candidatoMeta({ nome: "Pedro Candidato", area_principal: "Garçom / Garçonete" }), "c")
  const candidato = await newSession(browser, use)
  await loginUI(candidato, cand.email, undefined, /\/candidato\/$/)
  await candidato.goto("/candidato/vagas/")
  await cardWithHeading(candidato, titulo).getByRole("button", { name: "Quero me candidatar" }).click()
  await expect(candidato.getByText("Candidatura enviada!")).toBeVisible()

  // 5) empresa vê o inscrito sem e-mail, marca Entrevista e passa a ver
  await page.reload()
  await expect(page.getByText("Seu cadastro está em análise.")).toHaveCount(0)
  await page.getByRole("link", { name: "Ver inscritos e editar" }).first().click()
  await expect(page.getByRole("heading", { name: "Pedro Candidato" })).toBeVisible()
  await expect(page.getByText(cand.email)).toHaveCount(0)
  await page.getByRole("button", { name: "Em análise" }).click()
  await expect(page.getByText("Status do inscrito atualizado.")).toBeVisible()
  await expect(page.getByText(cand.email)).toHaveCount(0)
  await page.getByRole("button", { name: "Entrevista", exact: true }).click()
  const mail = page.getByRole("link", { name: cand.email })
  await expect(mail).toBeVisible()
  await expect(mail).toHaveAttribute("href", new RegExp(`^mailto:${cand.email.replace(/[.+]/g, "\\$&")}\\?subject=`))

  // 6) candidato vê o novo status na linha do tempo
  await candidato.goto("/candidato/candidaturas/")
  await expect(candidato.getByText("Entrevista").first()).toBeVisible()
})
