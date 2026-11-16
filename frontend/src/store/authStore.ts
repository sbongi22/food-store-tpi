import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { registrarSesionInvalida } from '@/shared/api/axiosInstance'
import { getMe, loginRequest, logoutRequest } from '@/features/auth/api/auth'
import type { UserPublic } from '@/features/auth/types/auth'

/** Datos del usuario que guarda el cliente. Nunca el token: viaja en la cookie HttpOnly. */
export type UsuarioSesion = Pick<UserPublic, 'id' | 'username' | 'full_name' | 'email' | 'role'>

interface AuthState {
  usuario: UsuarioSesion | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

function aSesion(u: UserPublic): UsuarioSesion {
  return { id: u.id, username: u.username, full_name: u.full_name, email: u.email, role: u.role }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        await loginRequest(username, password)
        const me = await getMe()
        set({ usuario: aSesion(me) })
      },
      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ usuario: null })
        }
      },
      checkSession: async () => {
        try {
          const me = await getMe()
          set({ usuario: aSesion(me), cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },
      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: 'food-store-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

registrarSesionInvalida(() => useAuthStore.getState().limpiarSesion())
