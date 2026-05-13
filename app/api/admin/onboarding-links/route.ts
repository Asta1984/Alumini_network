// app/api/admin/onboarding-links/route.ts
// POST: generate onboarding links for one or all students without links

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractAdminToken, verifyAdminToken } from '@/lib/admin-auth'
import crypto from 'crypto'

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const token = extractAdminToken(request.headers.get('cookie'))
    const decoded = token ? verifyAdminToken(token) : null
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { userId, all } = await request.json()
    // userId: generate for one student
    // all: true → generate for all students without links

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (all) {
      // Find all users without onboarding links
      const usersWithoutLinks = await prisma.user.findMany({
        where: { onboardingLink: null },
        select: { id: true, enrollmentNumber: true, mobile: true },
      })

      if (usersWithoutLinks.length === 0) {
        return NextResponse.json({ message: 'All students already have links', generated: 0 })
      }

      const links = await Promise.all(
        usersWithoutLinks.map(async (u) => {
          const t = generateToken()
          await prisma.onboardingLink.create({
            data: {
              userId: u.id,
              token: t,
              enrollmentNumber: u.enrollmentNumber,
              mobile: u.mobile,
            },
          })
          return { userId: u.id, url: `${appUrl}/onboarding?token=${t}` }
        })
      )

      return NextResponse.json({
        message: `Generated ${links.length} onboarding links`,
        generated: links.length,
        links,
      })
    }

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { onboardingLink: true },
      })

      if (!user) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }

      // Regenerate if exists
      if (user.onboardingLink) {
        await prisma.onboardingLink.delete({ where: { userId } })
      }

      const t = generateToken()
      await prisma.onboardingLink.create({
        data: {
          userId,
          token: t,
          enrollmentNumber: user.enrollmentNumber,
          mobile: user.mobile,
        },
      })

      return NextResponse.json({
        message: 'Onboarding link generated',
        url: `${appUrl}/onboarding?token=${t}`,
      })
    }

    return NextResponse.json({ error: 'Provide userId or all: true' }, { status: 400 })
  } catch (error) {
    console.error('[admin/onboarding-links] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}