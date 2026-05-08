// app/api/alumni/batchmates/route.ts
// Spec: "Explore Others (My Batchmates)" section
// Shows all alumni with: profile pic, name, enrollment, AI summary, LinkedIn
// NEVER shows raw messages or who wrote what

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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 20
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { isProfileCompleted: true },
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
        select: {
          id: true,
          fullName: true,
          enrollmentNumber: true,
          profilePictureUrl: true,
          nickname: true,
          bio: true,
          // Active social profiles
          socialProfiles: {
            where: { isActive: true },
            select: { platform: true, profileUrl: true },
          },
          // Only approved AI summary text
          aiSummary: {
            select: {
              summaryText: true,
              isApproved: true,
            },
          },
        },
      }),
      prisma.user.count({ where: { isProfileCompleted: true } }),
    ])

    return NextResponse.json({
      batchmates: users.map((u:any) => ({
        userId: u.id,
        fullName: u.fullName,
        enrollmentNumber: u.enrollmentNumber,
        profilePictureUrl: u.profilePictureUrl,
        nickname: u.nickname,
        bio: u.bio,
        socialProfiles: u.socialProfiles,
        // Only show summary if approved
        aiSummary: u.aiSummary?.isApproved
          ? u.aiSummary.summaryText
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[alumni/batchmates] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}