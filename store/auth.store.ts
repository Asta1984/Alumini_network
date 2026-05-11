// store/auth.store.ts
// Zustand auth store — replaces lib/auth-context.tsx
// Handles: OTP request, OTP verify, onboarding link, logout, session hydration

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  userId: string
  fullName: string
  email: string
  enrollmentNumber: string
  mobile: string
  profilePictureUrl: string | null
  nickname: string | null
  bio: string | null
  isProfileCompleted: boolean
  socialProfiles: SocialProfile[]
  aiSummary: string | null
  createdAt: string
}

export interface SocialProfile {
  id?: string
  platform: string
  profileUrl: string
}

// OTP login is 2-step — track which step we're on
export type LoginStep = 'identifier' | 'otp'

interface AuthState {
  // ── User ──────────────────────────────────────────────────────────────────
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean

  // ── OTP login flow ────────────────────────────────────────────────────────
  loginStep: LoginStep
  pendingIdentifier: string | null
  maskedEmail: string | null

  // ── Actions ───────────────────────────────────────────────────────────────
  hydrate: () => Promise<void>
  requestOtp: (identifier: string) => Promise<void>
  verifyOtp: (otp: string) => Promise<void>
  validateOnboardingLink: (token: string) => Promise<{
    prefilled: {
      fullName: string
      email: string
      mobile: string
      enrollmentNumber: string
    }
    isProfileCompleted: boolean
  }>
  logout: () => Promise<void>
  resetLoginFlow: () => void
  setUser: (user: AuthUser) => void
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      loginStep: 'identifier',
      pendingIdentifier: null,
      maskedEmail: null,

      hydrate: async () => {
        try {
          const res = await fetch('/api/auth/me')
          if (res.ok) {
            const user: AuthUser = await res.json()
            set({ user, isAuthenticated: true, isLoading: false })
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      requestOtp: async (identifier: string) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
        set({
          loginStep: 'otp',
          pendingIdentifier: identifier,
          maskedEmail: data.email,
        })
      },

      verifyOtp: async (otp: string) => {
        const { pendingIdentifier } = get()
        if (!pendingIdentifier) throw new Error('No pending login. Please start again.')

        const res = await fetch('/api/auth/login/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: pendingIdentifier, otp }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Invalid OTP')

        await get().hydrate()
        set({ loginStep: 'identifier', pendingIdentifier: null, maskedEmail: null })
      },

      validateOnboardingLink: async (token: string) => {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Invalid onboarding link')
        return { prefilled: data.prefilled, isProfileCompleted: data.isProfileCompleted }
      },

      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        set({
          user: null,
          isAuthenticated: false,
          loginStep: 'identifier',
          pendingIdentifier: null,
          maskedEmail: null,
        })
      },

      resetLoginFlow: () => {
        set({ loginStep: 'identifier', pendingIdentifier: null, maskedEmail: null })
      },

      setUser: (user: AuthUser) => {
        set({ user, isAuthenticated: true })
      },
    }),
    { name: 'auth-store' }
  )
)