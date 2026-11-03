"use client"

import { forwardRef, useId } from "react"
import { AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export const inputClass =
  "border-input text-ink placeholder:text-ink-soft/60 h-12 w-full rounded-xl border bg-white px-4 text-base shadow-xs transition-[border-color,box-shadow] outline-none focus-visible:border-sprout-deep focus-visible:ring-4 focus-visible:ring-sprout/25 aria-invalid:border-destructive aria-invalid:ring-destructive/15 disabled:opacity-60"

export function FieldShell({
  label,
  htmlFor,
  required,
  optional,
  hint,
  error,
  className,
  children,
  hintId,
  errorId,
}: {
  label: string
  htmlFor: string
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
  hintId?: string
  errorId?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-ink text-[0.95rem] font-semibold">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        )}
        {optional && <span className="text-ink-soft font-normal"> (opcional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-ink-soft text-sm">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-destructive flex items-center gap-1.5 text-sm font-medium">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}

type InputProps = React.ComponentPropsWithoutRef<"input"> & {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  wrapperClassName?: string
}

export const TextField = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, optional, required, wrapperClassName, className, id, ...props }, ref) => {
    const auto = useId()
    const fid = id ?? auto
    const hintId = `${fid}-hint`
    const errorId = `${fid}-error`
    return (
      <FieldShell
        label={label}
        htmlFor={fid}
        required={required}
        optional={optional}
        hint={hint}
        error={error}
        className={wrapperClassName}
        hintId={hintId}
        errorId={errorId}
      >
        <input
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(inputClass, className)}
          {...props}
        />
      </FieldShell>
    )
  }
)
TextField.displayName = "TextField"

type SelectProps = React.ComponentPropsWithoutRef<"select"> & {
  label: string
  hint?: string
  error?: string
  options: readonly string[]
  placeholder?: string
  wrapperClassName?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, placeholder, required, wrapperClassName, className, id, ...props }, ref) => {
    const auto = useId()
    const fid = id ?? auto
    const hintId = `${fid}-hint`
    const errorId = `${fid}-error`
    return (
      <FieldShell
        label={label}
        htmlFor={fid}
        required={required}
        hint={hint}
        error={error}
        className={wrapperClassName}
        hintId={hintId}
        errorId={errorId}
      >
        <select
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            inputClass,
            "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%234a5957%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:20px] bg-[right_14px_center] bg-no-repeat pr-11",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </FieldShell>
    )
  }
)
SelectField.displayName = "SelectField"

type TextareaProps = React.ComponentPropsWithoutRef<"textarea"> & {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  wrapperClassName?: string
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, optional, wrapperClassName, className, id, ...props }, ref) => {
    const auto = useId()
    const fid = id ?? auto
    const hintId = `${fid}-hint`
    const errorId = `${fid}-error`
    return (
      <FieldShell
        label={label}
        htmlFor={fid}
        optional={optional}
        hint={hint}
        error={error}
        className={wrapperClassName}
        hintId={hintId}
        errorId={errorId}
      >
        <textarea
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(inputClass, "h-auto min-h-28 py-3", className)}
          {...props}
        />
      </FieldShell>
    )
  }
)
TextareaField.displayName = "TextareaField"

/** Checkbox nativo grande (≥ 44px de área de toque). */
export const CheckboxField = forwardRef<
  HTMLInputElement,
  Omit<React.ComponentPropsWithoutRef<"input">, "type"> & {
    children: React.ReactNode
    error?: string
    tone?: "candidato" | "empresa"
  }
>(({ children, error, tone = "candidato", id, className, ...props }, ref) => {
  const auto = useId()
  const fid = id ?? auto
  return (
    <label
      htmlFor={fid}
      className={cn(
        "border-input has-[:checked]:bg-sprout-soft/50 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-2.5 text-[0.95rem] transition-colors",
        tone === "empresa" && "has-[:checked]:bg-seed-soft/60",
        error && "border-destructive",
        className
      )}
    >
      <input
        ref={ref}
        id={fid}
        type="checkbox"
        aria-invalid={error ? true : undefined}
        className={cn(
          "size-5 shrink-0 cursor-pointer rounded",
          tone === "candidato" ? "accent-[#3f6e1f]" : "accent-[#8a4b1e]"
        )}
        {...props}
      />
      <span className="text-ink">{children}</span>
    </label>
  )
})
CheckboxField.displayName = "CheckboxField"

export function FormStatus({
  status,
  message,
}: {
  status: "idle" | "success" | "error"
  message: string
}) {
  return (
    <div aria-live="polite" role="status" className="min-h-0">
      {status !== "idle" && (
        <p
          className={cn(
            "rounded-xl px-4 py-3 text-[0.95rem] font-medium",
            status === "success"
              ? "bg-sprout-soft text-sprout-deep"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {message}
        </p>
      )}
    </div>
  )
}
