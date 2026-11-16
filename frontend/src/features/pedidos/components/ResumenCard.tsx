import { Card } from '@/shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: string | number
  detalle?: string
  color?: string
}

export function ResumenCard({ titulo, valor, detalle, color = 'text-stone-800' }: ResumenCardProps) {
  return (
    <Card>
      <p className="text-sm text-stone-500">{titulo}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{valor}</p>
      {detalle && <p className="mt-1 text-xs text-stone-400">{detalle}</p>}
    </Card>
  )
}
