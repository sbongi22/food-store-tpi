import { Button } from '@/shared/ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center" role="alert">
      <p className="font-medium text-red-700">{mensaje}</p>
      {onReintentar && (
        <Button variante="secondary" className="mt-3" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
