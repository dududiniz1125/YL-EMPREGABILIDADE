import { readFileSync } from "node:fs"
import { join } from "node:path"

/** Lê as chaves do Supabase de TESTE (supabase/test-stack/.env). */
function loadStackEnv() {
  const raw = readFileSync(join(__dirname, "../../supabase/test-stack/.env"), "utf8")
  const env: Record<string, string> = {}
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const stack = loadStackEnv()
export const SUPABASE_URL = process.env.TEST_SUPABASE_URL ?? "http://localhost:54321"
export const ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY ?? stack.ANON_KEY
export const SERVICE_KEY = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ?? stack.SERVICE_ROLE_KEY
export const MAILPIT_URL = process.env.TEST_MAILPIT_URL ?? "http://localhost:54324"
