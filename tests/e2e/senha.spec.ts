import { expect, test } from "@playwright/test"

import { waitForEmailLink } from "../helpers/mail"
import { candidatoMeta, createUser } from "../helpers/supa"
import { loginUI } from "../helpers/ui"

test("esqueci minha senha: envia o e-mail e a redefinição funciona", async ({ page }) => {
  const u = await createUser(candidatoMeta(), "reset")
  await page.goto("/entrar/")
  await page.getByRole("link", { name: "Esqueci minha senha" }).click()
  await expect(page).toHaveURL(/\/esqueci-senha\//)
  await page.getByLabel("E-mail").fill(u.email)
  await page.getByRole("button", { name: "Enviar link" }).click()
  await expect(page.getByText(/Se existir uma conta com/)).toBeVisible()

  const { link, subject } = await waitForEmailLink(u.email, "type=recovery")
  expect(subject).toContain("nova senha")
  await page.goto(link)
  await expect(page).toHaveURL(/\/redefinir-senha\//)
  await page.getByRole("textbox", { name: "Nova senha", exact: true }).fill("Trocada-123")
  await page.getByRole("textbox", { name: "Repita a nova senha", exact: true }).fill("Trocada-123")
  await page.getByRole("button", { name: "Salvar nova senha" }).click()
  await expect(page).toHaveURL(/\/candidato\/\?senha=ok/)

  await page.getByRole("button", { name: "Sair" }).first().click()
  await loginUI(page, u.email, "Trocada-123", /\/candidato\/$/)
})

test("e-mail inexistente recebe a mesma resposta (não revela contas)", async ({ page }) => {
  await page.goto("/esqueci-senha/")
  await page.getByLabel("E-mail").fill("ninguem.aqui@teste.yl")
  await page.getByRole("button", { name: "Enviar link" }).click()
  await expect(page.getByText(/Se existir uma conta com/)).toBeVisible()
})

test("senha errada mostra mensagem clara", async ({ page }) => {
  const u = await createUser(candidatoMeta(), "wrong")
  await loginUI(page, u.email, "senha-errada-1")
  await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible()
  await expect(page).toHaveURL(/\/entrar\//)
})
