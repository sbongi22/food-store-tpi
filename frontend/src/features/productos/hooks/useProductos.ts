import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarProducto,
  cambiarStock,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from '../api/productos'
import type { FiltrosProductos, ProductoInput, StockInput } from '../types/producto'

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData,
  })
}

function useInvalidarProductos() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['productos'] })
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: (d: ProductoInput) => crearProducto(d), onSuccess: invalidar })
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoInput }) => actualizarProducto(id, datos),
    onSuccess: invalidar,
  })
}

export function useCambiarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: StockInput }) => cambiarStock(id, datos),
    onSuccess: invalidar,
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: (id: number) => eliminarProducto(id), onSuccess: invalidar })
}
