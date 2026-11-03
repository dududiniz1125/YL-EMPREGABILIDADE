import { defineConfig, devices } from "@playwright/test"

/**
 * Testes contra o Supabase de TESTE local (supabase/test-stack).
 *   npm run test:stack:up   → sobe Postgres + Auth + REST + e-mail falso
 *   npm run test:rls        → testes de RLS (sem navegador)
 *   npm run test:e2e        → fluxos completos no iPhone 13, Pixel 7 e Desktop Chrome
 */
const PORT = Number(process.env.E2E_PORT ?? 3100)
const executablePath = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium"

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "pt-BR",
    trace: "retain-on-failure",
    launchOptions: { executablePath },
  },
  projects: [
    { name: "rls", testMatch: /rls\/.*\.spec\.ts/ },
    // iPhone 13 é emulado no Chromium (mesmo tamanho, toque e user agent do Safari iOS)
    { name: "iphone-13", testMatch: /e2e\/.*\.spec\.ts/, use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "pixel-7", testMatch: /e2e\/.*\.spec\.ts/, use: { ...devices["Pixel 7"] } },
    { name: "desktop-chrome", testMatch: /e2e\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        command: `npm run start -- -p ${PORT}`,
        port: PORT,
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
