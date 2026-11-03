import { Banknote, CalendarClock, MapPin, Users } from "lucide-react"

import { Card, StatusBadge } from "@/components/app/ui"
import type { Vaga } from "@/lib/data"
import { formatBRL, formatDateTime } from "@/lib/parse"

export function VagaCard({
  vaga,
  showStatus,
  children,
  extra,
}: {
  vaga: Pick<Vaga, "titulo" | "area" | "bairro" | "salario" | "entrevista_em" | "descricao" | "status" | "quantidade">
  showStatus?: boolean
  children?: React.ReactNode
  extra?: React.ReactNode
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sprout-deep text-sm font-semibold">{vaga.area}</p>
          <h3 className="text-ink mt-0.5 text-xl font-semibold break-words">{vaga.titulo}</h3>
        </div>
        {showStatus && <StatusBadge status={vaga.status} />}
      </div>
      <ul className="text-ink-soft mt-3 grid gap-1.5 text-[0.95rem] sm:grid-cols-2">
        {vaga.bairro && (
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden /> {vaga.bairro}
          </li>
        )}
        {vaga.salario !== null && (
          <li className="flex items-center gap-2">
            <Banknote className="size-4 shrink-0" aria-hidden /> {formatBRL(vaga.salario)}
          </li>
        )}
        {vaga.entrevista_em && (
          <li className="flex items-center gap-2">
            <CalendarClock className="size-4 shrink-0" aria-hidden /> Entrevista: {formatDateTime(vaga.entrevista_em)}
          </li>
        )}
        <li className="flex items-center gap-2">
          <Users className="size-4 shrink-0" aria-hidden /> {vaga.quantidade} {vaga.quantidade > 1 ? "vagas" : "vaga"}
        </li>
      </ul>
      {vaga.descricao && <p className="text-ink-soft mt-3 line-clamp-4 whitespace-pre-line">{vaga.descricao}</p>}
      {extra}
      {children && <div className="mt-5 flex flex-wrap gap-2">{children}</div>}
    </Card>
  )
}
