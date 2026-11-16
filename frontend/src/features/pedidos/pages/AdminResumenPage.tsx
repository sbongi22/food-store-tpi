import { useResumenPedidos } from '../hooks/usePedidos'
import { ResumenCard } from '../components/ResumenCard'
import { handleApiError } from '@/shared/api/handleApiError'
import { formatearPrecio } from '@/shared/format'
import { EstadoError } from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'

export function AdminResumenPage() {
  const resumen = useResumenPedidos()

  if (resumen.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }
  if (resumen.isError || !resumen.data) {
    return <EstadoError mensaje={handleApiError(resumen.error)} onReintentar={() => void resumen.refetch()} />
  }
  const r = resumen.data

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Resumen del negocio</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ResumenCard titulo="Pendientes" valor={r.pendientes} color="text-amber-600" />
        <ResumenCard titulo="En preparación" valor={r.en_preparacion} color="text-blue-600" />
        <ResumenCard titulo="Entregados" valor={r.entregados} color="text-green-600" />
        <ResumenCard titulo="Cancelados" valor={r.cancelados} color="text-red-600" />
        <ResumenCard titulo="Pedidos de hoy" valor={r.pedidos_hoy} />
        <ResumenCard
          titulo="Ingresos (entregados)"
          valor={formatearPrecio(r.ingresos_entregados)}
          detalle="Suma del total de los pedidos ENTREGADO"
          color="text-orange-600"
        />
      </div>
    </div>
  )
}
