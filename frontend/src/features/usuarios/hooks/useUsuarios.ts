import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoUsuario, listarUsuarios } from '../api/usuarios'

export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios })
}

export function useCambiarEstadoUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) => cambiarEstadoUsuario(id, activar),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}
