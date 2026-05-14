// app/api/admin/users/[userId]/tag-alumni/route.ts
// PATCH: Tag a user as ALUMNI (admin only)
// Idempotent — safe to call multiple times

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractAdminToken, verifyAdminToken } from '@/lib/admin-auth'

interface RequestBody {
  userType: 'ALUMNI' | 'STUDENT'
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    const decoded = token ? verifyAdminToken(token) : null
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { userId } = await params
    const { userType } = (await request.json()) as RequestBody

    // Validate userType
    if (!['ALUMNI', 'STUDENT'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid userType. Must be ALUMNI or STUDENT' },
        { status: 400 }
      )
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch current user type to check idempotency
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    // Idempotency: If already tagged with same type, return current state
    if (currentUser?.userType === userType) {
      return NextResponse.json(
        {
          message: `User is already tagged as ${userType}`,
          data: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            userType: currentUser.userType,
          },
        },
        { status: 200 }
      )
    }

    // Update user type
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        userType,
      },
    })

    // Log audit action
    await prisma.auditLog.create({
      data: {
        adminId: decoded.adminId,
        action: 'USER_TAGGED',
        targetUserId: userId,
        metadata: {
          userId,
          previousUserType: currentUser?.userType,
          newUserType: userType,
          userName: user.fullName,
          userEmail: user.email,
        },
      },
    })

    return NextResponse.json(
      {
        message: `User tagged as ${userType} successfully`,
        data: {
          id: updatedUser.id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          userType: updatedUser.userType,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[admin/users/[userId]/tag-alumni PATCH] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Fetch user details (optional, for UI pre-population)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    const decoded = token ? verifyAdminToken(token) : null
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        enrollmentNumber: true,
        isProfileCompleted: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        data: user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[admin/users/[userId] GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
