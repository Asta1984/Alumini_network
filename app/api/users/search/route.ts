// app/api/users/search/route.ts
// Search batchmates by name or enrollment number
// Returns only public-safe fields — no messages, no unapproved summaries

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromCookie, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const token = extractTokenFromCookie(cookieHeader)

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const users = await prisma.user.findMany({
      where: {
        isProfileCompleted: true, // Only show users who have completed onboarding
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { enrollmentNumber: { contains: query, mode: 'insensitive' } },
          { nickname: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        enrollmentNumber: true,
        profilePictureUrl: true,
        nickname: true,
        // Include LinkedIn only (highlighted per spec)
        socialProfiles: {
          where: {
            isActive: true,
            platform: 'LINKEDIN',
          },
          select: { profileUrl: true },
          take: 1,
        },
      },
      take: 20,
      orderBy: { fullName: 'asc' },
    })

    return NextResponse.json({
      users: users.map((u:any) => ({
        userId: u.id,
        fullName: u.fullName,
        enrollmentNumber: u.enrollmentNumber,
        profilePictureUrl: u.profilePictureUrl,
        nickname: u.nickname,
        linkedInUrl: u.socialProfiles[0]?.profileUrl ?? null,
      })),
    })
  } catch (error) {
    console.error('[users/search] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}