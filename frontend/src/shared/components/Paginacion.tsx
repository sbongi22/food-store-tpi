import { Button } from '@/shared/ui/Button'

interface PaginacionProps {
  pagina: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) return null
  return (
    <div className="mt-6 flex items-center justify-center gap-3 text-sm">
      <Button variante="secondary" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </Button>
      <span>
        Página {pagina} de {totalPaginas}
      </span>
      <Button variante="secondary" disabled={pagina >= totalPaginas} onClick={() => onCambiar(pagina + 1)}>
        Siguiente →
      </Button>
    </div>
  )
}
