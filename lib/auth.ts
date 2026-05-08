// lib/auth.ts
// JWT auth helpers — updated for spec (enrollmentNumber replaces username)

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export interface AuthPayload {
  userId: string
  email: string
  enrollmentNumber: string
}

export interface DecodedToken extends AuthPayload {
  iat: number
  exp: number
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION'
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '7d'
const SALT_ROUNDS = 10

// ── Password helpers (admin only — students use OTP) ─────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// ── JWT helpers ───────────────────────────────────────────────────────────────

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken
  } catch {
    return null
  }
}

export function extractTokenFromCookie(
  cookieString: string | null | undefined
): string | null {
  if (!cookieString) return null
  for (const cookie of cookieString.split(';')) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'auth_token') return decodeURIComponent(value)
  }
  return null
}