'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SummaryModal } from './summary-modal'
import { StatusBadge } from './status-badge'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Summary {
  id: string
  userId: string
  studentName: string
  enrollmentNumber: string
  text: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  approvedAt: Date | null
  approvedBy?: string
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export function SummariesTab() {
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [summariesLoading, setSummariesLoading] = useState(false)
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })
  const [approving, setApproving] = useState<string | null>(null)

  useEffect(() => {
    fetchSummaries(1, statusFilter)
  }, [statusFilter])

  const fetchSummaries = async (page = 1, status = statusFilter) => {
    setSummariesLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), status })
      const res = await fetch(`/api/admin/summaries?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSummaries(data.summaries.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          approvedAt: s.approvedAt ? new Date(s.approvedAt) : null,
        })))
        setPagination(data.pagination)
      }
    } finally {
      setSummariesLoading(false)
    }
  }

  const handleViewSummary = (summary: Summary) => {
    setSelectedSummary(summary)
    setShowModal(true)
  }

  const handleApproveSummary = async (summaryId: string) => {
    setApproving(summaryId)
    try {
      const res = await fetch('/api/admin/summaries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryId, isApproved: true }),
      })
      if (res.ok) {
        toast.success('Summary approved')
        fetchSummaries(pagination.page, statusFilter)
      } else {
        toast.error('Failed to approve summary')
      }
    } finally {
      setApproving(null)
    }
  }

  const handleRejectSummary = async (summaryId: string) => {
    setApproving(summaryId)
    try {
      const res = await fetch('/api/admin/summaries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryId, isApproved: false }),
      })
      if (res.ok) {
        toast.success('Summary rejected')
        fetchSummaries(pagination.page, statusFilter)
      } else {
        toast.error('Failed to reject summary')
      }
    } finally {
      setApproving(null)
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map(status => (
          <Button
            key={status}
            onClick={() => setStatusFilter(status)}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            className={
              statusFilter === status
                ? 'bg-accent hover:bg-accent/80 text-white'
                : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Summaries Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {summariesLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-300" />
          </div>
        ) : summaries.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg">No summaries found</p>
            <p className="text-sm mt-1">
              {statusFilter === 'pending'
                ? 'All pending summaries have been processed'
                : 'No summaries in this category'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Student', 'Enrollment', 'Status', 'Generated', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {summaries.map(summary => (
                <tr key={summary.id} className="hover:bg-zinc-800/50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{summary.studentName}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                    {summary.enrollmentNumber}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={summary.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {format(new Date(summary.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSummary(summary)}
                        className="text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                      >
                        View
                      </Button>
                      {summary.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveSummary(summary.id)}
                            disabled={approving === summary.id}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            {approving === summary.id ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectSummary(summary.id)}
                            disabled={approving === summary.id}
                            className="text-xs border-red-700/50 text-red-400 hover:bg-red-500/10"
                          >
                            {approving === summary.id ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-zinc-500">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => fetchSummaries(pagination.page - 1, statusFilter)}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchSummaries(pagination.page + 1, statusFilter)}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      <SummaryModal
        isOpen={showModal}
        onOpenChange={setShowModal}
        summary={selectedSummary}
        onApprove={handleApproveSummary}
        onReject={handleRejectSummary}
      />
    </div>
  )
}
