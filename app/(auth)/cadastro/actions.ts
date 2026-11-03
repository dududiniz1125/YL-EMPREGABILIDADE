"use server"

import { siteConfig } from "@/lib/site-config"

/**
 * Aviso por e-mail para a equipe a cada cadastro (via Formspree).
 * É só notificação: o dado fica salvo no Supabase. Envia o mínimo.
 */
export async function notifySignup(tipo: "candidato" | "empresa", resumo: { nome: string; area?: string; cidade?: string }) {
  const endpoint = tipo === "candidato" ? siteConfig.formspree.candidato : siteConfig.formspree.empresa
  if (!endpoint) return
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        _subject: tipo === "candidato" ? `Novo candidato: ${resumo.nome}` : `Nova empresa cadastrada: ${resumo.nome}`,
        tipo,
        nome: resumo.nome.slice(0, 120),
        area: resumo.area?.slice(0, 80) ?? "",
        cidade: resumo.cidade?.slice(0, 80) ?? "",
        aviso: "Dados completos no painel admin da YL.",
      }),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // notificação é opcional; nunca bloqueia o cadastro
  }
}
