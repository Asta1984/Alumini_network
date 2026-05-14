// app/api/admin/messages/route.ts
// GET: Fetch all messages received by a specific student with pagination

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

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
    }

    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { recipientId: studentId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          messageText: true,
          modifiedText: true,
          characterCount: true,
          createdAt: true,
          status: true,
          sender: {
            select: {
              id: true,
              fullName: true,
              enrollmentNumber: true,
            },
          },
        },
      }),
      prisma.message.count({ where: { recipientId: studentId } }),
    ])

    return NextResponse.json({
      messages: messages.map(m => ({
        id: m.id,
        senderName: m.sender.fullName,
        senderEnrollment: m.sender.enrollmentNumber,
        senderId: m.sender.id,
        text: m.status === 'MODIFIED' && m.modifiedText ? m.modifiedText : m.messageText,
        modifiedText: m.modifiedText,
        originalText: m.messageText,
        characterCount: m.characterCount,
        createdAt: m.createdAt,
        status: m.status,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[admin/messages GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
