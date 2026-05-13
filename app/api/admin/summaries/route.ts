// app/api/admin/summaries/route.ts
// GET: Fetch summary for a student
// PATCH: Approve or reject a summary

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractAdminToken, verifyAdminToken } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    const decoded = token ? verifyAdminToken(token) : null
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 20
    const status = searchParams.get('status') // 'all', 'pending', 'approved', 'rejected'

    const skip = (page - 1) * limit

    // Build where clause based on status filter
    let where: any = {}
    if (status === 'pending') {
      where.isApproved = null
    } else if (status === 'approved') {
      where.isApproved = true
    } else if (status === 'rejected') {
      where.isApproved = false
    }

    const [summaries, total] = await Promise.all([
      prisma.aiSummary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              enrollmentNumber: true,
            },
          },
        },
      }),
      prisma.aiSummary.count({ where }),
    ])

    return NextResponse.json({
      summaries: summaries.map(s => ({
        id: s.id,
        userId: s.user.id,
        studentName: s.user.fullName,
        enrollmentNumber: s.user.enrollmentNumber,
        text: s.summaryText,
        status: s.isApproved === null ? 'pending' : s.isApproved ? 'approved' : 'rejected',
        createdAt: s.createdAt,
        approvedAt: s.approvedAt,
        approvedById: s.approvedById,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[admin/summaries GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    const decoded = token ? verifyAdminToken(token) : null
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { summaryId, isApproved } = await request.json()

    if (!summaryId || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'summaryId and isApproved are required' },
        { status: 400 }
      )
    }

    const updated = await prisma.aiSummary.update({
      where: { id: summaryId },
      data: {
        isApproved,
        approvedAt: new Date(),
        approvedById: decoded.adminId,
      },
      select: {
        id: true,
        isApproved: true,
        approvedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      summary: updated,
    })
  } catch (error) {
    console.error('[admin/summaries PATCH] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
