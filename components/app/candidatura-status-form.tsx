import { setCandidaturaStatus } from "@/app/admin/actions"
import { statusLabel } from "@/components/app/ui"

const ALL = ["inscrito", "em_analise", "entrevista", "contratado", "nao_selecionado"] as const

/** Muda o status de uma candidatura (admin). Funciona sem JS. */
export function CandidaturaStatusForm({ id, status, back }: { id: string; status: string; back: string }) {
  return (
    <form action={setCandidaturaStatus} className="flex gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="back" value={back} />
      <label className="sr-only" htmlFor={`st-${id}`}>
        Status
      </label>
      <select id={`st-${id}`} name="status" defaultValue={status} className="border-input h-11 min-w-0 flex-1 rounded-xl border bg-white px-3 text-[0.95rem]">
        {ALL.map((s) => (
          <option key={s} value={s}>
            {statusLabel[s]}
          </option>
        ))}
      </select>
      <button className="bg-ink text-paper h-11 shrink-0 rounded-xl px-4 text-sm font-semibold">Mudar</button>
    </form>
  )
}
