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

    // Get all users with their approved/modified messages (ALUMNI wall shows approved memories from any user)
    const alumni = await prisma.user.findMany({
      where: {
        isProfileCompleted: true,
        messagesReceived: {
          some: {
            status: { in: ['APPROVED', 'MODIFIED'] }
          }
        }
      },
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
        socialProfiles: {
          where: { isActive: true },
          select: { platform: true, profileUrl: true },
        },
        messagesReceived: {
          where: { status: { in: ['APPROVED', 'MODIFIED'] } },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            messageText: true,
            modifiedText: true,
            status: true,
          }
        }
      }
    })

    // Get total count
    const total = await prisma.user.count({
      where: {
        isProfileCompleted: true,
        messagesReceived: {
          some: {
            status: { in: ['APPROVED', 'MODIFIED'] }
          }
        }
      }
    })

    return NextResponse.json({
      alumni: alumni.map(a => ({
        userId: a.id,
        fullName: a.fullName,
        profilePictureUrl: a.profilePictureUrl,
        nickname: a.nickname,
        bio: a.bio,
        socialProfiles: a.socialProfiles,
        messages: a.messagesReceived.map(m => ({
          id: m.id,
          text: m.status === 'MODIFIED' && m.modifiedText ? m.modifiedText : m.messageText,
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[alumni-wall] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
