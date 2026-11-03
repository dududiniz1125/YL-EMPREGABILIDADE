/**
 * Variáveis do Supabase. A integração Supabase da Vercel preenche
 * NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou a chave
 * "publishable" nas versões mais novas). Sem elas, o site público continua
 * funcionando e as áreas logadas mostram um aviso de configuração.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** Cookie com a preferência "continuar conectado" (0 = sessão some ao fechar o navegador). */
export const REMEMBER_COOKIE = "yl_lembrar"
