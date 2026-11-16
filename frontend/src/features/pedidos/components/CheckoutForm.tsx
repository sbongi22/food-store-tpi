import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import type { FormaPago, PedidoCreate } from '../types/pedido'
import { Button } from '@/shared/ui/Button'
import { Campo, claseControl } from '@/shared/ui/Input'

interface CheckoutFormProps {
  enviando: boolean
  error: string | null
  onSubmit: (datos: Pick<PedidoCreate, 'direccion_entrega' | 'forma_pago' | 'notas'>) => void
}

export function CheckoutForm({ enviando, error, onSubmit }: CheckoutFormProps) {
  const [intentado, setIntentado] = useState(false)
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) =>
      onSubmit({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim() || null,
      }),
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        setIntentado(true)
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 5) return 'La dirección debe tener entre 5 y 200 caracteres'
            if (largo > 200) return 'La dirección no puede superar los 200 caracteres'
            return undefined
          },
        }}
      >
        {(f) => (
          <Campo
            label="Dirección de entrega"
            error={f.state.meta.isTouched || intentado ? f.state.meta.errors.map(String).join(', ') : undefined}
          >
            <input
              className={claseControl}
              value={f.state.value}
              onBlur={f.handleBlur}
              onChange={(e) => f.handleChange(e.target.value)}
              placeholder="Calle y número, piso, localidad"
            />
          </Campo>
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(f) => (
          <Campo label="Forma de pago">
            <select
              className={claseControl}
              value={f.state.value}
              onChange={(e) => f.handleChange(e.target.value as FormaPago)}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </Campo>
        )}
      </form.Field>

      <form.Field name="notas">
        {(f) => (
          <Campo label="Notas (opcional)">
            <textarea
              className={claseControl}
              rows={3}
              value={f.state.value}
              onChange={(e) => f.handleChange(e.target.value)}
              placeholder="Aclaraciones para el pedido"
            />
          </Campo>
        )}
      </form.Field>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={enviando}>
        {enviando ? 'Confirmando…' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}
