"use client"

import { useId, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"

import { FieldShell, inputClass } from "@/components/forms/fields"
import { normalize, OUTRA, type Categoria } from "@/lib/areas"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  categorias: Categoria[]
  /** modo controlado (react-hook-form); sem isso o campo guarda o próprio estado */
  value?: string
  defaultValue?: string
  onChange?: (v: string) => void
  onBlur?: () => void
  /** nome do campo escondido, para formulários sem JavaScript de validação (server actions) */
  name?: string
  required?: boolean
  optional?: boolean
  error?: string
  hint?: string
  placeholder?: string
  /** esconde estas opções (ex.: a área principal na lista de "outras áreas") */
  exclude?: string[]
  /** permite escolher "Outra" e escrever a função */
  allowOutra?: boolean
  /** limpa o campo depois de escolher (usado para adicionar várias áreas) */
  clearOnSelect?: boolean
  tone?: "candidato" | "empresa" | "admin"
  id?: string
}

/**
 * Busca de área/função com sugestões agrupadas por categoria.
 * - Digite parte do nome (sem precisar de acento) e escolha na lista.
 * - Teclado: ↑ ↓ para navegar, Enter escolhe, Esc fecha.
 * - "Outra" abre um campo para escrever a função; o valor final é o texto digitado.
 */
