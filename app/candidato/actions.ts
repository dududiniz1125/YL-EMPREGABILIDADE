"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { assertRole } from "@/lib/auth"
import { currencyToNumber } from "@/lib/parse"
import { getServiceSupabase } from "@/lib/supabase/admin"
import { getServerSupabase } from "@/lib/supabase/server"

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim()

export async function candidatar(formData: FormData) {
  const s = await assertRole("candidato")
  const vagaId = str(formData, "vaga_id")
  const back = str(formData, "back") || "/candidato/vagas/"
  const supabase = await getServerSupabase()
  const { error } = await supabase.from("candidaturas").insert({ candidato_id: s.userId, vaga_id: vagaId })
  revalidatePath("/candidato", "layout")
  const sep = back.includes("?") ? "&" : "?"
  if (error && error.code !== "23505") redirect(`${back}${sep}erro=candidatura`)
  redirect(`${back}${sep}ok=candidatura`)
}

export async function salvarPerfil(formData: FormData) {
  const s = await assertRole("candidato")
  const exps = [0, 1, 2]
    .map((i) => ({
      empresa: str(formData, `exp_empresa_${i}`),
      funcao: str(formData, `exp_funcao_${i}`),
      tempo: str(formData, `exp_tempo_${i}`),
    }))
    .filter((e) => e.empresa || e.funcao || e.tempo)
  const nome = str(formData, "nome")
  const cidade = str(formData, "cidade")
  const area = str(formData, "area_principal")
  if (nome.length < 3 || cidade.length < 2 || !area) {
    redirect("/candidato/perfil/?erro=dados")
  }
  const supabase = await getServerSupabase()
  const pret = currencyToNumber(str(formData, "pretensao"))
  const { error } = await supabase
    .from("candidatos")
    .update({
      nome,
      cidade,
      area_principal: area,
      outras_areas: formData.getAll("outras_areas").map(String).filter((a) => a !== area),
      turnos: formData.getAll("turnos").map(String),
      pretensao_salarial: pret === "" ? null : pret,
      experiencias: exps,
    })
    .eq("id", s.userId)
  await supabase.from("profiles").update({ nome }).eq("id", s.userId)
  revalidatePath("/candidato", "layout")
  redirect(error ? "/candidato/perfil/?erro=salvar" : "/candidato/perfil/?ok=perfil")
}

/** LGPD: exclui a conta e todos os dados do candidato. */
export async function excluirMinhaConta() {
  const s = await assertRole("candidato")
  const admin = getServiceSupabase()
  const { error } = await admin.auth.admin.deleteUser(s.userId)
  if (error) redirect("/candidato/perfil/?erro=excluir")
  const supabase = await getServerSupabase()
  await supabase.auth.signOut()
  redirect("/?conta=excluida")
}

export async function enviarProva(provaId: string, respostas: Record<string, number>) {
  await assertRole("candidato")
  const supabase = await getServerSupabase()
  const { data, error } = await supabase.rpc("enviar_prova", { p_prova: provaId, p_respostas: respostas })
  revalidatePath("/candidato", "layout")
  if (error) return { ok: false as const, message: error.message.includes("já fez") ? "Você já fez esta prova." : "Não foi possível enviar. Tente de novo." }
  return { ok: true as const, nota: Number(data) }
}
