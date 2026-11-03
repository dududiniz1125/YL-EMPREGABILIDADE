import Link from "next/link"

import { cn } from "@/lib/utils"

export function Card({ className, children, ...p }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("bg-card border-line/80 rounded-3xl border p-5 shadow-[var(--shadow-soft)] sm:p-6", className)} {...p}>
      {children}
    </div>
  )
}

const badgeTones: Record<string, string> = {
  // vagas
  pendente: "bg-amber-soft text-amber-deep",
  aberta: "bg-sprout-soft text-sprout-deep",
  encerrada: "bg-paper-dim text-ink-soft",
  // empresas
  aprovada: "bg-sprout-soft text-sprout-deep",
  bloqueada: "bg-destructive/10 text-destructive",
  // candidatos
  ativo: "bg-sprout-soft text-sprout-deep",
  contratado: "bg-sprout-deep text-white",
  inativo: "bg-paper-dim text-ink-soft",
  // candidaturas
  inscrito: "bg-paper-dim text-ink",
  em_analise: "bg-amber-soft text-amber-deep",
  entrevista: "bg-seed-soft text-seed-deep",
  nao_selecionado: "bg-paper-dim text-ink-soft",
}

export const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  aberta: "Aberta",
  encerrada: "Encerrada",
  aprovada: "Aprovada",
  bloqueada: "Bloqueada",
  ativo: "Ativo",
  contratado: "Contratado",
  inativo: "Inativo",
  inscrito: "Inscrito",
  em_analise: "Em análise",
  entrevista: "Entrevista",
  nao_selecionado: "Não selecionado",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", badgeTones[status] ?? "bg-paper-dim", className)}>
      {statusLabel[status] ?? status}
    </span>
  )
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="border-line rounded-3xl border border-dashed bg-white/50 px-6 py-12 text-center">
      <p className="text-ink font-display text-xl font-semibold">{title}</p>
      {text && <p className="text-ink-soft mx-auto mt-2 max-w-md">{text}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

type BtnTone = "candidato" | "empresa" | "admin" | "outline" | "danger"
const btnTones: Record<BtnTone, string> = {
  candidato: "bg-sprout-deep text-white hover:bg-sprout-deep/90",
  empresa: "bg-seed text-white hover:bg-seed-deep",
  admin: "bg-ink text-paper hover:bg-ink/90",
  outline: "border-line text-ink border bg-white hover:bg-paper-dim",
  danger: "bg-destructive text-white hover:bg-destructive/90",
}
export function btnClass(tone: BtnTone = "candidato", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-semibold transition-colors disabled:opacity-60",
    btnTones[tone],
    className
  )
}

export function ButtonLink({ href, tone, className, children }: { href: string; tone?: BtnTone; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={btnClass(tone, className)}>
      {children}
    </Link>
  )
}

export function Flash({ tone = "success", children }: { tone?: "success" | "error" | "info"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mb-5 rounded-2xl px-4 py-3 font-medium",
        tone === "success" && "bg-sprout-soft text-sprout-deep",
        tone === "error" && "bg-destructive/10 text-destructive",
        tone === "info" && "bg-amber-soft text-ink"
      )}
    >
      {children}
    </div>
  )
}

export function Dl({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-ink-soft text-sm">{k}</dt>
          <dd className="text-ink font-medium break-words">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  )
}
