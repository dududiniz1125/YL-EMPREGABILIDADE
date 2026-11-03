import Link from "next/link"
import { Download } from "lucide-react"

import { PageHeader } from "@/components/app/app-shell"
import { btnClass, Card, EmptyState, Flash, StatusBadge } from "@/components/app/ui"
import { inputClass } from "@/components/forms/fields"
import { buscarCandidatos, melhorNota, type CandFiltro } from "@/lib/admin-candidatos"
import { requireRole } from "@/lib/auth"
import { formatBRL, formatDate } from "@/lib/parse"
import { getPublicConfig } from "@/lib/public-config"

export default async function AdminCandidatos({ searchParams }: { searchParams: Promise<CandFiltro & { ok?: string }> }) {
  const sp = await searchParams
  await requireRole("admin")
  const [rows, { areas }] = await Promise.all([buscarCandidatos(sp, 300), getPublicConfig()])
  const filtros = new URLSearchParams(
    Object.entries({ q: sp.q, area: sp.area, bairro: sp.bairro, status: sp.status, nota: sp.nota, pretensao: sp.pretensao }).filter(([, v]) => v) as [string, string][]
  )

  return (
    <>
      {sp.ok === "excluido" && <Flash>Candidato excluído (conta e dados apagados).</Flash>}
      <PageHeader
        title="Candidatos"
        description={`${rows.length} encontrado${rows.length === 1 ? "" : "s"}`}
        actions={
          <a href={`/admin/candidatos/exportar/?${filtros}`} className={btnClass("outline")}>
            <Download className="size-4" aria-hidden /> Exportar CSV
          </a>
        }
      />
      <form role="search" className="bg-card border-line/80 mb-6 grid gap-3 rounded-3xl border p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]">
        <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
          <span className="text-ink text-sm font-semibold">Nome</span>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Buscar por nome" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink text-sm font-semibold">Área</span>
          <select name="area" defaultValue={sp.area ?? ""} className={inputClass}>
            <option value="">Todas</option>
            {areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink text-sm font-semibold">Cidade/bairro</span>
          <input name="bairro" defaultValue={sp.bairro ?? ""} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink text-sm font-semibold">Status</span>
          <select name="status" defaultValue={sp.status ?? ""} className={inputClass}>
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="contratado">Contratado</option>
            <option value="inativo">Inativo</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink text-sm font-semibold">Nota mín.</span>
          <input name="nota" type="number" min={0} max={10} step={0.5} defaultValue={sp.nota ?? ""} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink text-sm font-semibold">Pretensão até</span>
          <input name="pretensao" type="number" min={0} step={100} defaultValue={sp.pretensao ?? ""} placeholder="R$" className={inputClass} />
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
          <button className={btnClass("admin", "h-12 flex-1")}>Filtrar</button>
          {filtros.size > 0 && (
            <Link href="/admin/candidatos/" className={btnClass("outline", "h-12")}>
              Limpar
            </Link>
          )}
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="Nenhum candidato encontrado" text="Ajuste os filtros acima." />
      ) : (
        <>
          {/* celular: cartões */}
          <ul className="space-y-3 lg:hidden">
            {rows.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/candidatos/${c.id}/`}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-ink truncate font-semibold">{c.nome}</p>
                        <p className="text-ink-soft truncate text-sm">
                          {c.area_principal} · {c.cidade}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-ink-soft mt-2 text-sm">
                      Nota: {melhorNota(c)?.toLocaleString("pt-BR") ?? "—"} · {formatBRL(c.pretensao_salarial)}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          {/* desktop: tabela */}
          <Card className="hidden overflow-x-auto p-0 lg:block">
            <table className="w-full text-left text-[0.95rem]">
              <thead className="border-line text-ink-soft border-b text-sm">
                <tr>
                  {["Nome", "Área", "Cidade/bairro", "Nota", "Pretensão", "Status", "Cadastro"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-paper-dim/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/candidatos/${c.id}/`} className="text-ink inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">
                        {c.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{c.area_principal}</td>
                    <td className="px-4 py-3">{c.cidade}</td>
                    <td className="px-4 py-3">{melhorNota(c)?.toLocaleString("pt-BR") ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatBRL(c.pretensao_salarial)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </>
  )
}
