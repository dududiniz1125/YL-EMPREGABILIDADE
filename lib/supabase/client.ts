"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

import { REMEMBER_COOKIE, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env"

let client: SupabaseClient | null = null

function rememberDisabled() {
  return typeof document !== "undefined" && document.cookie.split("; ").includes(`${REMEMBER_COOKIE}=0`)
}

/** Cliente do Supabase no navegador (uma instância por aba). */
export function getBrowserSupabase() {
  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      // "continuar conectado" desmarcado → cookies de sessão (somem ao fechar o navegador)
      cookieOptions: rememberDisabled() ? { maxAge: undefined } : undefined,
    })
  }
  return client
}

/** Recria o cliente (ex.: depois de mudar a preferência "continuar conectado"). */
export function resetBrowserSupabase() {
  client = null
}
