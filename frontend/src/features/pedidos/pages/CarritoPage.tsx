import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { formatearPrecio } from '@/shared/format'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0))

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo."
        accion={
          <Link to="/">
            <Button>Ver catálogo</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Carrito</h1>
      <Card className="divide-y divide-stone-100 p-0">
        {items.map((item) => (
          <div key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-40 flex-1">
              <p className="font-medium">{item.nombre}</p>
              <p className="text-sm text-stone-500">{formatearPrecio(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variante="secondary"
                aria-label={`Restar ${item.nombre}`}
                disabled={item.cantidad <= 1}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center font-medium">{item.cantidad}</span>
              <Button
                variante="secondary"
                aria-label={`Sumar ${item.nombre}`}
                disabled={item.cantidad >= item.stock}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
              >
                +
              </Button>
            </div>
            <p className="w-28 text-right font-semibold">{formatearPrecio(item.precio_unitario * item.cantidad)}</p>
            <Button variante="ghost" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
      </Card>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button variante="secondary" onClick={vaciar}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <p className="text-xl font-bold">Total: {formatearPrecio(total)}</p>
          <Link to="/checkout">
            <Button>Continuar al pedido</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
