import type { Pedido } from '../types/pedido'
import { formatearFecha, formatearPrecio } from '@/shared/format'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Modal } from '@/shared/ui/Modal'

export function DetallePedidoModal({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  return (
    <Modal titulo={`Pedido #${pedido.id}`} onClose={onClose}>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <BadgeEstado estado={pedido.estado} />
          <span className="text-stone-500">{formatearFecha(pedido.created_at)}</span>
        </div>
        <p>
          <span className="font-medium">Dirección:</span> {pedido.direccion_entrega}
        </p>
        <p>
          <span className="font-medium">Pago:</span> {pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
        </p>
        {pedido.notas && (
          <p>
            <span className="font-medium">Notas:</span> {pedido.notas}
          </p>
        )}
        <table className="w-full text-left">
          <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
            <tr>
              <th className="py-1">Producto</th>
              <th className="py-1 text-right">Cant.</th>
              <th className="py-1 text-right">Precio</th>
              <th className="py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((d) => (
              <tr key={d.producto_id} className="border-b border-stone-100">
                <td className="py-1.5">{d.nombre_producto}</td>
                <td className="py-1.5 text-right">{d.cantidad}</td>
                <td className="py-1.5 text-right">{formatearPrecio(d.precio_unitario)}</td>
                <td className="py-1.5 text-right">{formatearPrecio(d.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-right text-lg font-bold">Total: {formatearPrecio(pedido.total)}</p>
      </div>
    </Modal>
  )
}
