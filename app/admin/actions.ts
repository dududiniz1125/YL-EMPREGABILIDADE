"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { assertRole } from "@/lib/auth"
import { logAdmin } from "@/lib/admin-log"
import { brtToIso, currencyToNumber } from "@/lib/parse"
import { getServiceSupabase } from "@/lib/supabase/admin"
import { getServerSupabase } from "@/lib/supabase/server"

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim()
const back = (f: FormData, fallback: string) => {
  const b = str(f, "back")
  return b.startsWith("/admin") ? b : fallback
}
const withFlash = (url: string, flash: string) => `${url}${url.includes("?") ? "&" : "?"}${flash}`

/* ----------------------------- Candidatos ----------------------------- */
export async function setCandidatoStatus(f: FormData) {
  const s = await assertRole("admin")
  const id = str(f, "id")
  const status = str(f, "status")
  if (!["ativo", "contratado", "inativo"].includes(status)) throw new Error("Status inválido")
  const { error } = await (await getServerSupabase()).from("candidatos").update({ status }).eq("id", id)
  if (!error) await logAdmin(s, "candidato.status", "candidato", id, { status })
  revalidatePath("/admin", "layout")
  redirect(withFlash(back(f, `/admin/candidatos/${id}/`), error ? "erro=1" : "ok=status"))
}

export async function addAnotacao(f: FormData) {
  const s = await assertRole("admin")
  const id = str(f, "id")
  const texto = str(f, "texto").slice(0, 2000)
  if (texto) {
    await (await getServerSupabase()).from("anotacoes").insert({ candidato_id: id, autor_id: s.userId, texto })
    await logAdmin(s, "candidato.anotacao", "candidato", id)
  }
  revalidatePath(`/admin/candidatos/${id}`)
  redirect(`/admin/candidatos/${id}/?ok=nota#anotacoes`)
}

export async function excluirCandidato(f: FormData) {
  const s = await assertRole("admin")
  const id = str(f, "id")
  const supabase = await getServerSupabase()
  const { data: c } = await supabase.from("candidatos").select("nome").eq("id", id).maybeSingle()
  const { error } = await getServiceSupabase().auth.admin.deleteUser(id)
  if (!error) await logAdmin(s, "candidato.excluir", "candidato", id, { nome: c?.nome })
  revalidatePath("/admin", "layout")
  redirect(error ? `/admin/candidatos/${id}/?erro=1` : "/admin/candidatos/?ok=excluido")
}

/* ------------------------------ Empresas ------------------------------ */
export async function setEmpresaStatus(f: FormData) {
  const s = await assertRole("admin")
  const id = str(f, "id")
  const status = str(f, "status")
  if (!["pendente", "aprovada", "bloqueada"].includes(status)) throw new Error("Status inválido")
  const { error } = await (await getServerSupabase()).from("empresas").update({ status }).eq("id", id)
  if (!error) await logAdmin(s, "empresa.status", "empresa", id, { status })
  revalidatePath("/admin", "layout")
  redirect(withFlash(back(f, "/admin/empresas/"), error ? "erro=1" : "ok=empresa"))
}

/* -------------------------------- Vagas ------------------------------- */
export async function setVagaStatus(f: FormData) {
  const s = await assertRole("admin")
  const id = str(f, "id")
  const status = str(f, "status")
  if (!["pendente", "aberta", "encerrada"].includes(status)) throw new Error("Status inválido")
  const supabase = await getServerSupabase()
  if (status === "aberta") {
    const { data: v } = await supabase.from("vagas").select("empresas(status)").eq("id", id).single()
    const emp = (v as unknown as { empresas: { status: string } | null } | null)?.empresas
    if (emp?.status !== "aprovada") redirect(withFlash(back(f, `/admin/vagas/${id}/`), "erro=empresa-pendente"))
  }
  const { error } = await supabase.from("vagas").update({ status }).eq("id", id)
  if (!error) await logAdmin(s, "vaga.status", "vaga", id, { status })
  revalidatePath("/admin", "layout")
  revalidatePath("/candidato", "layout")
  redirect(withFlash(back(f, `/admin/vagas/${id}/`), error ? "erro=1" : "ok=vaga"))
}

export async function editarVagaAdmin(f: FormData) {
  const s = await assertRole("admin")
  const id = str(f, "id")
  const titulo = str(f, "titulo")
  const area = str(f, "area")
  if (titulo.length < 3 || !area) redirect(`/admin/vagas/${id}/?erro=dados`)
  const sal = currencyToNumber(str(f, "salario"))
  const { error } = await (await getServerSupabase())
    .from("vagas")
    .update({
      titulo,
      area,
      quantidade: Math.min(999, Math.max(1, Number(str(f, "quantidade")) || 1)),
      bairro: str(f, "bairro") || null,
      salario: sal === "" ? null : sal,
      entrevista_em: brtToIso(str(f, "data"), str(f, "hora")),
      descricao: str(f, "descricao").slice(0, 3000) || null,
    })
    .eq("id", id)
  if (!error) await logAdmin(s, "vaga.editar", "vaga", id)
  revalidatePath("/admin", "layout")
  redirect(`/admin/vagas/${id}/?${error ? "erro=1" : "ok=salva"}`)
}

