"use client"

import { useRef } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

import { btnClass } from "@/components/app/ui"

/**
 * Botão de ação destrutiva: abre um diálogo de confirmação (ESC fecha)
 * e só então envia o formulário em que está.
 */
export function ConfirmSubmit({
  label,
  title,
  text,
  confirmLabel = "Sim, confirmar",
  tone = "danger",
  className,
}: {
  label: React.ReactNode
  title: string
  text: string
  confirmLabel?: string
  tone?: "danger" | "outline" | "admin" | "candidato" | "empresa"
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <button type="button" ref={btnRef} className={btnClass(tone, className)} onClick={() => ref.current?.showModal()}>
        {label}
      </button>
      <dialog
        ref={ref}
        className="bg-card text-ink m-auto w-[min(92vw,440px)] rounded-3xl p-0 shadow-[var(--shadow-lift)] backdrop:bg-black/40"
        aria-labelledby="confirm-title"
      >
        <div className="p-6">
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <p className="text-ink-soft mt-2 leading-relaxed">{text}</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className={btnClass("outline")} onClick={() => ref.current?.close()}>
              Cancelar
            </button>
            <SubmitInDialog tone={tone} label={confirmLabel} onDone={() => ref.current?.close()} />
          </div>
        </div>
      </dialog>
    </>
  )
}

function SubmitInDialog({ label, tone, onDone }: { label: string; tone: Parameters<typeof btnClass>[0]; onDone: () => void }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className={btnClass(tone)}
      disabled={pending}
      onClick={(e) => {
        // o diálogo está dentro do <form>: envia e fecha
        const form = (e.currentTarget as HTMLButtonElement).form
        if (form) {
          e.preventDefault()
          form.requestSubmit()
          setTimeout(onDone, 50)
        }
      }}
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {label}
    </button>
  )
}

/** Botão de envio com estado de carregando (para server actions). */
export function SubmitButton({
  children,
  tone = "candidato",
  className,
  pendingLabel = "Salvando…",
}: {
  children: React.ReactNode
  tone?: Parameters<typeof btnClass>[0]
  className?: string
  pendingLabel?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={btnClass(tone, className)}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? pendingLabel : children}
    </button>
  )
}
