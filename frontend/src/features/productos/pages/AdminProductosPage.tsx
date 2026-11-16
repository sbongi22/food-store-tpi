import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import {
  useActualizarProducto,
  useCambiarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import type { Producto, ProductoInput } from '../types/producto'
import { handleApiError } from '@/shared/api/handleApiError'
import { formatearPrecio } from '@/shared/format'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'

export function AdminProductosPage() {
  // El panel pide limit=100 y pagina en el cliente con TanStack Table
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const stock = useCambiarStock()
  const eliminar = useEliminarProducto()

  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [editandoStock, setEditandoStock] = useState<Producto | null>(null)
  const [aEliminar, setAEliminar] = useState<Producto | null>(null)
  const [error, setError] = useState<string | null>(null)

  const columnas = useMemo<ColumnDef<Producto, unknown>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nombre', header: 'Nombre' },
      { id: 'categoria', header: 'Categoría', accessorFn: (p) => p.categoria?.nombre ?? '—' },
      { accessorKey: 'precio_base', header: 'Precio', cell: (c) => formatearPrecio(c.getValue<number>()) },
      { accessorKey: 'stock', header: 'Stock' },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: (c) =>
          c.getValue<boolean>() ? (
            <span className="text-green-700">Sí</span>
          ) : (
            <span className="text-red-600">No</span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variante="secondary" onClick={() => { setError(null); setEditando(row.original) }}>
              Editar
            </Button>
            <Button variante="secondary" onClick={() => { setError(null); setEditandoStock(row.original) }}>
              Stock
            </Button>
            <Button variante="danger" onClick={() => { setError(null); setAEliminar(row.original) }}>
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  function cerrar() {
    setCreando(false)
    setEditando(null)
    setEditandoStock(null)
    setError(null)
  }

  function guardar(datos: ProductoInput) {
    setError(null)
    const opciones = { onSuccess: cerrar, onError: (e: unknown) => setError(handleApiError(e)) }
    if (editando) actualizar.mutate({ id: editando.id, datos }, opciones)
    else crear.mutate(datos, opciones)
  }

  const listaCategorias = categorias.data ?? []

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button disabled={listaCategorias.length === 0} onClick={() => { setError(null); setCreando(true) }}>
          Nuevo producto
        </Button>
      </div>
      {productos.isLoading ? (
        <SkeletonFilas />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : (
        <DataTable data={productos.data?.items ?? []} columns={columnas} vacio="Todavía no hay productos" />
      )}

      {(creando || editando) && (
        <Modal titulo={editando ? 'Editar producto' : 'Nuevo producto'} onClose={cerrar}>
          <ProductoForm
            inicial={editando}
            categorias={listaCategorias}
            enviando={crear.isPending || actualizar.isPending}
            error={error}
            onSubmit={guardar}
            onCancel={cerrar}
          />
        </Modal>
      )}

      {editandoStock && (
        <Modal titulo={`Stock de ${editandoStock.nombre}`} onClose={cerrar}>
          <StockForm
            producto={editandoStock}
            enviando={stock.isPending}
            error={error}
            onCancel={cerrar}
            onSubmit={(datos) => {
              setError(null)
              stock.mutate(
                { id: editandoStock.id, datos },
                { onSuccess: cerrar, onError: (e) => setError(handleApiError(e)) },
              )
            }}
          />
        </Modal>
      )}

      {aEliminar && (
        <Modal titulo="Eliminar producto" onClose={() => setAEliminar(null)}>
          <p className="text-sm text-stone-600">
            Se da de baja «{aEliminar.nombre}» (baja lógica). Los pedidos anteriores conservan su copia.
          </p>
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <Button variante="secondary" onClick={() => setAEliminar(null)}>
              Volver
            </Button>
            <Button
              variante="danger"
              disabled={eliminar.isPending}
              onClick={() =>
                eliminar.mutate(aEliminar.id, {
                  onSuccess: () => setAEliminar(null),
                  onError: (e) => setError(handleApiError(e)),
                })
              }
            >
              Eliminar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
