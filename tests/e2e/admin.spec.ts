import { execFileSync } from "node:child_process"

import { expect, test } from "@playwright/test"

import { SERVICE_KEY, SUPABASE_URL } from "../helpers/env"
import { loginUI } from "../helpers/ui"

// Credenciais SÓ do ambiente de teste local (a senha real fica apenas no .env.local de produção)
const ADMIN_EMAIL = "admin.e2e@teste.yl"
const ADMIN_PASSWORD = "Admin-teste-123"

test.beforeEach(() => {
  // usa o script de seed de verdade (npm run seed:admin)
  execFileSync("node", ["--import", "tsx", "scripts/seed-admin.ts"], {
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    },
    stdio: "pipe",
  })
})

const TELAS = [
  ["/admin/", "Início"],
  ["/admin/candidatos/", "Candidatos"],
  ["/admin/empresas/", "Empresas"],
  ["/admin/vagas/", "Vagas"],
  ["/admin/candidaturas/", "Candidaturas"],
  ["/admin/provas/", "Provas"],
  ["/admin/configuracoes/", "Configurações"],
  ["/admin/log/", "Registro de ações"],
  ["/admin/conta/", "Minha conta"],
  ["/admin/mais/", "Mais"],
] as const

test("admin: login do seed, aviso de troca de senha e todas as telas", async ({ page }) => {
  await loginUI(page, ADMIN_EMAIL, ADMIN_PASSWORD, /\/admin\/$/)
  await expect(page.getByText("Troque sua senha.")).toBeVisible()

  for (const [path, heading] of TELAS) {
    await page.goto(path)
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible()
  }

  // cria uma prova com 2 questões pelo painel
  await page.goto("/admin/provas/")
  const temNova = await page.getByRole("button", { name: "Criar prova" }).count()
  if (temNova) {
    await page.getByRole("button", { name: "Criar prova" }).click()
    await expect(page).toHaveURL(/\/admin\/provas\/[0-9a-f-]+\//)
    await page.getByLabel("Pergunta").last().fill("Qual é a primeira coisa a fazer ao receber o cliente?")
    await page.getByPlaceholder("Alternativa 1").last().fill("Cumprimentar e acomodar")
    await page.getByPlaceholder("Alternativa 2").last().fill("Trazer a conta")
    await page.getByRole("button", { name: "Adicionar questão" }).click()
    await expect(page.getByText("Salvo.")).toBeVisible()
    await expect(page.getByRole("heading", { name: /Questões \(1\)/ })).toBeVisible()
  }

  // troca de senha some com o aviso
  await page.goto("/admin/conta/")
  await page.getByRole("textbox", { name: "Nova senha", exact: true }).fill("NovaSenha-forte-9")
  await page.getByRole("textbox", { name: "Repita a nova senha", exact: true }).fill("NovaSenha-forte-9")
  await page.getByRole("button", { name: "Trocar senha" }).click()
  await expect(page.getByText("Senha alterada com sucesso.")).toBeVisible()
  await page.goto("/admin/")
  await expect(page.getByText("Troque sua senha.")).toHaveCount(0)
  await expect(page.getByRole("heading", { level: 1, name: "Início" })).toBeVisible()
})
