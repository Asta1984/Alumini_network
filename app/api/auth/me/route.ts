import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromCookie, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const token = extractTokenFromCookie(cookieHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        enrollmentNumber: true,
        mobile: true,
        profilePictureUrl: true,
        nickname: true,
        bio: true,
        isProfileCompleted: true,
        createdAt: true,
        // Only return active social profiles
        socialProfiles: {
          where: { isActive: true },
          select: {
            id: true,
            platform: true,
            profileUrl: true,
          },
        },
        // Include AI summary only if approved
        aiSummary: {
          where: { isApproved: true },
          select: {
            summaryText: true,
            approvedAt: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      enrollmentNumber: user.enrollmentNumber,
      mobile: user.mobile,
      profilePictureUrl: user.profilePictureUrl,
      nickname: user.nickname,
      bio: user.bio,
      isProfileCompleted: user.isProfileCompleted,
      socialProfiles: user.socialProfiles,
      aiSummary: user.aiSummary ?? null,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('[auth/me] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}