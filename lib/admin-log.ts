import "server-only"

import type { Session } from "@/lib/auth"
import { getServerSupabase } from "@/lib/supabase/server"

/** Registro simples das ações do admin: quem, o quê, quando. */
export async function logAdmin(s: Session, acao: string, alvoTipo?: string, alvoId?: string, detalhes: Record<string, unknown> = {}) {
  const supabase = await getServerSupabase()
  await supabase.from("admin_log").insert({ admin_id: s.userId, acao, alvo_tipo: alvoTipo ?? null, alvo_id: alvoId ?? null, detalhes })
}
