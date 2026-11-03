export type SubmitResult = { ok: true } | { ok: false; message: string }

/** Envia os dados para o Formspree (JSON) e devolve uma mensagem amigável em caso de erro. */
export async function submitToFormspree(
  endpoint: string,
  data: Record<string, unknown>
): Promise<SubmitResult> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) return { ok: true }
    let detail = ""
    try {
      const body = (await res.json()) as { errors?: { message?: string }[] }
      detail = body.errors?.map((e) => e.message).filter(Boolean).join(" ") ?? ""
    } catch {
      /* resposta sem JSON */
    }
    return {
      ok: false,
      message: `Não conseguimos enviar agora${detail ? ` (${detail})` : ""}. Tente de novo em instantes ou escreva para nosso e-mail.`,
    }
  } catch {
    return {
      ok: false,
      message: "Sem conexão com a internet. Confira seu sinal e tente enviar de novo.",
    }
  }
}
