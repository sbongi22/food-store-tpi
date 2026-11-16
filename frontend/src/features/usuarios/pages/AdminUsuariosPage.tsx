import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { UserPublic } from '@/features/auth/types/auth'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'

export function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const cambiar = useCambiarEstadoUsuario()
  const yo = useAuthStore((s) => s.usuario)
  const [error, setError] = useState<string | null>(null)

  const columnas = useMemo<ColumnDef<UserPublic, unknown>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario' },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Rol' },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: (c) =>
          c.getValue<boolean>() ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Desactivado</span>
          ) : (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Activo</span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original
          const accionar = (activar: boolean) => {
            setError(null)
            cambiar.mutate({ id: u.id, activar }, { onError: (e) => setError(handleApiError(e)) })
          }
          if (u.disabled) {
            return (
              <Button disabled={cambiar.isPending} onClick={() => accionar(true)}>
                Activar
              </Button>
            )
          }
          // el botón Desactivar no se muestra en la fila del usuario de la sesión
          if (u.id === yo?.id) return <span className="text-xs text-stone-400">(sos vos)</span>
          return (
            <Button variante="danger" disabled={cambiar.isPending} onClick={() => accionar(false)}>
              Desactivar
            </Button>
          )
        },
      },
    ],
    [cambiar, yo?.id],
  )

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {usuarios.isLoading ? (
        <SkeletonFilas />
      ) : usuarios.isError ? (
        <EstadoError mensaje={handleApiError(usuarios.error)} onReintentar={() => void usuarios.refetch()} />
      ) : (
        <DataTable data={usuarios.data ?? []} columns={columnas} vacio="No hay usuarios" />
      )}
    </div>
  )
}
