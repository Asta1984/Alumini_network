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
    let token: string | null = null

    // 1. Check for onboarding token in Authorization header (takes precedence)
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7) // Remove 'Bearer ' prefix
    }

    // 2. Fallback to cookie token if no header token
    if (!token) {
      const cookieHeader = request.headers.get('cookie')
      token = extractTokenFromCookie(cookieHeader)
    }

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const {
      fullName,
      nickname,
      bio,
      profilePictureUrl,
      socialProfiles, // array of { platform, profileUrl }
    }: {
      fullName: string
      nickname?: string
      bio?: string
      profilePictureUrl?: string
      socialProfiles: SocialProfileInput[]
    } = await request.json()

    // ── Validation ────────────────────────────────────────────────────────
    if (!fullName?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    // LinkedIn is mandatory
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

    // Validate optional URLs are valid format
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
      // Update user core fields
      const user = await tx.user.update({
        where: { id: decoded.userId },
        data: {
          fullName: fullName.trim(),
          nickname: nickname?.trim() || null,
          bio: bio?.trim() || null,
          profilePictureUrl: profilePictureUrl || null,
          isProfileCompleted: true,
        },
      })

      // Deactivate all existing active social profiles
      await tx.socialProfile.updateMany({
        where: { userId: decoded.userId, isActive: true },
        data: { isActive: false },
      })

      // Insert new active social profiles
      await tx.socialProfile.createMany({
        data: socialProfiles.map((p) => ({
          userId: decoded.userId,
          platform: p.platform,
          profileUrl: p.profileUrl,
          isActive: true,
        })),
      })

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

    // LinkedIn still mandatory
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
      // Mark existing active profiles as inactive (preserves history)
      await tx.socialProfile.updateMany({
        where: { userId: decoded.userId, isActive: true },
        data: { isActive: false },
      })

      // Create new active profiles
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
