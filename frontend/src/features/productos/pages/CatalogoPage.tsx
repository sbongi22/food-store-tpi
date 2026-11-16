import { useState } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { ProductoCard } from '../components/ProductoCard'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonCards } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { claseControl } from '@/shared/ui/Input'

const POR_PAGINA = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(1)
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const categorias = useCategorias()
  const productos = useProductos({
    skip: (pagina - 1) * POR_PAGINA,
    limit: POR_PAGINA,
    search: busqueda || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = Math.max(1, Math.ceil((productos.data?.total ?? 0) / POR_PAGINA))

  function buscar() {
    setBusqueda(texto.trim())
    setPagina(1)
  }

  function elegirCategoria(id: number | undefined) {
    setCategoriaId(id)
    setPagina(1)
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>

      <form
        className="mb-4 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          buscar()
        }}
      >
        <input
          className={`${claseControl} max-w-xs`}
          placeholder="Buscar por nombre…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-label="Buscar productos"
        />
        <Button type="submit">Buscar</Button>
        {(busqueda || categoriaId !== undefined) && (
          <Button
            variante="ghost"
            onClick={() => {
              setTexto('')
              setBusqueda('')
              elegirCategoria(undefined)
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => elegirCategoria(undefined)}
          className={`rounded-full px-4 py-1.5 text-sm ${categoriaId === undefined ? 'bg-orange-600 text-white' : 'bg-white ring-1 ring-stone-300 hover:bg-stone-100'}`}
        >
          Todas
        </button>
        {categorias.data?.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => elegirCategoria(c.id)}
            className={`rounded-full px-4 py-1.5 text-sm ${categoriaId === c.id ? 'bg-orange-600 text-white' : 'bg-white ring-1 ring-stone-300 hover:bg-stone-100'}`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {productos.isLoading ? (
        <SkeletonCards cantidad={POR_PAGINA} />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : productos.data && productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion="Probá con otra búsqueda o con otra categoría."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productos.data?.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}
