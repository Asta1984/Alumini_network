// app/api/admin/students/route.ts
// GET: list all students
// POST: bulk import students from CSV data

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractAdminToken, verifyAdminToken } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    const decoded = token ? verifyAdminToken(token) : null
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const graduationYear = searchParams.get('graduationYear')?.trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 20
    const skip = (page - 1) * limit

    const where: any = {}

    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' as const } },
        { enrollmentNumber: { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
      ]
    }

    if (graduationYear) {
      where.graduationYear = parseInt(graduationYear, 10)
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrollmentNumber: 'asc' },
        select: {
          id: true,
          fullName: true,
          enrollmentNumber: true,
          email: true,
          mobile: true,
          graduationYear: true,
          isProfileCompleted: true,
          userType: true,
          createdAt: true,
          onboardingLink: { select: { token: true, isUsed: true } },
          aiSummary: { select: { isApproved: true } },
          _count: { select: { messagesReceived: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      students: students.map(s => ({
        id: s.id,
        fullName: s.fullName,
        enrollmentNumber: s.enrollmentNumber,
        email: s.email,
        mobile: s.mobile,
        graduationYear: s.graduationYear,
        isProfileCompleted: s.isProfileCompleted,
        userType: s.userType,
        hasOnboardingLink: !!s.onboardingLink,
        linkUsed: s.onboardingLink?.isUsed ?? false,
        messagesReceived: s._count.messagesReceived,
        summaryApproved: s.aiSummary?.isApproved ?? false,
        createdAt: s.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[admin/students GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    const decoded = token ? verifyAdminToken(token) : null
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { students } = await request.json()
    // students: Array<{ fullName, enrollmentNumber, email, mobile }>

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'No students provided' }, { status: 400 })
    }

    // Validate required fields
    for (const s of students) {
      if (!s.fullName || !s.enrollmentNumber || !s.email || !s.mobile) {
        return NextResponse.json(
          { error: `Missing fields for student: ${s.enrollmentNumber || 'unknown'}` },
          { status: 400 }
        )
      }
    }

    // Upsert — skip duplicates by enrollmentNumber
    let created = 0
    let skipped = 0

    for (const s of students) {
      const existing = await prisma.user.findUnique({
        where: { enrollmentNumber: s.enrollmentNumber },
      })
      if (existing) { skipped++; continue }

      await prisma.user.create({
        data: {
          fullName: s.fullName.trim(),
          enrollmentNumber: s.enrollmentNumber.trim(),
          email: s.email.toLowerCase().trim(),
          mobile: s.mobile.trim(),
        },
      })
      created++
    }

    return NextResponse.json(
      { message: `Imported ${created} students. Skipped ${skipped} duplicates.`, created, skipped },
      { status: 201 }
    )
  } catch (error) {
    console.error('[admin/students POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
