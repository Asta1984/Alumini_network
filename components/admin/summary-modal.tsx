'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface SummaryModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  summary: {
    id: string
    studentName: string
    enrollmentNumber: string
    text: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: Date
    approvedAt: Date | null
    approvedBy?: string
  } | null
  onApprove?: (summaryId: string) => Promise<void>
  onReject?: (summaryId: string) => Promise<void>
}

export function SummaryModal({
  isOpen,
  onOpenChange,
  summary,
  onApprove,
  onReject,
}: SummaryModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!summary) return null

  const handleApprove = async () => {
    if (!onApprove) return
    setIsLoading(true)
    try {
      await onApprove(summary.id)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    setIsLoading(true)
    try {
      await onReject(summary.id)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI-Generated Summary</DialogTitle>
          <DialogDescription>
            {summary.studentName} ({summary.enrollmentNumber})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
              {summary.text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">Generated</p>
              <p className="text-foreground">
                {format(new Date(summary.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
            {summary.approvedAt && (
              <div>
                <p className="text-muted-foreground font-medium">Status</p>
                <p className="text-foreground capitalize">{summary.status}</p>
              </div>
            )}
          </div>

          {summary.approvedAt && summary.approvedBy && (
            <div className="text-xs text-muted-foreground bg-muted rounded px-3 py-2">
              Approved by {summary.approvedBy} on{' '}
              {format(new Date(summary.approvedAt), 'MMM dd, yyyy')}
            </div>
          )}
        </div>

        {summary.status === 'pending' && (onApprove || onReject) && (
          <DialogFooter className="gap-2">
            {onReject && (
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isLoading}
              >
                Reject
              </Button>
            )}
            {onApprove && (
              <Button
                onClick={handleApprove}
                disabled={isLoading}
              >
                Approve
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
