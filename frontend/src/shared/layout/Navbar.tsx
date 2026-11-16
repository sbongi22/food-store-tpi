import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-orange-100 text-orange-700' : 'text-stone-600 hover:bg-stone-100'}`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0))
  const navigate = useNavigate()

  async function cerrarSesion() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 text-xl font-bold text-orange-600">
          🍔 Food Store
        </Link>
        <NavLink to="/" end className={claseLink}>
          Catálogo
        </NavLink>
        <NavLink to="/carrito" className={claseLink}>
          Carrito{cantidad > 0 && <span className="ml-1 rounded-full bg-orange-600 px-2 py-0.5 text-xs text-white">{cantidad}</span>}
        </NavLink>
        {usuario && (
          <NavLink to="/mis-pedidos" className={claseLink}>
            Mis pedidos
          </NavLink>
        )}
        {usuario?.role === 'admin' && (
          <NavLink to="/admin/resumen" className={claseLink}>
            Panel admin
          </NavLink>
        )}
        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-stone-600">
                {usuario.full_name}{' '}
                <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold">{usuario.role}</span>
              </span>
              <Button variante="secondary" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-stone-700 hover:underline">
                Ingresar
              </Link>
              <Link to="/register">
                <Button>Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
