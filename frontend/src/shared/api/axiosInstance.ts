import axios, { AxiosError } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // el navegador adjunta la cookie HttpOnly en cada petición
})

// Lo registra el authStore (evita una importación circular entre los dos módulos).
let onSesionInvalida: () => void = () => {}
export function registrarSesionInvalida(fn: () => void): void {
  onSesionInvalida = fn
}

const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detail = error.response?.data?.detail
    const esLoginOMe = url.includes('/auth/token') || url.includes('/auth/me')

    if ((status === 401 && !esLoginOMe) || (status === 400 && detail === CUENTA_DESACTIVADA)) {
      onSesionInvalida()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)
