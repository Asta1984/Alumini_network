'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye} from 'lucide-react'

interface SentMessage {
  id: string
  recipientId: string
  recipientName: string
  messageText: string
  characterCount: number
  createdAt: string | Date
}

interface MessagePreviewProps {
  messages: SentMessage[]
  isLoading?: boolean
}

export function MessagePreview({ messages, isLoading }: MessagePreviewProps) {
  const [selectedMessage, setSelectedMessage] = useState<SentMessage | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        Loading messages...
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Eye className="w-10 h-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No messages sent yet</p>
        <p className="text-xs text-muted-foreground mt-1">Your sent memories will appear here</p>
      </div>
    )
  }

  

  return (
    <div className="space-y-3">
      {messages.map((msg) => {

        return (
          <div
            key={msg.id}
            className="border border-border rounded-lg p-4 hover:bg-accent/10 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{msg.recipientName}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {msg.messageText}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {msg.characterCount} characters
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {msg.createdAt && typeof msg.createdAt === 'string'
                      ? new Date(msg.createdAt).toLocaleDateString()
                      : msg.createdAt?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedMessage(msg)}
                >
                  View
                </Button>
              </div>
            </div>
          </div>
        )
      })}

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message to {selectedMessage?.recipientName}</DialogTitle>
          </DialogHeader>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Message</p>
              <div className="bg-secondary/10 rounded-lg p-4 text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {selectedMessage?.messageText}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <p className="uppercase tracking-wide mb-1">Characters</p>
                <p className="font-mono font-medium text-foreground">
                  {selectedMessage?.characterCount}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-wide mb-1">Sent Date</p>
                <p className="font-medium text-foreground">
                  {selectedMessage?.createdAt &&
                    (typeof selectedMessage.createdAt === 'string'
                      ? new Date(selectedMessage.createdAt).toLocaleDateString()
                      : selectedMessage.createdAt.toLocaleDateString())}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-wide mb-1">To</p>
                <p className="font-medium text-foreground">{selectedMessage?.recipientName}</p>
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
