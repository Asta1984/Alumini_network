'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'

interface MessageModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  message: {
    senderName: string
    senderEnrollment: string
    text: string
    characterCount: number
    createdAt: Date
  } | null
}

export function MessageModal({ isOpen, onOpenChange, message }: MessageModalProps) {
  if (!message) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Full Message</DialogTitle>
          <DialogDescription>
            From {message.senderName} ({message.senderEnrollment})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
              {message.text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">Character Count</p>
              <p className="text-foreground">{message.characterCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Submitted</p>
              <p className="text-foreground">
                {format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
