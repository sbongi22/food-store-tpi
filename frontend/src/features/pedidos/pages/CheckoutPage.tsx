import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import { CheckoutForm } from '../components/CheckoutForm'
import { handleApiError } from '@/shared/api/handleApiError'
import { formatearPrecio } from '@/shared/format'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0))
  const crear = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay productos para confirmar"
        accion={
          <Link to="/">
            <Button>Ir al catálogo</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>
        <Card>
          <CheckoutForm
            enviando={crear.isPending}
            error={error}
            onSubmit={(datos) => {
              setError(null)
              crear.mutate(
                {
                  ...datos,
                  items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
                },
                {
                  onSuccess: () => {
                    vaciar()
                    navigate('/mis-pedidos')
                  },
                  onError: (e) => setError(handleApiError(e)),
                },
              )
            }}
          />
        </Card>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold md:mt-1.5">Resumen</h2>
        <Card className="space-y-2">
          {items.map((i) => (
            <div key={i.producto_id} className="flex justify-between text-sm">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-stone-200 pt-2 text-lg font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
