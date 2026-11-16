import { useForm } from '@tanstack/react-form'
import type { Categoria, CategoriaInput } from '../types/categoria'
import { Button } from '@/shared/ui/Button'
import { Campo, claseControl } from '@/shared/ui/Input'

interface CategoriaFormProps {
  inicial: Categoria | null
  enviando: boolean
  error: string | null
  onSubmit: (datos: CategoriaInput) => void
  onCancel: () => void
}

export function CategoriaForm({ inicial, enviando, error, onSubmit, onCancel }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: ({ value }) =>
      onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
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
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo >= 2 && largo <= 100 ? undefined : 'El nombre debe tener entre 2 y 100 caracteres'
          },
        }}
      >
        {(f) => (
          <Campo label="Nombre" error={f.state.meta.isTouched ? f.state.meta.errors.map(String).join(', ') : undefined}>
            <input className={claseControl} value={f.state.value} onBlur={f.handleBlur}
              onChange={(e) => f.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(f) => (
          <Campo label="Descripción">
            <textarea className={claseControl} rows={3} value={f.state.value}
              onChange={(e) => f.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variante="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {inicial ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </div>
    </form>
  )
}
