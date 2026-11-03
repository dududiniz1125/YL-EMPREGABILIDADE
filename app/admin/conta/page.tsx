import { PageHeader } from "@/components/app/app-shell"
import { Card, Flash } from "@/components/app/ui"
import { AdminPasswordForm } from "@/components/app/admin-password-form"
import { requireRole } from "@/lib/auth"

export default async function AdminConta() {
  const s = await requireRole("admin")
  return (
    <>
      {s.mustChangePassword && <Flash tone="info">Por segurança, crie uma senha nova e forte. A senha inicial deixa de valer na hora.</Flash>}
      <PageHeader title="Minha conta" description={s.email} />
      <Card className="max-w-lg">
        <h2 className="text-ink mb-4 text-xl font-semibold">Trocar senha</h2>
        <AdminPasswordForm />
      </Card>
    </>
  )
}
