// app/api/messages/create/route.ts
// Spec: Private messages — NEVER visible to recipient or peers
// Enforces: window active, char 400-600, max per user, no self-message

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromCookie, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const token = extractTokenFromCookie(cookieHeader)

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const { recipientId, messageText } = await request.json()

    if (!recipientId || !messageText) {
      return NextResponse.json(
        { error: 'Recipient and message text are required' },
        { status: 400 }
      )
    }

    // ── Rule 1: No self-messaging ─────────────────────────────────────
    if (recipientId === decoded.userId) {
      return NextResponse.json(
        { error: 'You cannot write a message to yourself' },
        { status: 400 }
      )
    }

    // ── Rule 2: Check message window is active ────────────────────────
    const window = await prisma.messageWindow.findFirst({
      where: { isActive: true },
    })

    if (!window) {
      return NextResponse.json(
        { error: 'The message writing window is not currently open' },
        { status: 403 }
      )
    }

    const now = new Date()
    if (now < window.startDate || now > window.endDate) {
      return NextResponse.json(
        { error: 'The message writing window is closed' },
        { status: 403 }
      )
    }

    // ── Rule 3: Character count (400–600) ─────────────────────────────
    const limits = await prisma.messageLimit.findFirst()
    const minChars = limits?.minCharacters ?? 400
    const maxChars = limits?.maxCharacters ?? 600
    const charCount = messageText.trim().length

    if (charCount < minChars) {
      return NextResponse.json(
        { error: `Message must be at least ${minChars} characters (currently ${charCount})` },
        { status: 400 }
      )
    }

    if (charCount > maxChars) {
      return NextResponse.json(
        { error: `Message must not exceed ${maxChars} characters (currently ${charCount})` },
        { status: 400 }
      )
    }

    // ── Rule 4: Max messages per user ─────────────────────────────────
    const maxMessages = limits?.maxPerUser ?? 100
    const sentCount = await prisma.message.count({
      where: { senderId: decoded.userId },
    })

    if (sentCount >= maxMessages) {
      return NextResponse.json(
        { error: `You have reached the maximum of ${maxMessages} messages` },
        { status: 403 }
      )
    }

    // ── Rule 5: Verify recipient exists ───────────────────────────────
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, isProfileCompleted: true },
    })

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      )
    }

    // ── Create message ────────────────────────────────────────────────
    const message = await prisma.message.create({
      data: {
        senderId: decoded.userId,
        recipientId,
        messageText: messageText.trim(),
        characterCount: charCount,
      },
    })

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        messageId: message.id,
        characterCount: message.characterCount,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[messages/create] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}