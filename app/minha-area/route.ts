import { NextResponse, type NextRequest } from "next/server"

import { getSession } from "@/lib/auth"
import { roleHome } from "@/lib/roles"

/** Leva cada pessoa para a área do seu papel. */
export async function GET(request: NextRequest) {
  const s = await getSession()
  const url = new URL(s ? roleHome[s.role] : "/entrar/", request.url)
  return NextResponse.redirect(url)
}
