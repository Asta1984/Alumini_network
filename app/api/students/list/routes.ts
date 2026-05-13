// app/api/students/list/route.ts
// Returns all students for the batchmates dropdown in memories form
// Excludes current user, only returns profile-completed students

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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim().toLowerCase() || ''

    const students = await prisma.user.findMany({
      where: {
        id: { not: decoded.userId }, // Exclude current user
        isProfileCompleted: true,
        OR: search
          ? [
              { fullName: { contains: search, mode: 'insensitive' } },
              { enrollmentNumber: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      select: {
        id: true,
        fullName: true,
        enrollmentNumber: true,
      },
      orderBy: { fullName: 'asc' },
      take: 50, // Limit to 50 results for performance
    })

    return NextResponse.json({
      students: students.map(s => ({
        id: s.id,
        name: s.fullName,
        enrollment: s.enrollmentNumber,
        label: `${s.fullName} (${s.enrollmentNumber})`,
      })),
    })
  } catch (error) {
    console.error('[students/list] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
