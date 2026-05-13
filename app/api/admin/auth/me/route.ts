// app/api/admin/auth/me/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractAdminToken, verifyAdminToken } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const decoded = verifyAdminToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error('[admin/auth/me] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}