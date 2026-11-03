"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"

import { enviarProva } from "@/app/candidato/actions"
import { btnClass, Card } from "@/components/app/ui"
import { SuccessPanel } from "@/components/forms/success-panel"
import { cn } from "@/lib/utils"

type Q = { id: string; enunciado: string; alternativas: string[] }

/** Prova com uma questão por tela. A correção acontece no banco. */
export function ProvaRunner({ provaId, titulo, area, questoes }: { provaId: string; titulo: string; area: string; questoes: Q[] }) {
  const router = useRouter()
  const [i, setI] = useState(0)
  const [resp, setResp] = useState<Record<string, number>>({})
  const [sending, setSending] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [nota, setNota] = useState<number | null>(null)
  const q = questoes[i]
  const last = i === questoes.length - 1
  const escolhida = resp[q?.id]

  async function enviar() {
    setSending(true)
    setErro(null)
    const r = await enviarProva(provaId, resp)
    setSending(false)
    if (r.ok) setNota(r.nota)
    else setErro(r.message)
  }

  if (nota !== null) {
    return (
      <Card className="mx-auto max-w-xl">
        <SuccessPanel
          tone="candidato"
          title={`Prova enviada! Nota ${nota.toLocaleString("pt-BR")}`}
          message="Sua nota já faz parte do seu perfil. Agora é só se candidatar às vagas abertas."
          resetLabel="Ver vagas abertas"
          onReset={() => router.push("/candidato/vagas/")}
        />
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sprout-deep font-mono text-xs font-medium tracking-[0.16em] uppercase">{area}</p>
      <h1 className="text-ink mt-1 text-2xl font-semibold">{titulo}</h1>
      <div
        className="bg-paper-dim mt-4 h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-label="Progresso da prova"
        aria-valuemin={1}
        aria-valuemax={questoes.length}
        aria-valuenow={i + 1}
      >
        <div className="bg-sprout-deep h-full transition-[width]" style={{ width: `${((i + 1) / questoes.length) * 100}%` }} />
      </div>
      <Card className="mt-6">
        <p className="text-ink-soft text-sm font-semibold">
          Questão {i + 1} de {questoes.length}
        </p>
        <fieldset className="mt-2">
          <legend className="text-ink text-xl leading-snug font-semibold">{q.enunciado}</legend>
          <div className="mt-5 space-y-3">
            {q.alternativas.map((alt, k) => (
              <label
                key={k}
                className={cn(
                  "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-[1.02rem] transition-colors",
                  escolhida === k ? "border-sprout-deep bg-sprout-soft/50" : "border-line hover:border-sprout/60"
                )}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={escolhida === k}
                  onChange={() => setResp((r) => ({ ...r, [q.id]: k }))}
                  className="size-5 shrink-0 accent-[#3f6e1f]"
                />
                <span className="text-ink">{alt}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {erro && (
          <p role="alert" className="bg-destructive/10 text-destructive mt-4 rounded-xl px-4 py-3 font-medium">
            {erro}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          {i > 0 && (
            <button type="button" onClick={() => setI(i - 1)} className={btnClass("outline", "h-12")}>
              <ArrowLeft className="size-4" aria-hidden /> Anterior
            </button>
          )}
          {!last ? (
            <button type="button" disabled={escolhida === undefined} onClick={() => setI(i + 1)} className={btnClass("candidato", "h-12 flex-1")}>
              Próxima <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              disabled={sending || Object.keys(resp).length < questoes.length}
              onClick={enviar}
              className={btnClass("candidato", "h-12 flex-1")}
            >
              {sending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {sending ? "Enviando…" : "Enviar respostas"}
            </button>
          )}
        </div>
      </Card>
      <p className="text-ink-soft mt-4 text-center text-sm">
        A prova só pode ser enviada uma vez. <Link href="/candidato/prova/" className="underline">Sair sem enviar</Link>
      </p>
    </div>
  )
}
