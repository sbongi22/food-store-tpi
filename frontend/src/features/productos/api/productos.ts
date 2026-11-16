import { api } from '@/shared/api/axiosInstance'
import type {
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  StockInput,
} from '../types/producto'

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros })
  return data
}

export async function crearProducto(datos: ProductoInput): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', datos)
  return data
}

export async function actualizarProducto(id: number, datos: ProductoInput): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, datos)
  return data
}

export async function cambiarStock(id: number, datos: StockInput): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}
