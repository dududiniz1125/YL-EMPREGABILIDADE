/**
 * Cria (ou atualiza) o usuário administrador da YL.
 *
 *   npm run seed:admin
 *
 * Lê do .env.local (NUNCA coloque a senha no código, em commit ou no README):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * O e-mail já sai confirmado, o papel vira "admin" e o painel pede para
 * trocar a senha no primeiro acesso.
 */
import { createClient } from "@supabase/supabase-js"

function env(name: string, ...alts: string[]) {
  for (const n of [name, ...alts]) if (process.env[n]) return process.env[n] as string
  console.error(`✗ Variável ${name} ausente no .env.local`)
  process.exit(1)
}

const url = env("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL")
const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY")
const email = env("ADMIN_EMAIL").trim().toLowerCase()
const password = env("ADMIN_PASSWORD")

const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

async function findUserId(): Promise<string | null> {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const u = data.users.find((x) => x.email?.toLowerCase() === email)
    if (u) return u.id
    if (data.users.length < 200) return null
  }
  return null
}

async function main() {
  let id = await findUserId()
  if (id) {
    const { error } = await db.auth.admin.updateUserById(id, { password, email_confirm: true })
    if (error) throw error
    console.log(`✓ Usuário existente atualizado (${email})`)
  } else {
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: {} })
    if (error) throw error
    id = data.user.id
    console.log(`✓ Usuário criado (${email})`)
  }
  const { error } = await db
    .from("profiles")
    .upsert({ id, role: "admin", nome: "Administrador YL", must_change_password: true }, { onConflict: "id" })
  if (error) throw error
  console.log("✓ Papel admin definido. No primeiro acesso, o painel vai pedir a troca de senha.")
}

main().catch((e) => {
  console.error("✗ Falhou:", e instanceof Error ? e.message : e)
  process.exit(1)
})
