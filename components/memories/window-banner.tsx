'use client'

import { AlertCircle, Clock } from 'lucide-react'

interface WindowBannerProps {
  isActive: boolean
  status: 'open' | 'closed' | 'upcoming'
  startDate?: Date
  endDate?: Date
}

export function WindowBanner({ isActive, status, startDate, endDate }: WindowBannerProps) {
  if (!isActive && status === 'closed') {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <div>
          <p className="font-medium text-red-900">Message Window Closed</p>
          <p className="text-red-700 text-xs mt-0.5">
            The memory writing window is currently closed. Admin will notify when it opens.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'upcoming') {
    return (
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
        <Clock className="w-5 h-5 text-blue-600" />
        <div>
          <p className="font-medium text-blue-900">Window Opening Soon</p>
          <p className="text-blue-700 text-xs mt-0.5">
            Memories window opens on {startDate?.toLocaleDateString()}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
      <Clock className="w-5 h-5 text-green-600" />
      <div>
        <p className="font-medium text-green-900">Window Open</p>
        <p className="text-green-700 text-xs mt-0.5">
          Submit memories until {endDate?.toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
