// store/admin.store.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'MODERATOR'
}

interface AdminState {
  admin: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  hydrate: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAdminStore = create<AdminState>()(
  devtools(
    (set) => ({
      admin: null,
      isLoading: true,
      isAuthenticated: false,

      hydrate: async () => {
        try {
          const res = await fetch('/api/admin/auth/me')
          if (res.ok) {
            const admin: AdminUser = await res.json()
            set({ admin, isAuthenticated: true, isLoading: false })
          } else {
            set({ admin: null, isAuthenticated: false, isLoading: false })
          }
        } catch {
          set({ admin: null, isAuthenticated: false, isLoading: false })
        }
      },

      login: async (email: string, password: string) => {
        const res = await fetch('/api/admin/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Login failed')
        set({ admin: data.admin, isAuthenticated: true })
      },

      logout: async () => {
        await fetch('/api/admin/auth/logout', { method: 'POST' })
        set({ admin: null, isAuthenticated: false })
      },
    }),
    { name: 'admin-store' }
  )
)