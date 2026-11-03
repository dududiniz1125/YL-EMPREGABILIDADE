/** Esqueleto mostrado na hora do clique enquanto a página carrega os dados. */
export function PageSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando…" className="animate-pulse">
      <div className="bg-paper-dim h-9 w-56 rounded-xl" />
      <div className="bg-paper-dim/80 mt-3 h-5 w-80 max-w-full rounded-lg" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-line/60 bg-card rounded-3xl border p-6">
            <div className="bg-paper-dim h-4 w-24 rounded" />
            <div className="bg-paper-dim mt-3 h-6 w-3/4 rounded-lg" />
            <div className="bg-paper-dim/70 mt-4 h-4 w-full rounded" />
            <div className="bg-paper-dim/70 mt-2 h-4 w-2/3 rounded" />
            <div className="bg-paper-dim mt-6 h-11 w-40 rounded-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  )
}
