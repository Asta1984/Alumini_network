import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'

// Generate CSV from messages data
function generateCSV(messages: any[], type: string): string {
  const headers = ['Recipient Name', 'Recipient Email', 'Sender Name', 'Message Text', 'Status', 'Date', 'Character Count']
  const rows = messages.map(msg => [
    msg.recipientName || 'N/A',
    msg.recipientEmail || 'N/A',
    msg.senderName || 'Unknown',
    `"${(msg.messageText || msg.modifiedText || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
    msg.status || 'PENDING',
    new Date(msg.createdAt).toISOString(),
    (msg.messageText || msg.modifiedText || '').length
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const decoded = verifyAdminToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const exportType = searchParams.get('type') || 'all' // 'all' or 'single'
    const studentId = searchParams.get('studentId')

    let messages: any[] = []
    let filename = ''

    if (exportType === 'single' && studentId) {
      // Export messages for a single recipient
      messages = await prisma.message.findMany({
        where: {
          recipientId: studentId,
          status: { in: ['PENDING', 'APPROVED', 'REJECTED', 'MODIFIED'] }
        },
        select: {
          id: true,
          messageText: true,
          modifiedText: true,
          status: true,
          createdAt: true,
          recipient: {
            select: {
              fullName: true,
              enrollmentNumber: true
            }
          },
          sender: {
            select: {
              fullName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Format messages for CSV
      messages = messages.map(msg => ({
        recipientName: msg.recipient?.fullName || 'N/A',
        recipientEmail: msg.recipient?.enrollmentNumber || 'N/A',
        senderName: msg.sender?.fullName || 'Unknown',
        messageText: msg.messageText,
        modifiedText: msg.modifiedText,
        status: msg.status,
        createdAt: msg.createdAt
      }))

      filename = `messages_${studentId}_${new Date().toISOString().split('T')[0]}.csv`
    } else {
      // Export all messages grouped by recipient
      const allMessages = await prisma.message.findMany({
        where: {
          status: { in: ['PENDING', 'APPROVED', 'REJECTED', 'MODIFIED'] }
        },
        select: {
          id: true,
          messageText: true,
          modifiedText: true,
          status: true,
          createdAt: true,
          recipient: {
            select: {
              id: true,
              fullName: true,
              enrollmentNumber: true
            }
          },
          sender: {
            select: {
              fullName: true
            }
          }
        },
        orderBy: [{ recipientId: 'asc' }, { createdAt: 'desc' }]
      })

      // Format messages for CSV
      messages = allMessages.map(msg => ({
        recipientName: msg.recipient?.fullName || 'N/A',
        recipientEmail: msg.recipient?.enrollmentNumber || 'N/A',
        senderName: msg.sender?.fullName || 'Unknown',
        messageText: msg.messageText,
        modifiedText: msg.modifiedText,
        status: msg.status,
        createdAt: msg.createdAt
      }))

      filename = `all_messages_${new Date().toISOString().split('T')[0]}.csv`
    }

    // Generate CSV
    const csv = generateCSV(messages, exportType)

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[v0] Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
