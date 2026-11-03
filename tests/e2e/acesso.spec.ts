import { expect, test } from "@playwright/test"

import { adminDb, candidatoMeta, createUser, empresaMeta } from "../helpers/supa"
import { loginUI } from "../helpers/ui"

const LOGIN = /\/entrar\//

test("deslogado não entra nas áreas logadas", async ({ page }) => {
  for (const p of ["/candidato/", "/candidato/perfil/", "/empresa/", "/empresa/vagas/nova/", "/admin/", "/admin/candidatos/"]) {
    await page.goto(p)
    await expect(page, p).toHaveURL(LOGIN)
  }
})

test("candidato não abre /admin nem /empresa", async ({ page }) => {
  const u = await createUser(candidatoMeta(), "proib")
  await loginUI(page, u.email, undefined, /\/candidato\/$/)
  for (const p of ["/admin/", "/admin/configuracoes/", "/empresa/", "/empresa/dados/"]) {
    await page.goto(p)
    await expect(page, p).toHaveURL(/\/entrar\/.*erro=sem-permissao/)
  }
  await expect(page.getByText("Essa área não é para o seu tipo de conta.")).toBeVisible()
  // exportação de CSV também é bloqueada
  const r = await page.request.get("/admin/candidatos/exportar/", { maxRedirects: 0 })
  expect([302, 303, 307, 308]).toContain(r.status())
})

test("empresa não abre /admin nem /candidato", async ({ page }) => {
  const u = await createUser(empresaMeta(), "proibE")
  await adminDb().from("empresas").update({ status: "aprovada" }).eq("id", u.id)
  await loginUI(page, u.email, undefined, /\/empresa\/$/)
  for (const p of ["/admin/", "/admin/vagas/", "/candidato/"]) {
    await page.goto(p)
    await expect(page, p).toHaveURL(/\/entrar\/.*erro=sem-permissao/)
  }
})
