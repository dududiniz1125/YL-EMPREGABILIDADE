/** Traduz erros do Supabase Auth para mensagens claras (sem revelar se o e-mail existe). */
export function authErrorMessage(err: { code?: string; message?: string; status?: number } | null | undefined) {
  if (!err) return "Algo deu errado. Tente de novo."
  const code = err.code ?? ""
  const msg = (err.message ?? "").toLowerCase()
  if (code === "invalid_credentials" || msg.includes("invalid login credentials"))
    return "E-mail ou senha incorretos."
  if (code === "email_not_confirmed" || msg.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar. Procure a mensagem da YL Empregabilidade na sua caixa de entrada (e no spam)."
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || err.status === 429)
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo."
  if (code === "weak_password" || msg.includes("password should"))
    return "Senha fraca. Use pelo menos 8 caracteres, misturando letras e números."
  if (code === "same_password") return "A nova senha precisa ser diferente da atual."
  if (msg.includes("failed to fetch") || msg.includes("network"))
    return "Sem conexão com a internet. Confira seu sinal e tente de novo."
  return "Não foi possível concluir agora. Tente de novo em instantes."
}
