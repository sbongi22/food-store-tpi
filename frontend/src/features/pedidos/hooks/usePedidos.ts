import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  listarPedidos,
  obtenerResumen,
} from '../api/pedidos'
import type { EstadoPedido, PedidoCreate } from '../types/pedido'

export function usePedidos(estado?: EstadoPedido) {
  return useQuery({
    queryKey: ['pedidos', { estado: estado ?? null }],
    queryFn: () => listarPedidos({ skip: 0, limit: 100, estado }),
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: obtenerResumen })
}

function useInvalidarPedidos() {
  const qc = useQueryClient()
  // Un pedido modifica el stock de los productos: se invalidan los dos
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ['pedidos'] }),
      qc.invalidateQueries({ queryKey: ['productos'] }),
    ])
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({ mutationFn: (d: PedidoCreate) => crearPedido(d), onSuccess: invalidar })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({ mutationFn: (id: number) => cancelarPedido(id), onSuccess: invalidar })
}
