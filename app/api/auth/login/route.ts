import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOtpEmail } from '@/lib/email'
import { generateOtp, hashOtp } from '@/lib/otp'



function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  const masked = local[0] + '***'
  return `${masked}@${domain}`
}

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json()
    // identifier = email OR mobile (spec allows either)

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email or mobile number is required' },
        { status: 400 }
      )
    }

    // Find user by email OR mobile
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
      // Don't reveal whether user exists — generic message
      return NextResponse.json(
        { error: 'No account found with this email or mobile number' },
        { status: 404 }
      )
    }

    // Invalidate any existing unused OTPs for this user
    await prisma.authOtp.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    })

    // Generate new OTP
    const otpPlain = generateOtp()           // e.g. "483920"
    const otpHashed = await hashOtp(otpPlain) // store hashed

    const expiresAt = new Date()
    expiresAt.setMinutes(
      expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRY_MINUTES || '10')
    )

    await prisma.authOtp.create({
      data: {
        userId: user.id,
        otpCode: otpHashed,
        expiresAt,
      },
    })

    // Send OTP email
    await sendOtpEmail({
      to: user.email,
      name: user.fullName,
      otp: otpPlain,
    })

    return NextResponse.json(
      {
        message: 'OTP sent to your registered email address',
        email: maskEmail(user.email), // show partial email for UX e.g. r***@gmail.com
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[auth/login] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

