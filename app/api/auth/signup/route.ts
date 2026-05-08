import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
 
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
 
    if (!token) {
      return NextResponse.json(
        { error: 'Onboarding token is required' },
        { status: 400 }
      )
    }
 
    // Find the onboarding link
    const onboardingLink = await prisma.onboardingLink.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            enrollmentNumber: true,
            isProfileCompleted: true,
          },
        },
      },
    })
 
    if (!onboardingLink) {
      return NextResponse.json(
        { error: 'Invalid or expired onboarding link' },
        { status: 404 }
      )
    }
 
    // Check if link has expired
    if (onboardingLink.expiresAt && onboardingLink.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This onboarding link has expired. Please contact your administrator.' },
        { status: 410 }
      )
    }
 
    // Mark link as used (first use only — allow re-use for profile editing)
    if (!onboardingLink.isUsed) {
      await prisma.onboardingLink.update({
        where: { id: onboardingLink.id },
        data: { isUsed: true, usedAt: new Date() },
      })
    }
 
    const user = onboardingLink.user
 
    // Issue auth token so student can proceed to complete profile
    const authToken = generateToken({
      userId: user.id,
      email: user.email,
      enrollmentNumber: user.enrollmentNumber,
    })
 
    const response = NextResponse.json(
      {
        message: 'Onboarding link validated',
        userId: user.id,
        // Pre-filled data for the profile form (enrollment + mobile are LOCKED)
        prefilled: {
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          enrollmentNumber: user.enrollmentNumber, // locked — cannot edit
        },
        isProfileCompleted: user.isProfileCompleted,
      },
      { status: 200 }
    )
 
    response.cookies.set('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })
 
    return response
  } catch (error) {
    console.error('[auth/signup] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}