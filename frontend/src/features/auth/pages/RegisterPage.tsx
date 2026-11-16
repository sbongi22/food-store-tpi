import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useAuthStore } from '@/store/authStore'
import { registerRequest } from '../api/auth'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function RegisterPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await registerRequest({
          username: value.username,
          full_name: value.full_name,
          email: value.email,
          password: value.password,
        })
        await login(value.username, value.password) // entra directo después de registrarse
        navigate('/')
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  const errores = (errors: unknown[], tocado: boolean) => (tocado ? errors.map(String).join(', ') : undefined)

  return (
    <Card className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Crear cuenta</h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (value.trim().length >= 3 ? undefined : 'Mínimo 3 caracteres') }}
        >
          {(f) => (
            <Input id="username" label="Usuario" value={f.state.value} onBlur={f.handleBlur}
              onChange={(e) => f.handleChange(e.target.value)} error={errores(f.state.meta.errors, f.state.meta.isTouched)} />
          )}
        </form.Field>
        <form.Field
          name="full_name"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Campo obligatorio') }}
        >
          {(f) => (
            <Input id="full_name" label="Nombre completo" value={f.state.value} onBlur={f.handleBlur}
              onChange={(e) => f.handleChange(e.target.value)} error={errores(f.state.meta.errors, f.state.meta.isTouched)} />
          )}
        </form.Field>
        <form.Field
          name="email"
          validators={{ onChange: ({ value }) => (EMAIL.test(value) ? undefined : 'Ingresá un email válido') }}
        >
          {(f) => (
            <Input id="email" label="Email" type="email" value={f.state.value} onBlur={f.handleBlur}
              onChange={(e) => f.handleChange(e.target.value)} error={errores(f.state.meta.errors, f.state.meta.isTouched)} />
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{ onChange: ({ value }) => (value.length >= 8 ? undefined : 'Mínimo 8 caracteres') }}
        >
          {(f) => (
            <Input id="password" label="Contraseña" type="password" value={f.state.value} onBlur={f.handleBlur}
              onChange={(e) => f.handleChange(e.target.value)} error={errores(f.state.meta.errors, f.state.meta.isTouched)} />
          )}
        </form.Field>
        <form.Field
          name="confirmar"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) =>
              value === fieldApi.form.getFieldValue('password') ? undefined : 'Las contraseñas no coinciden',
          }}
        >
          {(f) => (
            <Input id="confirmar" label="Repetir contraseña" type="password" value={f.state.value} onBlur={f.handleBlur}
              onChange={(e) => f.handleChange(e.target.value)} error={errores(f.state.meta.errors, f.state.meta.isTouched)} />
          )}
        </form.Field>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? 'Creando cuenta…' : 'Registrarme'}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-orange-600 hover:underline">
          Ingresá
        </Link>
      </p>
    </Card>
  )
}
