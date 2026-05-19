'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle, XCircle, Edit2 } from 'lucide-react'

interface Message {
  id: string
  senderName: string
  senderEnrollment: string
  text: string
  modifiedText?: string | null
  originalText?: string
  characterCount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED'
}

interface MessageActionModalProps {
  message: Message | null
  isOpen: boolean
  onClose: () => void
  onActionComplete: () => void
}

export function MessageActionModal({ message, isOpen, onClose, onActionComplete }: MessageActionModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | 'modify' | null>(null)
  const [modifiedText, setModifiedText] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!message) return null

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (res.ok) {
        alert('Message approved successfully!')
        onActionComplete()
        onClose()
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason }),
      })

      if (res.ok) {
        alert('Message rejected successfully!')
        onActionComplete()
        onClose()
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleModify = async () => {
    if (!modifiedText.trim()) {
      alert('Please provide modified text')
      return
    }

    if (modifiedText.length < 5 || modifiedText.length > 60) {
      alert('Modified text must be between 5-60 characters')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'modify', modifiedText }),
      })

      if (res.ok) {
        alert('Message modified and approved!')
        onActionComplete()
        onClose()
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Review Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sender Info */}
          <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
            <p className="text-sm text-zinc-400">From</p>
            <p className="text-white font-medium">{message.senderName}</p>
            <p className="text-sm text-zinc-500">{message.senderEnrollment}</p>
          </div>

          {/* Message Status Badge */}
          <div className="flex items-center gap-2">
            {message.status === 'PENDING' && (
              <>
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="text-amber-500 font-medium">Pending Review</span>
              </>
            )}
            {message.status === 'APPROVED' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-500 font-medium">Approved</span>
              </>
            )}
            {message.status === 'REJECTED' && (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-500 font-medium">Rejected</span>
              </>
            )}
            {message.status === 'MODIFIED' && (
              <>
                <Edit2 className="w-5 h-5 text-blue-500" />
                <span className="text-blue-500 font-medium">Modified & Approved</span>
              </>
            )}
          </div>

          {/* Original Message */}
          <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
            <p className="text-sm text-zinc-400 mb-2">Original Message</p>
            <p className="text-white whitespace-pre-wrap">{message.originalText || message.text}</p>
            <p className="text-xs text-zinc-500 mt-2">{message.characterCount} characters</p>
          </div>

          {/* Modified Message (if exists) */}
          {message.status === 'MODIFIED' && message.modifiedText && (
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/50">
              <p className="text-sm text-blue-400 mb-2">Modified Message</p>
              <p className="text-white whitespace-pre-wrap">{message.modifiedText}</p>
              <p className="text-xs text-blue-500 mt-2">{message.modifiedText.length} characters</p>
            </div>
          )}

          {/* Action Selection */}
          {message.status === 'PENDING' && (
            <div className="space-y-3">
              {action === null && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAction('approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => setAction('modify')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Modify & Approve
                  </Button>
                  <Button
                    onClick={() => setAction('reject')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reject
                  </Button>
                </div>
              )}

              {action === 'modify' && (
                <div className="space-y-2">
                  <label className="block text-sm text-zinc-300">Modified Message</label>
                  <Textarea
                    value={modifiedText}
                    onChange={(e) => setModifiedText(e.target.value)}
                    placeholder="Edit the message here (5-60 characters)"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    rows={6}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">
                      {modifiedText.length} / 60 characters
                    </span>
                    {modifiedText.length < 5 && (
                      <span className="text-sm text-red-500">Too short (min 5)</span>
                    )}
                    {modifiedText.length > 60 && (
                      <span className="text-sm text-red-500">Too long (max 60)</span>
                    )}
                  </div>
                </div>
              )}

              {action === 'reject' && (
                <div className="space-y-2">
                  <label className="block text-sm text-zinc-300">Rejection Reason</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Why is this message being rejected?"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    rows={3}
                  />
                </div>
              )}

              {action && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAction(null)}
                    variant="outline"
                    className="flex-1 border-zinc-700 text-zinc-300"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={
                      action === 'approve'
                        ? handleApprove
                        : action === 'reject'
                          ? handleReject
                          : handleModify
                    }
                    disabled={isLoading}
                    className="flex-1 bg-accent hover:bg-muted-foreground text-white"
                  >
                    {isLoading ? 'Processing...' : `Confirm ${action}`}
                  </Button>
                </div>
              )}
            </div>
          )}

          {message.status !== 'PENDING' && (
            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-400 mb-2">Status</p>
              <p className="text-white font-medium capitalize">{message.status.toLowerCase()}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
