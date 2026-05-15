// app/api/auth/onboarding-verify/route.ts
// Validates onboarding token and returns prefilled user data
// Token is passed in Authorization header: Bearer <onboarding_token>
// This endpoint is called before profile completion to validate the link

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 400 })
    }

    const onboardingToken = authHeader.slice(7) // Remove 'Bearer ' prefix

    // Validate token exists in onboardingLink table and hasn't been used
    const onboardingLink = await prisma.onboardingLink.findUnique({
      where: { token: onboardingToken },
      include: { user: true },
    })

    if (!onboardingLink) {
      return NextResponse.json({ error: 'Invalid onboarding link' }, { status: 404 })
    }

    if (onboardingLink.isUsed) {
      return NextResponse.json(
        { error: 'This onboarding link has already been used' },
        { status: 400 }
      )
    }

    if (onboardingLink.expiresAt && new Date(onboardingLink.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Onboarding link has expired' }, { status: 410 })
    }

    const user = onboardingLink.user

    // Generate a temporary JWT token for this onboarding session
    // This token will be used for the profile completion request
    const tempToken = generateToken({
      userId: user.id,
      email: user.email,
      enrollmentNumber: user.enrollmentNumber,
    })

    return NextResponse.json(
      {
        prefilled: {
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          enrollmentNumber: user.enrollmentNumber,
        },
        isProfileCompleted: user.isProfileCompleted,
        tempToken, // Send back the temporary token for use in profile completion
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[auth/onboarding-verify] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
