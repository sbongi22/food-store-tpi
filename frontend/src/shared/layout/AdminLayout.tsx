import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

export function AdminLayout() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-medium ${isActive ? 'bg-stone-800 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100'}`
            }
          >
            {t.texto}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