export async function indicarCandidato(f: FormData) {
  const s = await assertRole("admin")
  const vaga = str(f, "vaga_id")
  const candidato = str(f, "candidato_id")
  const { error } = await (await getServerSupabase())
    .from("candidaturas")
    .insert({ vaga_id: vaga, candidato_id: candidato, indicada_por_admin: true })
  if (!error) await logAdmin(s, "candidatura.indicar", "vaga", vaga, { candidato })
  revalidatePath("/admin", "layout")
  redirect(`/admin/vagas/${vaga}/?${error ? (error.code === "23505" ? "erro=ja-inscrito" : "erro=1") : "ok=indicado"}#inscritos`)
}

/* ---------------------------- Candidaturas ---------------------------- */
export async function setCandidaturaStatus(f: FormData) {
  const s = await assertRole("admin")
  const id = str(f, "id")
  const status = str(f, "status")
  if (!["inscrito", "em_analise", "entrevista", "contratado", "nao_selecionado"].includes(status)) throw new Error("Status inválido")
  const { error } = await (await getServerSupabase()).from("candidaturas").update({ status }).eq("id", id)
  if (!error) await logAdmin(s, "candidatura.status", "candidatura", id, { status })
  revalidatePath("/admin", "layout")
  redirect(withFlash(back(f, "/admin/candidaturas/"), error ? "erro=1" : "ok=status"))
}

/* ------------------------------- Provas ------------------------------- */
export async function criarProva(f: FormData) {
  const s = await assertRole("admin")
  const area = str(f, "area")
  const titulo = str(f, "titulo") || `Prova de ${area}`
  if (!area) redirect("/admin/provas/?erro=dados")
  const { data, error } = await (await getServerSupabase()).from("provas").insert({ area, titulo }).select("id").single()
  if (error) redirect(`/admin/provas/?erro=${error.code === "23505" ? "existe" : "1"}`)
  await logAdmin(s, "prova.criar", "prova", data!.id, { area })
  redirect(`/admin/provas/${data!.id}/?ok=criada`)
}

export async function salvarProva(f: FormData) {
  const s = await assertRole("admin")
  const id = str(f, "id")
  await (await getServerSupabase()).from("provas").update({ titulo: str(f, "titulo"), ativa: f.get("ativa") === "on" }).eq("id", id)
  await logAdmin(s, "prova.editar", "prova", id)
  revalidatePath("/admin/provas", "layout")
  redirect(`/admin/provas/${id}/?ok=salva`)
}

export async function salvarQuestao(f: FormData) {
  const s = await assertRole("admin")
  const prova = str(f, "prova_id")
  const qid = str(f, "questao_id")
  const alternativas = [0, 1, 2, 3, 4, 5].map((i) => str(f, `alt_${i}`)).filter(Boolean)
  const correta = Number(str(f, "correta"))
  const enunciado = str(f, "enunciado")
  if (!enunciado || alternativas.length < 2 || !(correta >= 0 && correta < alternativas.length)) {
    redirect(`/admin/provas/${prova}/?erro=questao`)
  }
  const supabase = await getServerSupabase()
  const row = { prova_id: prova, enunciado, alternativas, correta, ordem: Number(str(f, "ordem")) || 0 }
  const { error } = qid ? await supabase.from("questoes").update(row).eq("id", qid) : await supabase.from("questoes").insert(row)
  if (!error) await logAdmin(s, qid ? "questao.editar" : "questao.criar", "prova", prova)
  redirect(`/admin/provas/${prova}/?${error ? "erro=1" : "ok=questao"}`)
}

export async function removerQuestao(f: FormData) {
  const s = await assertRole("admin")
  const prova = str(f, "prova_id")
  await (await getServerSupabase()).from("questoes").delete().eq("id", str(f, "questao_id"))
  await logAdmin(s, "questao.remover", "prova", prova)
  redirect(`/admin/provas/${prova}/?ok=removida`)
}

export async function excluirProva(f: FormData) {
  const s = await assertRole("admin")
  const id = str(f, "id")
  await (await getServerSupabase()).from("provas").delete().eq("id", id)
  await logAdmin(s, "prova.excluir", "prova", id)
  redirect("/admin/provas/?ok=excluida")
}

/* ---------------------------- Configurações --------------------------- */
export async function salvarConfig(f: FormData) {
  const s = await assertRole("admin")
  const areas = str(f, "areas")
    .split("\n")
    .map((a) => a.trim())
    .filter(Boolean)
  if (!areas.includes("Outra")) areas.push("Outra")
  const { error } = await (await getServerSupabase())
    .from("configuracoes")
    .update({
      areas: Array.from(new Set(areas)),
      whatsapp: str(f, "whatsapp").replace(/\D/g, ""),
      email: str(f, "email"),
      telefone: str(f, "telefone"),
      endereco: str(f, "endereco"),
      mostrar_numeros: f.get("mostrar_numeros") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
  if (!error) await logAdmin(s, "config.salvar", "configuracoes", "1")
  revalidatePath("/", "layout")
  redirect(`/admin/configuracoes/?${error ? "erro=1" : "ok=salvo"}`)
}

/* -------------------------------- Conta ------------------------------- */
export async function marcarSenhaTrocada() {
  const s = await assertRole("admin")
  await (await getServerSupabase()).from("profiles").update({ must_change_password: false }).eq("id", s.userId)
  await logAdmin(s, "conta.trocar_senha", "profile", s.userId)
  revalidatePath("/admin", "layout")
}
