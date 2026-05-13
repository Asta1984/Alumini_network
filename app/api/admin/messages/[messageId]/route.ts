// app/api/admin/messages/[messageId]/route.ts
// Idempotent endpoints for approving, rejecting, and modifying messages

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractAdminToken, verifyAdminToken } from '@/lib/admin-auth'

interface RequestBody {
  action: 'approve' | 'reject' | 'modify'
  modifiedText?: string
  rejectionReason?: string
}

// Helper: Generate idempotency key from request
function getIdempotencyKey(messageId: string, action: string, adminId: string): string {
  return `${messageId}:${action}:${adminId}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    const decoded = token ? verifyAdminToken(token) : null
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { messageId } = await params
    const { action, modifiedText, rejectionReason } = (await request.json()) as RequestBody

    if (!['approve', 'reject', 'modify'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Fetch current message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, status: true, messageText: true, characterCount: true, recipientId: true },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Idempotency: If already processed, return current state
    if (message.status !== 'PENDING') {
      return NextResponse.json(
        {
          message: `Message is already ${message.status.toLowerCase()}`,
          data: message,
        },
        { status: 200 }
      )
    }

    let updatedMessage

    if (action === 'approve') {
      updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          status: 'APPROVED',
          approvedById: decoded.adminId,
          approvedAt: new Date(),
        },
      })
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json({ error: 'rejectionReason is required for rejection' }, { status: 400 })
      }

      updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          status: 'REJECTED',
          rejectionReason,
          approvedById: decoded.adminId,
          approvedAt: new Date(),
        },
      })
    } else if (action === 'modify') {
      if (!modifiedText) {
        return NextResponse.json({ error: 'modifiedText is required for modification' }, { status: 400 })
      }

      // Validate character count
      if (modifiedText.length < 400 || modifiedText.length > 600) {
        return NextResponse.json(
          { error: 'Modified text must be between 400-600 characters' },
          { status: 400 }
        )
      }

      updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          status: 'MODIFIED',
          modifiedText,
          characterCount: modifiedText.length,
          approvedById: decoded.adminId,
          approvedAt: new Date(),
        },
      })
    }

    if (!updatedMessage) {
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }

    // Log audit action
    await prisma.auditLog.create({
      data: {
        adminId: decoded.adminId,
        action: action === 'approve' ? 'SUMMARY_APPROVED' : 'SUMMARY_EDITED',
        targetUserId: message.recipientId,
        metadata: {
          messageId,
          action,
          previousStatus: message.status,
          newStatus: updatedMessage.status,
        },
      },
    })

    return NextResponse.json(
      {
        message: `Message ${action}d successfully`,
        data: updatedMessage,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[admin/messages/[messageId] POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
