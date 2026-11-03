import Link from "next/link"

import { cn } from "@/lib/utils"

/** Abas de filtro por status (links, funcionam sem JS). */
export function FilterTabs({ base, current, options, extra = "" }: { base: string; current?: string; options: [string, string][]; extra?: string }) {
  return (
    <nav aria-label="Filtrar por status" className="-mx-4 mb-5 overflow-x-auto px-4">
      <ul className="flex gap-2">
        {options.map(([v, label]) => {
          const active = (current ?? "") === v
          return (
            <li key={v}>
              <Link
                href={`${base}?${v ? `status=${v}` : ""}${extra}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 font-semibold whitespace-nowrap",
                  active ? "bg-ink text-paper border-ink" : "border-line text-ink bg-white hover:bg-paper-dim"
                )}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
