import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { ANON_KEY, SERVICE_KEY, SUPABASE_URL } from "./env"

const opts = { auth: { persistSession: false, autoRefreshToken: false } }

export const adminDb = () => createClient(SUPABASE_URL, SERVICE_KEY, opts)
export const anonDb = () => createClient(SUPABASE_URL, ANON_KEY, opts)

let n = 0
export const uniqueEmail = (prefix: string) =>
  `${prefix}.${Date.now()}.${process.pid}.${n++}@teste.yl`

export const PASSWORD = "Senha-de-teste-123"

export function candidatoMeta(over: Record<string, unknown> = {}) {
  return {
    role: "candidato",
    nome: "Candidato Teste",
    whatsapp: "(11) 98888-7777",
    cidade: "São Paulo, Lapa",
    area_principal: "Cumim",
    outras_areas: [],
    pretensao_salarial: "2000",
    turnos: ["Noite"],
    experiencias: [{ empresa: "Bar X", funcao: "Cumim", tempo: "1 ano" }],
    consentimento: true,
    ...over,
  }
}

export function empresaMeta(over: Record<string, unknown> = {}) {
  return {
    role: "empresa",
    empresa: "Restaurante Teste",
    responsavel: "Responsável Teste",
    whatsapp: "(11) 3333-4444",
    bairro: "Pinheiros",
    cnpj: "",
    consentimento: true,
    ...over,
  }
}

/** Cria um usuário já confirmado (o trigger cria perfil + cadastro). */
export async function createUser(meta: Record<string, unknown> | null, prefix = "u") {
  const email = uniqueEmail(prefix)
  const { data, error } = await adminDb().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: meta ?? {},
  })
  if (error) throw error
  return { id: data.user!.id, email }
}

export async function createAdmin() {
  const u = await createUser(null, "admin")
  const { error } = await adminDb().from("profiles").insert({ id: u.id, role: "admin", nome: "Admin" })
  if (error) throw error
  return u
}

export async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(SUPABASE_URL, ANON_KEY, opts)
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD })
  if (error) throw error
  return c
}

/** Cria uma vaga para a empresa e (opcionalmente) abre via service role. */
export async function createVaga(empresaId: string, status: "pendente" | "aberta" | "encerrada" = "aberta", over: Record<string, unknown> = {}) {
  const { data, error } = await adminDb()
    .from("vagas")
    .insert({ empresa_id: empresaId, titulo: "Vaga teste", area: "Cumim", status, ...over })
    .select("id")
    .single()
  if (error) throw error
  return data.id as string
}
