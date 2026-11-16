import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { DetallePedidoModal } from '../components/DetallePedidoModal'
import { TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'
import { handleApiError } from '@/shared/api/handleApiError'
import { formatearFecha, formatearPrecio } from '@/shared/format'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { claseControl } from '@/shared/ui/Input'

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

export function AdminPedidosPage() {
  const [filtro, setFiltro] = useState<EstadoPedido | ''>('')
  const pedidos = usePedidos(filtro || undefined)
  const cambiar = useCambiarEstadoPedido()
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [error, setError] = useState<string | null>(null)

  const columnas = useMemo<ColumnDef<Pedido, unknown>[]>(
    () => [
      { accessorKey: 'id', header: '#', cell: (c) => `#${c.getValue<number>()}` },
      { accessorKey: 'created_at', header: 'Fecha', cell: (c) => formatearFecha(c.getValue<string>()) },
      { accessorKey: 'usuario_id', header: 'Usuario', cell: (c) => `ID ${c.getValue<number>()}` },
      { accessorKey: 'forma_pago', header: 'Pago' },
      { accessorKey: 'total', header: 'Total', cell: (c) => formatearPrecio(c.getValue<number>()) },
      { accessorKey: 'estado', header: 'Estado', cell: (c) => <BadgeEstado estado={c.getValue<EstadoPedido>()} /> },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original
          return (
            <div className="flex flex-wrap gap-2">
              <Button variante="secondary" onClick={() => setDetalle(p)}>
                Detalle
              </Button>
              {TRANSICIONES[p.estado].map((siguiente) => (
                <Button
                  key={siguiente}
                  variante={siguiente === 'CANCELADO' ? 'danger' : 'primary'}
                  disabled={cambiar.isPending}
                  onClick={() => {
                    setError(null)
                    cambiar.mutate(
                      { id: p.id, estado: siguiente },
                      { onError: (e) => setError(handleApiError(e)) },
                    )
                  }}
                >
                  {ETIQUETA_ACCION[siguiente]}
                </Button>
              ))}
            </div>
          )
        },
      },
    ],
    [cambiar],
  )

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select
          className={`${claseControl} w-auto`}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as EstadoPedido | '')}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {pedidos.isLoading ? (
        <SkeletonFilas />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : (
        <DataTable data={pedidos.data?.items ?? []} columns={columnas} vacio="No hay pedidos con ese filtro" />
      )}
      {detalle && <DetallePedidoModal pedido={detalle} onClose={() => setDetalle(null)} />}
    </div>
  )
}
