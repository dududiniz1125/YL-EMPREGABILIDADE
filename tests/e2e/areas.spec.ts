import { expect, test } from "@playwright/test"

import { adminDb, candidatoMeta, createAdmin, createUser, createVaga, empresaMeta } from "../helpers/supa"
import { loginUI, pickArea } from "../helpers/ui"

test("busca de áreas no cadastro: categorias, sem acento, teclado e “Outra”", async ({ page }) => {
  await page.goto("/cadastro/candidato/")
  const box = page.getByRole("combobox", { name: /^Área principal/ })

  // ao focar, mostra a lista agrupada por categoria
  await box.click()
  await expect(page.getByRole("listbox")).toBeVisible()
  for (const cat of ["Administrativo e escritório", "Comércio e vendas", "Educação e esportes"]) {
    await expect(page.getByRole("group", { name: cat })).toBeAttached()
  }

  // busca sem acento + teclado
  await box.fill("auxiliar adm")
  await expect(page.getByRole("option", { name: "Auxiliar administrativo", exact: true })).toBeVisible()
  await box.press("ArrowDown")
  await box.press("Enter")
  await expect(box).toHaveValue("Auxiliar administrativo")
  // digitar e dar Enter também escolhe a primeira que bate
  await box.click()
  await box.fill("personal")
  await box.press("Enter")
  await expect(box).toHaveValue("Personal trainer")

  // pelo nome da categoria também acha
  await pickArea(page, /^Área principal/, "comercio", "Vendedor(a)")

  // "Outra" abre o campo de texto
  await box.click()
  await box.fill("xyzw")
  await expect(page.getByText(/Nenhuma função encontrada/)).toBeVisible()
  await page.getByRole("option", { name: /^Outra/ }).click()
  const outra = page.getByLabel(/^Qual é a função/)
  await expect(outra).toBeVisible()
  await outra.fill("Auxiliar de biblioteca")
  await expect(outra).toHaveValue("Auxiliar de biblioteca")
})

test("landing mostra funções variadas, não só restaurante", async ({ page }) => {
  await page.goto("/")
  const faixa = page.getByRole("region", { name: "Áreas atendidas" })
  for (const a of ["Auxiliar administrativo", "Vendedor(a)", "Professor(a) de educação física"]) {
    await expect(faixa.getByText(a, { exact: true }).first()).toBeAttached()
  }
  await expect(page.locator("#hero-title")).toContainText("Conectamos talentos às oportunidades certas")
})

test("área sem prova: candidato se candidata e o admin vê “sem prova”", async ({ page }) => {
  const emp = await createUser(empresaMeta(), "semprova")
  await adminDb().from("empresas").update({ status: "aprovada" }).eq("id", emp.id)
  const titulo = `Motorista ${Date.now()}`
  await createVaga(emp.id, "aberta", { titulo, area: "Motorista" })
  const cand = await createUser(candidatoMeta({ nome: "Carlos Motorista", area_principal: "Motorista" }), "semprova")

  await loginUI(page, cand.email, undefined, /\/candidato\/$/)
  await expect(page.getByText("Sua área não tem provinha")).toBeVisible()
  await page.getByRole("button", { name: "Quero me candidatar" }).first().click()
  await expect(page.getByText("Candidatura enviada!")).toBeVisible()
  await page.getByRole("button", { name: "Sair" }).first().click()

  const adm = await createAdmin()
  await loginUI(page, adm.email, undefined, /\/admin\/$/)
  await page.goto(`/admin/candidatos/?q=${encodeURIComponent("Carlos Motorista")}`)
  await expect(page.getByText(/^(Nota: )?sem prova/).filter({ visible: true }).first()).toBeVisible()
  await page.goto(`/admin/candidatos/${cand.id}/`)
  await expect(page.getByText(/Sem prova: a área dele\(a\) não tem prova cadastrada/)).toBeVisible()
})

test("admin edita a lista de áreas por categoria e o cadastro passa a mostrar", async ({ page }) => {
  const adm = await createAdmin()
  await loginUI(page, adm.email, undefined, /\/admin\/$/)
  await page.goto("/admin/configuracoes/")
  const nova = `Função de teste ${Date.now()}`
  const campo = page.getByLabel(/^Áreas \/ funções/)
  const atual = await campo.inputValue()
  expect(atual).toContain("# Comércio e vendas")
  await campo.fill(`${atual}\n\n# Categoria de teste\n${nova}`)
  await page.getByRole("button", { name: "Salvar configurações" }).click()
  await expect(page.getByText("Configurações salvas.")).toBeVisible()

  await page.getByRole("button", { name: "Sair" }).first().click()
  await page.goto("/cadastro/candidato/")
  await pickArea(page, /^Área principal/, nova.slice(0, 18).toLowerCase(), nova)
  await expect(page.getByRole("combobox", { name: /^Área principal/ })).toHaveValue(nova)
})
