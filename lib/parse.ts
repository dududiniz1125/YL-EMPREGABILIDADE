/** "R$ 2.500,00" → "2500.00" (ou "" se vazio) */
export function currencyToNumber(v: string) {
  const d = v.replace(/\D/g, "")
  if (!d) return ""
  return (Number(d) / 100).toFixed(2)
}

export function formatBRL(v: number | string | null | undefined) {
  if (v === null || v === undefined || v === "") return "—"
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function formatDateTime(v: string | null | undefined) {
  if (!v) return "—"
  return new Date(v).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(v: string | null | undefined) {
  if (!v) return "—"
  return new Date(v).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
}

/** Converte "2026-11-20" + "14:00" (horário de Brasília) em ISO UTC */
export function brtToIso(date: string, time: string) {
  if (!date) return null
  return new Date(`${date}T${time || "00:00"}:00-03:00`).toISOString()
}

/** ISO → { date: "YYYY-MM-DD", time: "HH:MM" } no horário de Brasília */
export function isoToBrt(iso: string | null | undefined) {
  if (!iso) return { date: "", time: "" }
  const d = new Date(new Date(iso).getTime() - 3 * 3600_000)
  return { date: d.toISOString().slice(0, 10), time: d.toISOString().slice(11, 16) }
}
