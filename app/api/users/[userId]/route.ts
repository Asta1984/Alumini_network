// app/api/users/[userId]/route.ts
// Returns public alumni profile — AI summary (if approved) + active social profiles
// NEVER exposes raw messages — spec critical rule

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromCookie, verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const token = extractTokenFromCookie(cookieHeader)

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        enrollmentNumber: true,
        profilePictureUrl: true,
        nickname: true,
        bio: true,
        createdAt: true,
        // Only active social profiles
        socialProfiles: {
          where: { isActive: true },
          select: {
            platform: true,
            profileUrl: true,
          },
          orderBy: { platform: 'asc' },
        },
        // Only approved AI summary — never raw messages
        aiSummary: {
          select: {
            summaryText: true,
            isApproved: true,
            approvedAt: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only expose summary if approved
    const summary =
      user.aiSummary?.isApproved ? user.aiSummary.summaryText : null

    return NextResponse.json({
      userId: user.id,
      fullName: user.fullName,
      enrollmentNumber: user.enrollmentNumber,
      profilePictureUrl: user.profilePictureUrl,
      nickname: user.nickname,
      bio: user.bio,
      socialProfiles: user.socialProfiles,
      aiSummary: summary,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('[users/[userId]] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}