'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface MessageWindow {
  id: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

interface MessageLimits {
  id: string
  maxPerUser: number
  minCharacters: number
  maxCharacters: number
}

export function SettingsTab() {
  const [window, setWindow] = useState<MessageWindow | null>(null)
  const [limits, setLimits] = useState<MessageLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Window form state
  const [windowStartDate, setWindowStartDate] = useState('')
  const [windowEndDate, setWindowEndDate] = useState('')
  const [windowActive, setWindowActive] = useState(true)

  // Limits form state
  const [maxPerUser, setMaxPerUser] = useState(100)
  const [minChars, setMinChars] = useState(400)
  const [maxChars, setMaxChars] = useState(600)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/message-window')
      if (res.ok) {
        const data = await res.json()
        if (data.window) {
          setWindow({
            ...data.window,
            startDate: new Date(data.window.startDate),
            endDate: new Date(data.window.endDate),
          })
          setWindowStartDate(format(new Date(data.window.startDate), 'yyyy-MM-dd'))
          setWindowEndDate(format(new Date(data.window.endDate), 'yyyy-MM-dd'))
          setWindowActive(data.window.isActive)
        }
        if (data.limits) {
          setLimits(data.limits)
          setMaxPerUser(data.limits.maxPerUser)
          setMinChars(data.limits.minCharacters)
          setMaxChars(data.limits.maxCharacters)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateWindow = async () => {
    if (!windowStartDate || !windowEndDate) {
      toast.error('Please fill in all date fields')
      return
    }

    setUpdating(true)
    try {
      const res = await fetch('/api/admin/message-window', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: windowStartDate,
          endDate: windowEndDate,
          isActive: windowActive,
        }),
      })

      if (res.ok) {
        toast.success('Message window updated')
        fetchSettings()
      } else {
        toast.error('Failed to update message window')
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateLimits = async () => {
    if (minChars >= maxChars) {
      toast.error('Min characters must be less than max characters')
      return
    }

    setUpdating(true)
    try {
      const res = await fetch('/api/admin/message-window', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxPerUser,
          minCharacters: minChars,
          maxCharacters: maxChars,
        }),
      })

      if (res.ok) {
        toast.success('Message limits updated')
        fetchSettings()
      } else {
        toast.error('Failed to update message limits')
      }
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Message Window Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Message Submission Window</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Set the dates when students can submit messages. Deactivate to pause submissions.
        </p>

        {window && (
          <div className="bg-zinc-950 rounded-lg p-4 mb-6 text-sm text-zinc-300">
            <p className="mb-1">
              <span className="text-zinc-500">Current Window:</span> {format(window.startDate, 'MMM dd, yyyy')} to{' '}
              {format(window.endDate, 'MMM dd, yyyy')}
            </p>
            <p>
              <span className="text-zinc-500">Status:</span>{' '}
              <span
                className={window.isActive ? 'text-emerald-400' : 'text-red-400'}
              >
                {window.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Start Date</label>
            <Input
              type="date"
              value={windowStartDate}
              onChange={(e) => setWindowStartDate(e.target.value)}
              className="bg-zinc-950 border-zinc-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">End Date</label>
            <Input
              type="date"
              value={windowEndDate}
              onChange={(e) => setWindowEndDate(e.target.value)}
              className="bg-zinc-950 border-zinc-700 text-white"
            />
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-zinc-950 rounded-lg">
            <label className="text-sm font-medium text-zinc-300">Is Active</label>
            <Switch checked={windowActive} onCheckedChange={setWindowActive} />
          </div>
        </div>

        <Button
          onClick={handleUpdateWindow}
          disabled={updating}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white"
        >
          {updating ? 'Updating...' : 'Update Window'}
        </Button>
      </div>

      {/* Message Limits Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Message Limits</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Configure character count and submission limits for student messages.
        </p>

        {limits && (
          <div className="bg-zinc-950 rounded-lg p-4 mb-6 text-sm text-zinc-300 space-y-1">
            <p>
              <span className="text-zinc-500">Max per user:</span> {limits.maxPerUser}
            </p>
            <p>
              <span className="text-zinc-500">Min characters:</span> {limits.minCharacters}
            </p>
            <p>
              <span className="text-zinc-500">Max characters:</span> {limits.maxCharacters}
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Max Messages Per User
            </label>
            <Input
              type="number"
              min="1"
              value={maxPerUser}
              onChange={(e) => setMaxPerUser(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-zinc-950 border-zinc-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Minimum Characters
            </label>
            <Input
              type="number"
              min="1"
              value={minChars}
              onChange={(e) => setMinChars(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-zinc-950 border-zinc-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Maximum Characters
            </label>
            <Input
              type="number"
              min="1"
              value={maxChars}
              onChange={(e) => setMaxChars(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-zinc-950 border-zinc-700 text-white"
            />
          </div>
        </div>

        <Button
          onClick={handleUpdateLimits}
          disabled={updating}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white"
        >
          {updating ? 'Updating...' : 'Update Limits'}
        </Button>
      </div>
    </div>
  )
}
