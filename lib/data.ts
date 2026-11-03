import "server-only"

import { getServerSupabase } from "@/lib/supabase/server"

export type Experiencia = { empresa: string; funcao: string; tempo: string }

export type Vaga = {
  id: string
  titulo: string
  area: string
  quantidade: number
  bairro: string | null
  salario: number | null
  entrevista_em: string | null
  descricao: string | null
  status: "pendente" | "aberta" | "encerrada"
  created_at: string
  empresa_id: string
}

export async function db() {
  return getServerSupabase()
}
