import { expect, type Browser, type Page } from "@playwright/test"

import { PASSWORD } from "./supa"

/** Entra pela tela /entrar (como uma pessoa faria). */
export async function loginUI(page: Page, email: string, password = PASSWORD, expectPath?: RegExp) {
  await page.goto("/entrar/")
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel(/^Senha/).fill(password)
  await page.getByRole("button", { name: "Entrar", exact: true }).click()
  if (expectPath) await expect(page).toHaveURL(expectPath, { timeout: 15_000 })
}

/** Novo contexto com o mesmo dispositivo do projeto atual. */
export async function newSession(browser: Browser, use: Record<string, unknown>) {
  const ctx = await browser.newContext({
    viewport: use.viewport as { width: number; height: number },
    userAgent: use.userAgent as string,
    deviceScaleFactor: use.deviceScaleFactor as number,
    isMobile: use.isMobile as boolean,
    hasTouch: use.hasTouch as boolean,
    baseURL: use.baseURL as string,
    locale: "pt-BR",
  })
  return ctx.newPage()
}

/** Cartão (Card) que contém um título com esse texto. */
export function cardWithHeading(page: Page, name: string) {
  return page.getByRole("heading", { name }).locator("xpath=ancestor::div[contains(@class,'rounded-3xl')][1]")
}
