// lib/admin-auth.ts
// Shared admin auth utilities — imported by all admin API routes

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export interface AdminTokenPayload {
  adminId: string
  email: string
  role: string
}

export function extractAdminToken(cookieString: string | null): string | null {
  if (!cookieString) return null
  for (const cookie of cookieString.split(';')) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'admin_token') return decodeURIComponent(value)
  }
  return null
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload
  } catch {
    return null
  }
}