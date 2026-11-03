"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { assertRole } from "@/lib/auth"
import { brtToIso, currencyToNumber } from "@/lib/parse"
import { getServerSupabase } from "@/lib/supabase/server"

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim()

function vagaFromForm(f: FormData) {
  const titulo = str(f, "titulo")
  const area = str(f, "area")
  if (titulo.length < 3 || !area) return null
  const sal = currencyToNumber(str(f, "salario"))
  const qtd = Math.min(999, Math.max(1, Number(str(f, "quantidade")) || 1))
  return {
    titulo,
    area,
    quantidade: qtd,
    bairro: str(f, "bairro") || null,
    salario: sal === "" ? null : sal,
    entrevista_em: brtToIso(str(f, "data"), str(f, "hora")),
    descricao: str(f, "descricao").slice(0, 3000) || null,
  }
}

export async function criarVaga(formData: FormData) {
  const s = await assertRole("empresa")
  const v = vagaFromForm(formData)
  if (!v) redirect("/empresa/vagas/nova/?erro=dados")
  const supabase = await getServerSupabase()
  const { error } = await supabase.from("vagas").insert({ ...v, empresa_id: s.userId })
  revalidatePath("/empresa", "layout")
  redirect(error ? "/empresa/vagas/nova/?erro=salvar" : "/empresa/?ok=criada")
}

export async function editarVaga(formData: FormData) {
  await assertRole("empresa")
  const id = str(formData, "id")
  const v = vagaFromForm(formData)
  if (!v) redirect(`/empresa/vagas/${id}/?erro=dados`)
  const supabase = await getServerSupabase()
  const { error } = await supabase.from("vagas").update(v).eq("id", id)
  revalidatePath("/empresa", "layout")
  redirect(`/empresa/vagas/${id}/?${error ? "erro=salvar" : "ok=salva"}`)
}

export async function encerrarVaga(formData: FormData) {
  await assertRole("empresa")
  const id = str(formData, "id")
  const supabase = await getServerSupabase()
  await supabase.from("vagas").update({ status: "encerrada" }).eq("id", id)
  revalidatePath("/empresa", "layout")
  redirect(`/empresa/vagas/${id}/?ok=encerrada`)
}

export async function mudarStatusInscrito(formData: FormData) {
  await assertRole("empresa")
  const vaga = str(formData, "vaga_id")
  const { error } = await (await getServerSupabase()).rpc("empresa_mudar_status", {
    p_candidatura: str(formData, "candidatura_id"),
    p_status: str(formData, "status"),
  })
  revalidatePath(`/empresa/vagas/${vaga}`)
  redirect(`/empresa/vagas/${vaga}/?${error ? "erro=status" : "ok=status"}#inscritos`)
}

export async function salvarEmpresa(formData: FormData) {
  const s = await assertRole("empresa")
  const nome = str(formData, "nome")
  const responsavel = str(formData, "responsavel")
  const whatsapp = str(formData, "whatsapp")
  if (nome.length < 2 || responsavel.length < 2 || whatsapp.replace(/\D/g, "").length < 10) redirect("/empresa/dados/?erro=dados")
  const supabase = await getServerSupabase()
  const { error } = await supabase
    .from("empresas")
    .update({ nome, responsavel, whatsapp, cnpj: str(formData, "cnpj") || null, bairro: str(formData, "bairro") || null })
    .eq("id", s.userId)
  await supabase.from("profiles").update({ nome: responsavel }).eq("id", s.userId)
  revalidatePath("/empresa", "layout")
  redirect(`/empresa/dados/?${error ? "erro=salvar" : "ok=salvo"}`)
}
