import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias'
import { CategoriaForm } from '../components/CategoriaForm'
import type { Categoria, CategoriaInput } from '../types/categoria'
import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'

export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const [editando, setEditando] = useState<Categoria | null>(null)
  const [creando, setCreando] = useState(false)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)
  const [error, setError] = useState<string | null>(null)

  const columnas = useMemo<ColumnDef<Categoria, unknown>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nombre', header: 'Nombre' },
      { accessorKey: 'descripcion', header: 'Descripción', cell: (c) => c.getValue<string | null>() ?? '—' },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variante="secondary" onClick={() => { setError(null); setEditando(row.original) }}>
              Editar
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
    setError(null)
  }

  function guardar(datos: CategoriaInput) {
    setError(null)
    const opciones = { onSuccess: cerrar, onError: (e: unknown) => setError(handleApiError(e)) }
    if (editando) actualizar.mutate({ id: editando.id, datos }, opciones)
    else crear.mutate(datos, opciones)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => { setError(null); setCreando(true) }}>Nueva categoría</Button>
      </div>
      {categorias.isLoading ? (
        <SkeletonFilas />
      ) : categorias.isError ? (
        <EstadoError mensaje={handleApiError(categorias.error)} onReintentar={() => void categorias.refetch()} />
      ) : (
        <DataTable data={categorias.data ?? []} columns={columnas} vacio="Todavía no hay categorías" />
      )}

      {(creando || editando) && (
        <Modal titulo={editando ? 'Editar categoría' : 'Nueva categoría'} onClose={cerrar}>
          <CategoriaForm
            inicial={editando}
            enviando={crear.isPending || actualizar.isPending}
            error={error}
            onSubmit={guardar}
            onCancel={cerrar}
          />
        </Modal>
      )}

      {aEliminar && (
        <Modal titulo="Eliminar categoría" onClose={() => setAEliminar(null)}>
          <p className="text-sm text-stone-600">
            Se da de baja «{aEliminar.nombre}» (baja lógica). Sus productos no se ocultan: si querés retirarla del
            catálogo, eliminá también sus productos.
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
