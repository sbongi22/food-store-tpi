import { useForm } from '@tanstack/react-form'
import type { Categoria } from '@/features/categorias/types/categoria'
import type { Producto, ProductoInput } from '../types/producto'
import { Button } from '@/shared/ui/Button'
import { Campo, claseControl } from '@/shared/ui/Input'

interface ProductoFormProps {
  inicial: Producto | null
  categorias: Categoria[]
  enviando: boolean
  error: string | null
  onSubmit: (datos: ProductoInput) => void
  onCancel: () => void
}

export function ProductoForm({ inicial, categorias, enviando, error, onSubmit, onCancel }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      precio_base: String(inicial?.precio_base ?? ''),
      imagen_url: inicial?.imagen_url ?? '',
      stock: String(inicial?.stock ?? 0),
      disponible: inicial?.disponible ?? true,
      categoria_id: String(inicial?.categoria_id ?? categorias[0]?.id ?? ''),
    },
    onSubmit: ({ value }) =>
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      }),
  })

  const err = (errors: unknown[], tocado: boolean) => (tocado ? errors.map(String).join(', ') : undefined)

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="nombre" validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Campo obligatorio') }}>
        {(f) => (
          <Campo label="Nombre" error={err(f.state.meta.errors, f.state.meta.isTouched)}>
            <input className={claseControl} value={f.state.value} onBlur={f.handleBlur}
              onChange={(e) => f.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(f) => (
          <Campo label="Descripción">
            <textarea className={claseControl} rows={2} value={f.state.value}
              onChange={(e) => f.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => (value !== '' && Number(value) >= 0 ? undefined : 'Debe ser un número mayor o igual a 0'),
          }}
        >
          {(f) => (
            <Campo label="Precio" error={err(f.state.meta.errors, f.state.meta.isTouched)}>
              <input type="number" min="0" step="0.01" className={claseControl} value={f.state.value}
                onBlur={f.handleBlur} onChange={(e) => f.handleChange(e.target.value)} />
            </Campo>
          )}
        </form.Field>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              value !== '' && Number.isInteger(Number(value)) && Number(value) >= 0 ? undefined : 'Entero mayor o igual a 0',
          }}
        >
          {(f) => (
            <Campo label="Stock" error={err(f.state.meta.errors, f.state.meta.isTouched)}>
              <input type="number" min="0" step="1" className={claseControl} value={f.state.value}
                onBlur={f.handleBlur} onChange={(e) => f.handleChange(e.target.value)} />
            </Campo>
          )}
        </form.Field>
      </div>
      <form.Field name="categoria_id" validators={{ onChange: ({ value }) => (value ? undefined : 'Elegí una categoría') }}>
        {(f) => (
          <Campo label="Categoría" error={err(f.state.meta.errors, f.state.meta.isTouched)}>
            <select className={claseControl} value={f.state.value} onChange={(e) => f.handleChange(e.target.value)}>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Campo>
        )}
      </form.Field>
      <form.Field name="imagen_url">
        {(f) => (
          <Campo label="URL de la imagen (opcional)">
            <input className={claseControl} value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
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
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variante="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {inicial ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
