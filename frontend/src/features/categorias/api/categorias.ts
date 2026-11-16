import { api } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaInput } from '../types/categoria'

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/categorias')
  return data
}

export async function crearCategoria(datos: CategoriaInput): Promise<Categoria> {
  const { data } = await api.post<Categoria>('/categorias', datos)
  return data
}

export async function actualizarCategoria(id: number, datos: CategoriaInput): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, datos)
  return data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`)
}
