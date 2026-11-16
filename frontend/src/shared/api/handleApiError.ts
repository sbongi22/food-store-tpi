import { isAxiosError } from 'axios'

interface ErrorDetalle {
  msg?: string
}

/** Convierte el `detail` que devuelve la API en un mensaje para mostrar en pantalla. */
export function handleApiError(error: unknown): string {
  if (isAxiosError<{ detail?: string | ErrorDetalle[] }>(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor'
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg ?? 'Dato inválido').join('. ')
    }
    return `Error ${error.response.status}`
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado'
}
