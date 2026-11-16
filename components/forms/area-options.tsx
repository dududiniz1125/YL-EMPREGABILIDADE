import { OUTRA, type Categoria } from "@/lib/areas"

/** <option>s agrupadas por categoria (<optgroup>), para selects simples como filtros. */
export function AreaOptions({ categorias, exclude = [], includeOutra = false }: { categorias: Categoria[]; exclude?: string[]; includeOutra?: boolean }) {
  const fora = new Set(exclude)
  return (
    <>
      {categorias.map((c) => {
        const areas = c.areas.filter((a) => !fora.has(a) && (includeOutra || a !== OUTRA))
        if (!areas.length) return null
        return (
          <optgroup key={c.nome} label={c.nome}>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </optgroup>
        )
      })}
    </>
  )
}
