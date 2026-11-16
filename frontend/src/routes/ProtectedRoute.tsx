import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Rol } from '@/features/auth/types/auth'

interface ProtectedRouteProps {
  roles?: Rol[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)

  if (cargando) {
    return <p className="p-10 text-center text-stone-500">Verificando sesión…</p>
  }
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
