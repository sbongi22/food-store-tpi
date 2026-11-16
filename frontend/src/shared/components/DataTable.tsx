import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { EstadoVacio } from './EstadoVacio'
import { Button } from '@/shared/ui/Button'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  vacio: string
  tamanoPagina?: number
}

/** Tabla de TanStack Table con orden por columna y paginación del lado del cliente. */
export function DataTable<T>({ data, columns, vacio, tamanoPagina = 8 }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: tamanoPagina })

  // Se mantiene la página al editar un registro; si la página deja de existir, se usa la última
  const ultimaPagina = Math.max(0, Math.ceil(data.length / tamanoPagina) - 1)
  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination: { ...pagination, pageIndex: Math.min(pagination.pageIndex, ultimaPagina) } },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (data.length === 0) return <EstadoVacio titulo={vacio} />

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase text-stone-600">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className={`px-4 py-3 ${h.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: ' ▲', desc: ' ▼' }[h.column.getIsSorted() as string] ?? ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-stone-100 hover:bg-stone-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.getPageCount() > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <Button variante="secondary" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            ← Anterior
          </Button>
          <span>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <Button variante="secondary" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  )
}
