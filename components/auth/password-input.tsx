"use client"

import { forwardRef, useId, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { FieldShell, inputClass } from "@/components/forms/fields"
import { cn } from "@/lib/utils"

type Props = Omit<React.ComponentPropsWithoutRef<"input">, "type"> & {
  label: string
  error?: string
  hint?: string
  wrapperClassName?: string
}

/** Campo de senha com botão mostrar/ocultar (área de toque de 44px). */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, wrapperClassName, className, id, required, ...props }, ref) => {
    const [show, setShow] = useState(false)
    const auto = useId()
    const fid = id ?? auto
    return (
      <FieldShell
        label={label}
        htmlFor={fid}
        required={required}
        error={error}
        hint={hint}
        hintId={`${fid}-hint`}
        errorId={`${fid}-error`}
        className={wrapperClassName}
      >
        <div className="relative">
          <input
            ref={ref}
            id={fid}
            type={show ? "text" : "password"}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={cn(inputClass, "pr-14", className)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={show}
            className="text-ink-soft hover:text-ink absolute top-1/2 right-1 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-lg"
          >
            {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
          </button>
        </div>
      </FieldShell>
    )
  }
)
PasswordInput.displayName = "PasswordInput"
