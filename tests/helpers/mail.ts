import { MAILPIT_URL } from "./env"

/** Espera o e-mail chegar no Mailpit (SMTP falso do Supabase de teste) e devolve o link. */
export async function waitForEmailLink(to: string, contains = "/auth/confirm", timeoutMs = 20_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const r = await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`)
    const list = (await r.json()) as { messages?: { ID: string; Subject: string }[] }
    for (const m of list.messages ?? []) {
      const msg = (await (await fetch(`${MAILPIT_URL}/api/v1/message/${m.ID}`)).json()) as { HTML: string; Subject: string }
      const links = [...msg.HTML.matchAll(/href="([^"]+)"/g)].map((x) => x[1].replace(/&amp;/g, "&"))
      const link = links.find((l) => l.includes(contains))
      if (link) return { link, subject: msg.Subject }
    }
    await new Promise((res) => setTimeout(res, 500))
  }
  throw new Error(`E-mail para ${to} não chegou`)
}
