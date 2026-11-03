import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env"

export const dynamic = "force-dynamic"

/**
 * Chamado 1x por dia pelo Cron da Vercel (vercel.json). Faz uma consulta leve
 * para o projeto Supabase gratuito não ser pausado por falta de uso.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  if (!isSupabaseConfigured) return NextResponse.json({ ok: false, motivo: "supabase não configurado" })
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  const { error } = await db.from("configuracoes").select("id").limit(1)
  return NextResponse.json({ ok: !error, em: new Date().toISOString() })
}
