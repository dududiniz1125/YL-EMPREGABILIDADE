export const onlyDigits = (v: string) => v.replace(/\D/g, "")

/** R$ 1.234,56 (digitação da direita para a esquerda) */
export function maskCurrency(v: string) {
  const d = onlyDigits(v).slice(0, 9)
  if (!d) return ""
  const n = Number(d) / 100
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

/** 00.000.000/0000-00 */
export function maskCnpj(v: string) {
  const d = onlyDigits(v).slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}
