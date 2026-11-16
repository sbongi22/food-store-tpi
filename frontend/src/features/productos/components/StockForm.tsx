import { useForm } from '@tanstack/react-form'
import type { Producto, StockInput } from '../types/producto'
import { Button } from '@/shared/ui/Button'
import { Campo, claseControl } from '@/shared/ui/Input'

interface StockFormProps {
  producto: Producto
  enviando: boolean
  error: string | null
  onSubmit: (datos: StockInput) => void
  onCancel: () => void
}

export function StockForm({ producto, enviando, error, onSubmit, onCancel }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: ({ value }) => onSubmit({ stock: Number(value.stock), disponible: value.disponible }),
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            value !== '' && Number.isInteger(Number(value)) && Number(value) >= 0 ? undefined : 'Entero mayor o igual a 0',
        }}
      >
        {(f) => (
          <Campo label="Stock" error={f.state.meta.errors.map(String).join(', ') || undefined}>
            <input type="number" min="0" step="1" className={claseControl} value={f.state.value}
              onChange={(e) => f.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(f) => (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.state.value} onChange={(e) => f.handleChange(e.target.checked)} />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button variante="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          Guardar stock
        </Button>
      </div>
    </form>
  )
}