export function AreaCombobox({
  label,
  categorias,
  value: controlled,
  defaultValue = "",
  onChange,
  onBlur,
  name,
  required,
  optional,
  error,
  hint,
  placeholder = "Busque: vendedor, professor…",
  exclude = [],
  allowOutra = true,
  clearOnSelect = false,
  tone = "candidato",
  id,
}: Props) {
  const auto = useId()
  const fid = id ?? auto
  const listId = `${fid}-lista`
  const outraId = `${fid}-outra`
  const todas = useMemo(() => new Set(categorias.flatMap((c) => c.areas)), [categorias])

  const [internal, setInternal] = useState(defaultValue)
  const value = controlled ?? internal
  const isOutraValue = !!value && !todas.has(value)
  const [outraMode, setOutraMode] = useState(isOutraValue)
  const [query, setQuery] = useState<string | null>(null) // null = mostrando o valor escolhido
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const setValue = (v: string) => {
    if (controlled === undefined) setInternal(v)
    onChange?.(v)
  }

  // grupos filtrados pela busca
  const grupos = useMemo(() => {
    const q = normalize(query ?? "")
    const fora = new Set(exclude)
    return categorias
      .map((c) => ({
        nome: c.nome,
        areas: c.areas.filter(
          (a) => !fora.has(a) && (a !== OUTRA || allowOutra) && (!q || a === OUTRA || normalize(a).includes(q) || normalize(c.nome).includes(q))
        ),
      }))
      .filter((g) => g.areas.length > 0)
  }, [categorias, query, exclude, allowOutra])
  const flat = useMemo(() => grupos.flatMap((g) => g.areas), [grupos])
  const semResultado = flat.filter((a) => a !== OUTRA).length === 0

  function escolher(a: string) {
    setOpen(false)
    setQuery(null)
    if (a === OUTRA) {
      setOutraMode(true)
      setValue("")
      setTimeout(() => document.getElementById(outraId)?.focus(), 0)
      return
    }
    setOutraMode(false)
    setValue(a)
    if (clearOnSelect) {
      setValue("")
      if (controlled === undefined) setInternal("")
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(flat.length - 1, open ? i + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === "Enter") {
      // Enter sem nada destacado escolhe a primeira função que bate com a busca
      const alvo = flat[active] ?? (query ? flat.find((a) => a !== OUTRA) : undefined)
      if (open && alvo) {
        e.preventDefault()
        escolher(alvo)
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      setQuery(null)
    }
  }

  const accent =
    tone === "empresa" ? "bg-seed-soft text-seed-deep" : tone === "admin" ? "bg-paper-dim text-ink" : "bg-sprout-soft text-sprout-deep"
  const shown = query ?? (outraMode ? OUTRA : clearOnSelect ? "" : value)
  let idx = -1

  return (
    <FieldShell
      label={label}
      htmlFor={fid}
      required={required}
      optional={optional}
      error={error}
      hint={hint}
      hintId={`${fid}-hint`}
      errorId={`${fid}-error`}
    >
      {name && <input type="hidden" name={name} value={value} />}
      <div className="relative">
        <Search className="text-ink-soft pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" aria-hidden />
        <input
          ref={inputRef}
          id={fid}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && flat[active] ? `${fid}-op-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder={placeholder}
          value={shown}
          onFocus={(e) => {
            setOpen(true)
            setActive(-1)
            if (!clearOnSelect && !query) e.currentTarget.select()
            // no celular, deixa espaço para a lista acima do teclado
            setTimeout(() => inputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }), 250)
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onBlur={() => {
            setTimeout(() => {
              setOpen(false)
              setQuery(null)
              onBlur?.()
            }, 120)
          }}
          onKeyDown={onKeyDown}
          className={cn(inputClass, "pr-[5.5rem] pl-10")}
        />
        {shown && !clearOnSelect ? (
          <button
            type="button"
            aria-label={`Limpar ${label}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setValue("")
              setOutraMode(false)
              setQuery("")
              setOpen(true)
              inputRef.current?.focus()
            }}
            className="text-ink-soft hover:text-ink absolute top-1/2 right-9 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-lg"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
        <ChevronDown className="text-ink-soft pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" aria-hidden />

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="border-line bg-card absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-[min(55vh,22rem)] overflow-y-auto overscroll-contain rounded-2xl border p-1.5 shadow-[var(--shadow-lift)]"
          >
            {grupos.map((g, gi) => (
              <li key={g.nome} role="presentation">
                {g.nome !== "Outra" && (
                  <p id={`${fid}-g${gi}`} className="text-ink-soft px-3 pt-2.5 pb-1 text-[0.72rem] font-semibold tracking-wider uppercase">
                    {g.nome}
                  </p>
                )}
                <ul role="group" aria-labelledby={g.nome !== "Outra" ? `${fid}-g${gi}` : undefined} aria-label={g.nome === "Outra" ? "Outra" : undefined}>
                  {g.areas.map((a) => {
                    idx++
                    const i = idx
                    const selected = a === OUTRA ? outraMode : a === value
                    return (
                      <li
                        key={a}
                        id={`${fid}-op-${i}`}
                        role="option"
                        aria-selected={selected}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => escolher(a)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-xl px-3 text-[0.98rem]",
                          i === active ? accent : "text-ink",
                          a === OUTRA && "border-line mt-1 border-t pt-1"
                        )}
                      >
                        <span>{a === OUTRA ? "Outra (escrever a função)" : a}</span>
                        {selected && <Check className="size-4 shrink-0" aria-hidden />}
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
            {semResultado && (
              <li role="presentation" className="text-ink-soft px-3 py-2 text-sm">
                Nenhuma função encontrada{allowOutra ? ". Escolha “Outra” e escreva a sua." : "."}
              </li>
            )}
          </ul>
        )}
      </div>

      {outraMode && allowOutra && !clearOnSelect && (
        <div className="mt-2">
          <label htmlFor={outraId} className="text-ink text-[0.95rem] font-semibold">
            Qual é a função?
            {required && (
              <span className="text-destructive" aria-hidden>
                {" "}
                *
              </span>
            )}
          </label>
          <input
            id={outraId}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            placeholder="Ex.: Auxiliar de biblioteca"
            className={cn(inputClass, "mt-1.5")}
            maxLength={80}
          />
        </div>
      )}
    </FieldShell>
  )
}

/** Várias áreas (ex.: "outras áreas que topa"), como etiquetas removíveis. */
export function AreaChips({
  label,
  categorias,
  value: controlled,
  defaultValue = [],
  onChange,
  name,
  exclude = [],
  max = 5,
  tone = "candidato",
  hint,
}: {
  label: string
  categorias: Categoria[]
  value?: string[]
  defaultValue?: string[]
  onChange?: (v: string[]) => void
  name?: string
  exclude?: string[]
  max?: number
  tone?: "candidato" | "empresa" | "admin"
  hint?: string
}) {
  const [internal, setInternal] = useState<string[]>(defaultValue)
  const lista = controlled ?? internal
  const set = (v: string[]) => {
    if (controlled === undefined) setInternal(v)
    onChange?.(v)
  }
  const chip = tone === "empresa" ? "bg-seed-soft text-seed-deep" : "bg-sprout-soft text-sprout-deep"
  return (
    <div>
      {name && lista.map((a) => <input key={a} type="hidden" name={name} value={a} />)}
      {lista.length < max ? (
        <AreaCombobox
          label={label}
          optional
          categorias={categorias}
          exclude={[...exclude, ...lista]}
          allowOutra={false}
          clearOnSelect
          placeholder="Buscar e adicionar"
          hint={hint ?? `Até ${max}.`}
          tone={tone}
          onChange={(a) => a && !lista.includes(a) && set([...lista, a])}
        />
      ) : (
        <p className="text-ink text-[0.95rem] font-semibold">
          {label} <span className="text-ink-soft font-normal">(máximo de {max})</span>
        </p>
      )}
      {lista.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2" aria-label={`${label} escolhidas`}>
          {lista.map((a) => (
            <li key={a} className={cn("inline-flex min-h-11 items-center gap-1 rounded-full pr-1 pl-4 text-sm font-semibold", chip)}>
              {a}
              <button
                type="button"
                onClick={() => set(lista.filter((x) => x !== a))}
                aria-label={`Remover ${a}`}
                className="inline-flex size-9 items-center justify-center rounded-full hover:bg-black/5"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
