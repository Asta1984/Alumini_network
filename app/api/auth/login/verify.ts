// ── OTP Verification ─────────────────────────────────────────────────────────
// POST /api/auth/login/verify
// Separate endpoint to keep concerns clean

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'


export async function PUT(request: NextRequest) {
  try {
    const { identifier, otp } = await request.json()

    if (!identifier || !otp) {
      return NextResponse.json(
        { error: 'Email/mobile and OTP are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { mobile: identifier.trim() },
        ],
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        enrollmentNumber: true,
        isProfileCompleted: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Find latest unused OTP
    const otpRecord = await prisma.authOtp.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'OTP expired or not found. Please request a new one.' },
        { status: 401 }
      )
    }

    // Verify OTP
    const { verifyOtp } = await import('@/lib/otp')
    const isValid = await verifyOtp(otp, otpRecord.otpCode)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 401 }
      )
    }

    // Mark OTP as used
    await prisma.authOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    })

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      enrollmentNumber: user.enrollmentNumber,
    })

    const response = NextResponse.json(
      {
        message: 'Login successful',
        userId: user.id,
        isProfileCompleted: user.isProfileCompleted,
      },
      { status: 200 }
    )

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error('[auth/login/verify] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

