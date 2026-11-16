import { api } from '@/shared/api/axiosInstance'
import type { UserPublic } from '@/features/auth/types/auth'

export async function listarUsuarios(): Promise<UserPublic[]> {
  const { data } = await api.get<UserPublic[]>('/admin/usuarios')
  return data
}

export async function cambiarEstadoUsuario(id: number, activar: boolean): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>(`/admin/usuarios/${id}/${activar ? 'activar' : 'desactivar'}`)
  return data
}
