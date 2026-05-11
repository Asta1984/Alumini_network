// lib/auth-provider.tsx
// Replaces lib/auth-context.tsx
// Hydrates the Zustand auth store on app mount — that's all it does

'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return <>{children}</>
}