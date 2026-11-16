import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'

const requerido = ({ value }: { value: string }) => (value.trim() ? undefined : 'Campo obligatorio')

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username, value.password)
        navigate('/')
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <Card className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Ingresar</h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username" validators={{ onChange: requerido }}>
          {(field) => (
            <Input
              id="username"
              label="Usuario"
              autoComplete="username"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.isTouched ? field.state.meta.errors.map(String).join(', ') : undefined}
            />
          )}
        </form.Field>
        <form.Field name="password" validators={{ onChange: requerido }}>
          {(field) => (
            <Input
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.isTouched ? field.state.meta.errors.map(String).join(', ') : undefined}
            />
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
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-center text-sm text-stone-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-medium text-orange-600 hover:underline">
          Registrate
        </Link>
      </p>
    </Card>
  )
}
