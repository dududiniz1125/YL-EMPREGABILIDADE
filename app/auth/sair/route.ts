import { NextResponse, type NextRequest } from "next/server"

import { getServerSupabase } from "@/lib/supabase/server"

/** Sair (POST para não ser disparado por links/prefetch). */
export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/entrar/?ok=saiu", request.url), { status: 303 })
}
