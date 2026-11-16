import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <p className="text-4xl" aria-hidden="true">🍽️</p>
      <h3 className="mt-2 text-lg font-semibold">{titulo}</h3>
      {descripcion && <p className="mt-1 text-sm text-stone-500">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
