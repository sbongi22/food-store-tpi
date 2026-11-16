import { useState } from 'react'
import type { Producto } from '../types/producto'
import { useCartStore } from '@/store/cartStore'
import { formatearPrecio } from '@/shared/format'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

const EMOJIS: Record<string, string> = {
  Pizzas: '🍕',
  Hamburguesas: '🍔',
  Empanadas: '🥟',
  Bebidas: '🥤',
  Postres: '🍮',
}

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = !producto.disponible || producto.stock <= 0
  const tope = enCarrito >= producto.stock

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      {producto.imagen_url && !imagenRota ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-36 w-full object-cover"
          onError={() => setImagenRota(true)}
        />
      ) : (
        <div className="flex h-36 items-center justify-center bg-orange-50 text-5xl" aria-hidden="true">
          {EMOJIS[producto.categoria?.nombre ?? ''] ?? '🍽️'}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-orange-600">{producto.categoria?.nombre}</p>
        <h3 className="mt-1 font-semibold">{producto.nombre}</h3>
        <p className="mt-1 flex-1 text-sm text-stone-500">{producto.descripcion}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">{formatearPrecio(producto.precio_base)}</span>
          <span className={`text-xs ${sinStock ? 'text-red-600' : 'text-stone-500'}`}>
            {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </span>
        </div>
        <Button
          className="mt-3"
          disabled={sinStock || tope}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
              stock: producto.stock,
              imagen_url: producto.imagen_url,
            })
          }
        >
          {sinStock ? 'No disponible' : tope ? 'Máximo en el carrito' : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  )
}
