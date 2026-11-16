import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/shared/layout/MainLayout'
import { AdminLayout } from '@/shared/layout/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { UnauthorizedPage } from '@/features/auth/pages/UnauthorizedPage'
import { CatalogoPage } from '@/features/productos/pages/CatalogoPage'
import { AdminProductosPage } from '@/features/productos/pages/AdminProductosPage'
import { AdminCategoriasPage } from '@/features/categorias/pages/AdminCategoriasPage'
import { AdminUsuariosPage } from '@/features/usuarios/pages/AdminUsuariosPage'
import { CarritoPage } from '@/features/pedidos/pages/CarritoPage'
import { CheckoutPage } from '@/features/pedidos/pages/CheckoutPage'
import { MisPedidosPage } from '@/features/pedidos/pages/MisPedidosPage'
import { AdminPedidosPage } from '@/features/pedidos/pages/AdminPedidosPage'
import { AdminResumenPage } from '@/features/pedidos/pages/AdminResumenPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/resumen" element={<AdminResumenPage />} />
              <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
              <Route path="/admin/productos" element={<AdminProductosPage />} />
              <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
              <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
            </Route>
          </Route>

          <Route path="*" element={<UnauthorizedPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
