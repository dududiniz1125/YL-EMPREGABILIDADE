import { execFileSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"

import { test, type Page } from "@playwright/test"

import { seedDemo } from "../helpers/demo-seed"
import { SERVICE_KEY, SUPABASE_URL } from "../helpers/env"
import { PASSWORD } from "../helpers/supa"
import { loginUI } from "../helpers/ui"

/**
 * Screenshots de todas as telas em 390px e 1440px (pasta /screenshots) +
 * checagens automáticas: scroll horizontal e alvos de toque menores que 44px.
 *   npm run test:screens
 */
test.describe.configure({ mode: "serial" })
test.setTimeout(900_000)

const OUT = "screenshots"
const report: Record<string, unknown>[] = []

async function audit(page: Page, name: string) {
  await page.waitForLoadState("load")
  await page.waitForTimeout(600)
  const r = await page.evaluate(() => {
    const W = window.innerWidth
    const overflowX = document.documentElement.scrollWidth - W
    const small: string[] = []
    document.querySelectorAll<HTMLElement>("main a, main button, main input, main select, main textarea, header a, header button, nav a, nav button").forEach((el) => {
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      if (!rect.width || style.visibility === "hidden" || el.closest("[aria-hidden=true]")) return
      if ((el as HTMLInputElement).type === "checkbox" || (el as HTMLInputElement).type === "radio" || (el as HTMLInputElement).type === "hidden") return
      // links de texto dentro de parágrafos contam pela linha, não pela caixa
      if (el.tagName === "A" && el.closest("p, li > p, dd, figcaption")) return
      if (rect.height < 43.5) small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" ${Math.round(rect.height)}px`)
    })
    return { overflowX, small }
  })
  report.push({ name, ...r })
  writeFileSync(`${OUT}/_checagem.json`, JSON.stringify(report, null, 2))
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
}

const sizes = [
  ["mobile", { width: 390, height: 844 }],
  ["desktop", { width: 1440, height: 900 }],
] as const

test("todas as telas", async ({ browser }) => {
  mkdirSync(OUT, { recursive: true })
  const demo = await seedDemo()
  execFileSync("node", ["--import", "tsx", "scripts/seed-admin.ts"], {
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY, ADMIN_EMAIL: "admin.screens@teste.yl", ADMIN_PASSWORD: PASSWORD },
    stdio: "pipe",
  })

  for (const [label, viewport] of sizes) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: "pt-BR", isMobile: label === "mobile", hasTouch: label === "mobile" })
    const page = await ctx.newPage()
    const shot = async (path: string, name: string) => {
      await page.goto(path)
      await audit(page, `${label}-${name}`)
    }

    // site público
    await shot("/", "site")
    await shot("/entrar/", "entrar")
    await shot("/entrar/?tipo=empresa", "entrar-empresa")
    await shot("/esqueci-senha/", "esqueci-senha")
    await shot("/cadastro/candidato/", "cadastro-candidato")
    await shot("/cadastro/empresa/", "cadastro-empresa")
    await shot("/privacidade/", "privacidade")
    if (label === "mobile") {
      await page.goto("/")
      await page.getByRole("button", { name: "Abrir menu" }).click()
      await page.waitForTimeout(500)
      await page.screenshot({ path: `${OUT}/mobile-menu.png` })
      await page.keyboard.press("Escape")
    }

    // candidato
    await loginUI(page, demo.cand.email, PASSWORD, /\/candidato\/$/)
    await shot("/candidato/", "candidato-inicio")
    await shot("/candidato/vagas/", "candidato-vagas")
    await shot("/candidato/candidaturas/", "candidato-candidaturas")
    await shot("/candidato/perfil/", "candidato-perfil")
    await shot("/candidato/prova/", "candidato-provas")
    await shot(`/candidato/prova/${demo.prova}/`, "candidato-prova")
    await page.getByRole("button", { name: "Sair" }).first().click()

    // empresa
    await loginUI(page, demo.emp.email, PASSWORD, /\/empresa\/$/)
    await shot("/empresa/", "empresa-vagas")
    await shot("/empresa/vagas/nova/", "empresa-nova-vaga")
    await shot(`/empresa/vagas/${demo.vagaGarcom}/`, "empresa-inscritos")
    await shot("/empresa/dados/", "empresa-dados")
    await page.getByRole("button", { name: "Sair" }).first().click()

    // empresa pendente (aviso de análise)
    await loginUI(page, demo.empPend.email, PASSWORD, /\/empresa\/$/)
    await shot("/empresa/", "empresa-pendente")
    await page.getByRole("button", { name: "Sair" }).first().click()

    // admin
    await loginUI(page, "admin.screens@teste.yl", PASSWORD, /\/admin\/$/)
    for (const [p, n] of [
      ["/admin/", "admin-inicio"],
      ["/admin/candidatos/", "admin-candidatos"],
      [`/admin/candidatos/${demo.candComProva.id}/`, "admin-candidato-ficha"],
      ["/admin/empresas/", "admin-empresas"],
      ["/admin/vagas/", "admin-vagas"],
      [`/admin/vagas/${demo.vagaGarcom}/`, "admin-vaga"],
      ["/admin/candidaturas/", "admin-candidaturas"],
      ["/admin/provas/", "admin-provas"],
      [`/admin/provas/${demo.prova}/`, "admin-prova"],
      ["/admin/configuracoes/", "admin-configuracoes"],
      ["/admin/log/", "admin-log"],
      ["/admin/conta/", "admin-conta"],
      ["/admin/mais/", "admin-mais"],
    ] as const) {
      await shot(p, n)
    }
    await ctx.close()
  }
  writeFileSync(`${OUT}/_checagem.json`, JSON.stringify(report, null, 2))
})
