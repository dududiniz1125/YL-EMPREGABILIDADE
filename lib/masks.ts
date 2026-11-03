export const onlyDigits = (v: string) => v.replace(/\D/g, "")

/** (11) 99999-9999 ou (11) 9999-9999 */
export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ""
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

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
