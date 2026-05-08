// lib/otp.ts
// OTP generation, hashing, and verification
// 6-digit numeric OTPs, stored hashed in DB

import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

/** Generates a random 6-digit OTP string e.g. "483920" */
export function generateOtp(): string {
  const digits = Math.floor(100000 + Math.random() * 900000)
  return digits.toString()
}

/** Hashes OTP before storing in DB */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, SALT_ROUNDS)
}

/** Verifies plain OTP against stored hash */
export async function verifyOtp(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}