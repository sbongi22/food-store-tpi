import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import { DetallePedidoModal } from '../components/DetallePedidoModal'
import type { Pedido } from '../types/pedido'
import { handleApiError } from '@/shared/api/handleApiError'
import { formatearFecha, formatearPrecio } from '@/shared/format'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Modal } from '@/shared/ui/Modal'

export function MisPedidosPage() {
  const pedidos = usePedidos()
  const cancelar = useCancelarPedido()
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (pedidos.isLoading) return <SkeletonFilas />
  if (pedidos.isError) {
    return <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
  }
  const lista = pedidos.data?.items ?? []

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Mis pedidos</h1>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {lista.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/">
              <Button>Ver catálogo</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {lista.map((p) => (
            <Card key={p.id} className="flex flex-wrap items-center gap-4">
              <div className="min-w-40 flex-1">
                <p className="font-semibold">Pedido #{p.id}</p>
                <p className="text-sm text-stone-500">{formatearFecha(p.created_at)}</p>
              </div>
              <BadgeEstado estado={p.estado} />
              <p className="w-28 text-right font-semibold">{formatearPrecio(p.total)}</p>
              <div className="flex gap-2">
                <Button variante="secondary" onClick={() => setDetalle(p)}>
                  Ver detalle
                </Button>
                {p.estado === 'PENDIENTE' && (
                  <Button variante="danger" onClick={() => setACancelar(p)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {detalle && <DetallePedidoModal pedido={detalle} onClose={() => setDetalle(null)} />}

      {aCancelar && (
        <Modal titulo={`Cancelar pedido #${aCancelar.id}`} onClose={() => setACancelar(null)}>
          <p className="text-sm text-stone-600">
            Vas a cancelar este pedido y el stock de sus productos se va a restituir. ¿Confirmás?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variante="secondary" onClick={() => setACancelar(null)}>
              Volver
            </Button>
            <Button
              variante="danger"
              disabled={cancelar.isPending}
              onClick={() => {
                setError(null)
                cancelar.mutate(aCancelar.id, {
                  onSuccess: () => setACancelar(null),
                  onError: (e) => {
                    setError(handleApiError(e))
                    setACancelar(null)
                  },
                })
              }}
            >
              Sí, cancelar pedido
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
