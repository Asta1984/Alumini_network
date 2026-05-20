// app/api/auth/complete-profile/route.ts
// Spec Phase 1: After clicking onboarding link, student completes their profile
// Enrollment number is LOCKED (from onboarding link), cannot be changed
// LinkedIn is MANDATORY

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromCookie, verifyToken } from '@/lib/auth'
import { SocialPlatform } from '@/generated/prisma/client'

interface SocialProfileInput {
  platform: SocialPlatform
  profileUrl: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      onboardingToken,
      fullName,
      nickname,
      bio,
      graduationYear,
      profilePictureUrl,
      socialProfiles,
    }: {
      onboardingToken?: string
      fullName: string
      nickname?: string
      bio?: string
      graduationYear?: number
      profilePictureUrl?: string
      socialProfiles: SocialProfileInput[]
    } = body

    // ── Resolve user identity ─────────────────────────────────────────────
    // Onboarding token (from URL) takes precedence over any stored session —
    // this ensures correct identity on shared devices.
    let userId: string

    if (onboardingToken) {
      const onboardingLink = await prisma.onboardingLink.findUnique({
        where: { token: onboardingToken },
      })

      if (!onboardingLink) {
        return NextResponse.json(
          { error: 'Invalid or expired onboarding link' },
          { status: 401 }
        )
      }

      // Prevent replay after successful submission
      if (onboardingLink.usedAt) {
        return NextResponse.json(
          { error: 'This onboarding link has already been used' },
          { status: 410 }
        )
      }

      userId = onboardingLink.userId
    } else {
      // Fallback: Bearer header → cookie (for any non-onboarding callers)
      let token: string | null = null

      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }

      if (!token) {
        token = extractTokenFromCookie(request.headers.get('cookie'))
      }

      if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      }

      userId = decoded.userId
    }

    // ── Validation ────────────────────────────────────────────────────────
    if (!fullName?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    const linkedIn = socialProfiles?.find(
      (p) => p.platform === SocialPlatform.LINKEDIN
    )

    if (!linkedIn) {
      return NextResponse.json(
        { error: 'LinkedIn profile URL is required' },
        { status: 400 }
      )
    }

    if (!linkedIn.profileUrl.includes('linkedin.com/in/')) {
      return NextResponse.json(
        { error: 'LinkedIn URL must contain linkedin.com/in/' },
        { status: 400 }
      )
    }

    for (const profile of socialProfiles) {
      try {
        new URL(profile.profileUrl)
      } catch {
        return NextResponse.json(
          { error: `Invalid URL format for ${profile.platform}` },
          { status: 400 }
        )
      }
    }

    // ── Update user profile ───────────────────────────────────────────────
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          fullName: fullName.trim(),
          nickname: nickname?.trim() || null,
          bio: bio?.trim() || null,
          graduationYear: graduationYear || null,
          profilePictureUrl: profilePictureUrl || null,
          isProfileCompleted: true,
        },
      })

      await tx.socialProfile.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      })

      await tx.socialProfile.createMany({
        data: socialProfiles.map((p) => ({
          userId,
          platform: p.platform,
          profileUrl: p.profileUrl,
          isActive: true,
        })),
      })

      // Mark onboarding link as used inside the same transaction
      if (onboardingToken) {
        await tx.onboardingLink.update({
          where: { token: onboardingToken },
          data: { usedAt: new Date() },
        })
      }

      return user
    })

    return NextResponse.json(
      {
        message: 'Profile completed successfully',
        userId: updatedUser.id,
        isProfileCompleted: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[auth/complete-profile] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── Update social profiles (alumni can update anytime) ────────────────────────
// Old URLs are preserved (isActive: false) — spec requirement
export async function PATCH(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const token = extractTokenFromCookie(cookieHeader)

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const { socialProfiles }: { socialProfiles: SocialProfileInput[] } =
      await request.json()

    const linkedIn = socialProfiles?.find(
      (p) => p.platform === SocialPlatform.LINKEDIN
    )

    if (!linkedIn || !linkedIn.profileUrl.includes('linkedin.com/in/')) {
      return NextResponse.json(
        { error: 'Valid LinkedIn profile URL is required' },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.socialProfile.updateMany({
        where: { userId: decoded.userId, isActive: true },
        data: { isActive: false },
      })

      await tx.socialProfile.createMany({
        data: socialProfiles.map((p) => ({
          userId: decoded.userId,
          platform: p.platform,
          profileUrl: p.profileUrl,
          isActive: true,
        })),
      })
    })

    return NextResponse.json(
      { message: 'Social profiles updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[auth/complete-profile PATCH] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
