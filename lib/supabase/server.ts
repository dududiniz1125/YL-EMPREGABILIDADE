import "server-only"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { applyRemember, readRemember } from "./cookies"
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env"

/** Cliente do Supabase para Server Components, Server Actions e Route Handlers. */
export async function getServerSupabase() {
  const store = await cookies()
  const remember = readRemember((n) => store.get(n)?.value)
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, applyRemember(options, remember)))
        } catch {
          // chamado de um Server Component: o proxy já renova a sessão
        }
      },
    },
  })
}
