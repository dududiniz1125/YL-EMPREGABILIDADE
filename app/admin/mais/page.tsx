import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { PageHeader } from "@/components/app/app-shell"
import { Card } from "@/components/app/ui"
import { requireRole } from "@/lib/auth"
import { adminNav } from "@/lib/admin-nav"

export default async function AdminMais() {
  await requireRole("admin")
  return (
    <>
      <PageHeader title="Mais" />
      <Card className="p-0">
        <ul className="divide-line divide-y">
          {adminNav.slice(4).map((i) => (
            <li key={i.href}>
              <Link href={i.href} className="text-ink flex min-h-14 items-center justify-between px-5 text-lg font-medium">
                {i.label} <ChevronRight className="text-ink-soft size-5" aria-hidden />
              </Link>
            </li>
          ))}
          <li>
            <form action="/auth/sair/" method="post">
              <button className="text-destructive flex min-h-14 w-full items-center px-5 text-lg font-semibold">Sair</button>
            </form>
          </li>
        </ul>
      </Card>
    </>
  )
}
