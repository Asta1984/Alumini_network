// app/api/admin/message-window/route.ts
// GET: Fetch current message window and limits
// PATCH: Update message window dates/status or message limits

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractAdminToken, verifyAdminToken } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    const decoded = token ? verifyAdminToken(token) : null
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const [window, limits] = await Promise.all([
      prisma.messageWindow.findFirst({
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.messageLimit.findFirst({
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      window: window ? {
        id: window.id,
        startDate: window.startDate,
        endDate: window.endDate,
        isActive: window.isActive,
      } : null,
      limits: limits ? {
        id: limits.id,
        maxPerUser: limits.maxPerUser,
        minCharacters: limits.minCharacters,
        maxCharacters: limits.maxCharacters,
      } : null,
    })
  } catch (error) {
    console.error('[admin/message-window GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    const decoded = token ? verifyAdminToken(token) : null
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()

    // Update message window (if startDate, endDate, or isActive provided)
    if (body.startDate || body.endDate || typeof body.isActive === 'boolean') {
      const existingWindow = await prisma.messageWindow.findFirst({
        orderBy: { updatedAt: 'desc' },
      })

      let updatedWindow
      if (existingWindow) {
        updatedWindow = await prisma.messageWindow.update({
          where: { id: existingWindow.id },
          data: {
            startDate: body.startDate ? new Date(body.startDate) : undefined,
            endDate: body.endDate ? new Date(body.endDate) : undefined,
            isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
          },
        })
      } else {
        updatedWindow = await prisma.messageWindow.create({
          data: {
            startDate: body.startDate ? new Date(body.startDate) : new Date(),
            endDate: body.endDate ? new Date(body.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
          },
        })
      }

      return NextResponse.json({
        success: true,
        window: {
          id: updatedWindow.id,
          startDate: updatedWindow.startDate,
          endDate: updatedWindow.endDate,
          isActive: updatedWindow.isActive,
        },
      })
    }

    // Update message limits (if maxPerUser, minCharacters, or maxCharacters provided)
    if (body.maxPerUser || body.minCharacters || body.maxCharacters) {
      const existingLimits = await prisma.messageLimit.findFirst({
        orderBy: { updatedAt: 'desc' },
      })

      let updatedLimits
      if (existingLimits) {
        updatedLimits = await prisma.messageLimit.update({
          where: { id: existingLimits.id },
          data: {
            maxPerUser: body.maxPerUser ?? undefined,
            minCharacters: body.minCharacters ?? undefined,
            maxCharacters: body.maxCharacters ?? undefined,
          },
        })
      } else {
        updatedLimits = await prisma.messageLimit.create({
          data: {
            maxPerUser: body.maxPerUser ?? 100,
            minCharacters: body.minCharacters ?? 4,
            maxCharacters: body.maxCharacters ?? 60,
          },
        })
      }

      return NextResponse.json({
        success: true,
        limits: {
          id: updatedLimits.id,
          maxPerUser: updatedLimits.maxPerUser,
          minCharacters: updatedLimits.minCharacters,
          maxCharacters: updatedLimits.maxCharacters,
        },
      })
    }

    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  } catch (error) {
    console.error('[admin/message-window PATCH] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
