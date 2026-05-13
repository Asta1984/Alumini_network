// app/api/messages/sent/route.ts
// Returns all messages sent by the current user with recipient details and approval status

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

    const messages = await prisma.message.findMany({
      where: { senderId: decoded.userId },
      include: {
        recipient: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      messages: messages.map(m => ({
        id: m.id,
        recipientId: m.recipientId,
        recipientName: m.recipient.fullName,
        messageText: m.messageText,
        characterCount: m.characterCount,
        createdAt: m.createdAt,
      })),
    })
  } catch (error) {
    console.error('[messages/sent] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
