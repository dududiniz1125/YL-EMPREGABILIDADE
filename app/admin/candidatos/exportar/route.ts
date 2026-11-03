import { NextResponse, type NextRequest } from "next/server"

import { buscarCandidatos, melhorNota } from "@/lib/admin-candidatos"
import { getSession } from "@/lib/auth"
import { logAdmin } from "@/lib/admin-log"

const esc = (v: unknown) => {
  const s = String(v ?? "")
  // evita injeção de fórmula ao abrir no Excel/Sheets
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

/** CSV dos candidatos com os filtros atuais (só admin). */
export async function GET(request: NextRequest) {
  const s = await getSession()
  if (!s || s.role !== "admin") return NextResponse.redirect(new URL("/entrar/?erro=sem-permissao", request.url))
  const sp = Object.fromEntries(request.nextUrl.searchParams)
  const rows = await buscarCandidatos(sp, 10000)
  const header = ["Nome", "WhatsApp", "E-mail", "Cidade/bairro", "Área principal", "Outras áreas", "Pretensão", "Turnos", "Experiências", "Nota", "Status", "Cadastro"]
  const lines = rows.map((c) =>
    [
      c.nome,
      c.whatsapp,
      c.email,
      c.cidade,
      c.area_principal,
      c.outras_areas.join("; "),
      c.pretensao_salarial ?? "",
      c.turnos.join("; "),
      c.experiencias.map((e) => [e.funcao, e.empresa, e.tempo].filter(Boolean).join(" / ")).join("; "),
      melhorNota(c) ?? "",
      c.status,
      new Date(c.created_at).toLocaleDateString("pt-BR"),
    ]
      .map(esc)
      .join(";")
  )
  await logAdmin(s, "candidatos.exportar", "candidatos", undefined, { filtros: sp, total: rows.length })
  const csv = "﻿" + [header.map(esc).join(";"), ...lines].join("\r\n")
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidatos-yl-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
