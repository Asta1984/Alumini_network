// app/api/message-window/route.ts
// Public endpoint for students to check message window status (no auth required)

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [window, limits] = await Promise.all([
      prisma.messageWindow.findFirst({
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.messageLimit.findFirst({
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    // Return flattened structure for student use
    return NextResponse.json({
      isActive: window?.isActive ?? false,
      startDate: window?.startDate?.toISOString() ?? null,
      endDate: window?.endDate?.toISOString() ?? null,
      minCharacters: limits?.minCharacters ?? 4,
      maxCharacters: limits?.maxCharacters ?? 60,
      maxPerUser: limits?.maxPerUser ?? 100,
    })
  } catch (error) {
    console.error('[message-window GET] Error:', error)
    return NextResponse.json(
      {
        isActive: false,
        startDate: null,
        endDate: null,
        minCharacters: 4,
        maxCharacters: 60,
        maxPerUser: 100,
      },
      { status: 200 }
    )
  }
}
