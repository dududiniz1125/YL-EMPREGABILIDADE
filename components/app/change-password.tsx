"use client"

import { NewPasswordForm } from "@/components/auth/new-password-form"

/** Troca de senha dentro das áreas logadas. */
export function ChangePassword({ afterSave }: { afterSave?: () => Promise<void> }) {
  return <NewPasswordForm submitLabel="Trocar senha" afterSave={afterSave} />
}
