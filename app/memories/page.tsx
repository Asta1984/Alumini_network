'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/auth.store'
import { WindowBanner } from '@/components/memories/window-banner'
import { BatchmatesDropdown } from '@/components/memories/batchmates-dropdown'
import { CharacterCounter } from '@/components/memories/character-counter'
import { MessagePreview } from '@/components/memories/message-preview'
import { toast } from 'sonner'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface WindowData {
  isActive: boolean
  startDate: string
  endDate: string
}

interface LimitData {
  minCharacters: number
  maxCharacters: number
  maxPerUser: number
}

interface SentMessage {
  id: string
  recipientId: string
  recipientName: string
  messageText: string
  characterCount: number
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function MemoriesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuthStore()

  // Form state
  const [recipientId, setRecipientId] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Window & limits state
  const [window, setWindow] = useState<WindowData | null>(null)
  const [limits, setLimits] = useState<LimitData>({
    minCharacters: 400,
    maxCharacters: 600,
    maxPerUser: 100,
  })

  // Messages history
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // Load window, limits, and sent messages
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const [windowRes, messagesRes] = await Promise.all([
          fetch('/api/message-window'),
          fetch('/api/messages/sent'),
        ])

        if (windowRes.ok) {
          const windowData = await windowRes.json()
          console.log('[v0] Window data loaded:', windowData)
          setWindow({
            isActive: windowData.isActive,
            startDate: windowData.startDate,
            endDate: windowData.endDate,
          })
          setLimits({
            minCharacters: windowData.minCharacters || 400,
            maxCharacters: windowData.maxCharacters || 600,
            maxPerUser: windowData.maxPerUser || 100,
          })
        }

        if (messagesRes.ok) {
          const messagesData = await messagesRes.json()
          setSentMessages(messagesData.messages || [])
        }
      } catch (error) {
        console.error('[v0] Failed to load data:', error)
        toast.error('Failed to load memory data')
      }
    }

    loadData()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipientId) {
      toast.error('Please select a batchmate')
      return
    }

    if (!messageText.trim()) {
      toast.error('Please write a message')
      return
    }

    const charCount = messageText.trim().length
    if (charCount < limits.minCharacters) {
      toast.error(`Message must be at least ${limits.minCharacters} characters`)
      return
    }

    if (charCount > limits.maxCharacters) {
      toast.error(`Message cannot exceed ${limits.maxCharacters} characters`)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/messages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          messageText: messageText.trim(),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to send message')
      }

      toast.success('Memory sent successfully! Admin will review it.')

      // Reset form
      setMessageText('')
      setRecipientId('')

      // Refresh sent messages
      const messagesRes = await fetch('/api/messages/sent')
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json()
        setSentMessages(messagesData.messages || [])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send memory'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const windowStatus = window
    ? new Date() < new Date(window.startDate)
      ? 'upcoming'
      : new Date() > new Date(window.endDate)
        ? 'closed'
        : 'open'
    : 'closed'

  const isWindowOpen = windowStatus === 'open' && window?.isActive
  
  console.log('[v0] Window status:', { windowStatus, isWindowOpen, window })

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Write a Memory</h1>
            <p className="text-sm text-muted-foreground">Share your thoughts with a batchmate</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Write Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Window Status */}
            <WindowBanner
              isActive={window?.isActive ?? false}
              status={windowStatus as 'open' | 'closed' | 'upcoming'}
              startDate={window?.startDate ? new Date(window.startDate) : undefined}
              endDate={window?.endDate ? new Date(window.endDate) : undefined}
            />

            {/* Form */}
            <div className="bg-card rounded-lg border border-border p-6 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Batchmate Dropdown */}
                <BatchmatesDropdown
                  onSelect={setRecipientId}
                  selectedId={recipientId}
                  disabled={!isWindowOpen}
                  currentUserId={user?.userId}
                />

                {/* Message Textarea */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Your Memory</label>
                  <Textarea
                    placeholder="Write your heartfelt memory here..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={!isWindowOpen || isSubmitting}
                    className="min-h-40 resize-none"
                  />
                </div>

                {/* Character Counter */}
                <CharacterCounter
                  current={messageText.length}
                  min={limits.minCharacters}
                  max={limits.maxCharacters}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    !isWindowOpen ||
                    isSubmitting ||
                    !recipientId ||
                    messageText.trim().length === 0
                  }
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Memory
                    </>
                  )}
                </Button>

                {!isWindowOpen && (
                  <div className="text-sm text-center bg-secondary rounded-lg px-4 py-2">
                    {window?.isActive === false ? (
                      <p className="text-muted-foreground">Memory window is not yet active. Please check back later.</p>
                    ) : windowStatus === 'upcoming' ? (
                      <p className="text-muted-foreground">Memory window opens on {window?.startDate ? new Date(window.startDate).toLocaleDateString() : 'TBD'}.</p>
                    ) : windowStatus === 'closed' ? (
                      <p className="text-muted-foreground">Memory window has closed. Thank you for your submission.</p>
                    ) : (
                      <p className="text-muted-foreground">Memory window is temporarily unavailable.</p>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sent Messages History Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-4">
              <h3 className="font-semibold text-foreground mb-4">Your Sent Memories</h3>
              <MessagePreview messages={sentMessages} isLoading={messagesLoading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
