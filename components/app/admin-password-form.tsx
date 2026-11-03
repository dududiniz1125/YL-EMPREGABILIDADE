"use client"

import { useRouter } from "next/navigation"

import { marcarSenhaTrocada } from "@/app/admin/actions"
import { NewPasswordForm } from "@/components/auth/new-password-form"

export function AdminPasswordForm() {
  const router = useRouter()
  return (
    <NewPasswordForm
      submitLabel="Trocar senha"
      afterSave={async () => {
        await marcarSenhaTrocada()
        router.refresh()
      }}
    />
  )
}
