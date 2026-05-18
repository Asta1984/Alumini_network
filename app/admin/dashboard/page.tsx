// app/admin/dashboard/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/store/admin.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessagesTab } from '@/components/admin/messages-tab'
import { SummariesTab } from '@/components/admin/summaries-tab'
import { SettingsTab } from '@/components/admin/settings-tab'
import { UsersTab } from '@/components/admin/user-tab'
import { AdminSidebar } from '@/components/admin/sidebar'

interface Student {
  id: string
  fullName: string
  enrollmentNumber: string
  email: string
  mobile: string
  isProfileCompleted: boolean
  hasOnboardingLink: boolean
  linkUsed: boolean
  messagesReceived: number
  summaryApproved: boolean
}

interface Pagination {
  page: number
  total: number
  pages: number
}

type Tab = 'students' | 'users' | 'messages' | 'summaries' | 'settings' | 'import'

export default function AdminDashboard() {
  const router = useRouter()
  const { admin, hydrate, isAuthenticated, isLoading, logout } = useAdminStore()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState(240) // Default to 15rem = 240px

  const [tab, setTab] = useState<Tab>('students')
  const [students, setStudents] = useState<Student[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, pages: 1 })
  const [search, setSearch] = useState('')
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [linkLoading, setLinkLoading] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({})
  const [bulkLinkLoading, setBulkLinkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState<string | null>(null)

  // CSV Import
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvError, setCsvError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { hydrate() }, [hydrate])
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/admin/login')
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) fetchStudents(1, search)
  }, [isAuthenticated])

  // Track sidebar width changes
  useEffect(() => {
    const sidebar = document.querySelector('.sidebar') as HTMLElement
    if (!sidebar) return

    const resizeObserver = new ResizeObserver(() => {
      setSidebarWidth(sidebar.offsetWidth)
    })
    resizeObserver.observe(sidebar)

    return () => resizeObserver.disconnect()
  }, [])

  const fetchStudents = async (page = 1, q = '') => {
    setStudentsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (q) params.set('q', q)
      const res = await fetch(`/api/admin/students?${params}`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students)
        setPagination(data.pagination)
      }
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStudents(1, search)
  }

  const generateLink = async (studentId: string) => {
    setLinkLoading(studentId)
    try {
      const res = await fetch('/api/admin/onboarding-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentId }),
      })
      const data = await res.json()
      if (res.ok) {
        setGeneratedLinks(prev => ({ ...prev, [studentId]: data.url }))
        fetchStudents(pagination.page, search)
      }
    } finally {
      setLinkLoading(null)
    }
  }

  const generateAllLinks = async () => {
    setBulkLinkLoading(true)
    setBulkResult(null)
    try {
      const res = await fetch('/api/admin/onboarding-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      const data = await res.json()
      setBulkResult(data.message)
      fetchStudents(pagination.page, search)
    } finally {
      setBulkLinkLoading(false)
    }
  }

  const copyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── CSV Parsing ────────────────────────────────────────────────────────────
const parseCSV = (text: string) => {
  const lines = text
    .replace(/^\uFEFF/, '')      // strip Excel BOM
    .trim()
    .split('\n')
    .map(l => l.replace(/\r$/, ''))  // strip \r from Windows line endings

  if (lines.length < 2) {
    setCsvError('CSV must have a header row and at least one data row')
    return
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
  const required = ['full_name', 'enrollment_number', 'email', 'mobile']
  const missing = required.filter(r => !headers.includes(r))

  if (missing.length > 0) {
    setCsvError(`Missing columns: ${missing.join(', ')}. Required: full_name, enrollment_number, email, mobile`)
    return
  }

  const rows = lines.slice(1)
    .map(line => {
      // handle quoted fields containing commas
      const values: string[] = []
      let current = ''
      let inQuotes = false
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes }
        else if (char === ',' && !inQuotes) { values.push(current.trim()); current = '' }
        else { current += char }
      }
      values.push(current.trim())

      if (values.length !== headers.length) return null  // skip malformed rows

      return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']))
    })
    .filter((r): r is Record<string, string> => r !== null && !!r.enrollment_number)

  if (rows.length === 0) {
    setCsvError('No valid rows found after parsing')
    return
  }

  setCsvData(rows.map(r => ({
    fullName: r.full_name,
    enrollmentNumber: r.enrollment_number,
    email: r.email,
    mobile: r.mobile,
  })))
  setCsvError('')
}
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => parseCSV(ev.target?.result as string)
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (csvData.length === 0) return
    setImporting(true)
    setImportResult(null)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: csvData }),
      })
      const data = await res.json()
      setImportResult(data.message)
      setCsvData([])
      if (fileRef.current) fileRef.current.value = ''
      fetchStudents(1, '')
      setTab('students')
    } finally {
      setImporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    )
  }

  const statusColor = (s: Student) => {
    if (s.summaryApproved) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (s.isProfileCompleted) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    if (s.linkUsed) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    if (s.hasOnboardingLink) return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    return 'bg-zinc-800 text-zinc-500 border-zinc-700'
  }

  const statusLabel = (s: Student) => {
    if (s.summaryApproved) return 'Summary Published'
    if (s.isProfileCompleted) return 'Profile Done'
    if (s.linkUsed) return 'Link Clicked'
    if (s.hasOnboardingLink) return 'Link Sent'
    return 'No Link'
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <AdminSidebar activeTab={tab} onTabChange={setTab} />

      {/* Main */}
      <div className="p-8" style={{ marginLeft: `${sidebarWidth}px`, transition: 'margin-left 0.2s ease-out' }}>

        {/* ── Students Tab ──────────────────────────────────────────────────── */}
        {tab === 'students' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Students</h1>
                <p className="text-zinc-500 text-sm mt-0.5">{pagination.total} total</p>
              </div>
              <div className="flex items-center gap-3">
                {bulkResult && (
                  <span className="text-sm text-emerald-400">{bulkResult}</span>
                )}
                <Button
                  onClick={generateAllLinks}
                  disabled={bulkLinkLoading}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-sm"
                >
                  {bulkLinkLoading ? 'Generating...' : 'Generate All Links'}
                </Button>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <Input
                placeholder="Search by name, enrollment, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 max-w-sm"
              />
              <Button type="submit" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Search
              </Button>
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-zinc-500 hover:text-white"
                  onClick={() => { setSearch(''); fetchStudents(1, '') }}
                >
                  Clear
                </Button>
              )}
            </form>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total', value: pagination.total, color: 'text-white' },
                { label: 'Profile Done', value: students.filter(s => s.isProfileCompleted).length, color: 'text-blue-400' },
                { label: 'Msgs Received', value: students.reduce((a, s) => a + s.messagesReceived, 0), color: 'text-amber-400' },
                { label: 'Published', value: students.filter(s => s.summaryApproved).length, color: 'text-emerald-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-500 text-xs">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {studentsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <p className="text-lg">No students found</p>
                  <p className="text-sm mt-1">Import students using the CSV tab</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['Student', 'Enrollment', 'Contact', 'Messages', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-zinc-800/50 transition">
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{student.fullName}</p>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                          {student.enrollmentNumber}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-zinc-400 text-xs">{student.email}</p>
                          <p className="text-zinc-500 text-xs">{student.mobile}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-semibold ${student.messagesReceived > 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
                            {student.messagesReceived}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusColor(student)}`}>
                            {statusLabel(student)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {generatedLinks[student.id] ? (
                              <button
                                onClick={() => copyLink(student.id, generatedLinks[student.id])}
                                className="text-xs text-emerald-400 hover:text-emerald-300 transition font-medium"
                              >
                                {copiedId === student.id ? '✓ Copied!' : ' Copy Link'}
                              </button>
                            ) : (
                              <button
                                onClick={() => generateLink(student.id)}
                                disabled={linkLoading === student.id}
                                className="text-xs text-violet-400 hover:text-violet-300 transition disabled:opacity-50"
                              >
                                {linkLoading === student.id ? 'Generating...' : student.hasOnboardingLink ? ' Regenerate' : ' Generate Link'}
                              </button>
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
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchStudents(pagination.page - 1, search)}
                    className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => fetchStudents(pagination.page + 1, search)}
                    className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Users/Alumni Tags Tab ──────────────────────────────────────────── */}
        {tab === 'users' && (
          <UsersTab />
        )}

        {/* ── Messages Tab ──────────────────────────────────────────────────── */}
        {tab === 'messages' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Message Review</h1>
              <p className="text-zinc-500 text-sm mt-0.5">View and moderate messages received by students</p>
            </div>
            <MessagesTab students={students} />
          </div>
        )}

        {/* ── Summaries Tab ─────────────────────────────────────────────────── */}
        {tab === 'summaries' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Summary Approval</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Review and approve AI-generated memory summaries</p>
            </div>
            <SummariesTab />
          </div>
        )}

        {/* ── Settings Tab ──────────────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Manage message windows and submission limits</p>
            </div>
            <SettingsTab />
          </div>
        )}

        {/* ── Import Tab ────────────────────────────────────────────────────── */}
        {tab === 'import' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-2">Import Students</h1>
            <p className="text-zinc-500 text-sm mb-8">
              Upload a CSV file to bulk-import students. Duplicates (by enrollment number) are skipped.
            </p>

            {/* Format guide */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Required CSV Format</p>
              <div className="bg-zinc-950 rounded-lg p-3 font-mono text-xs text-zinc-400 overflow-x-auto">
                <p className="text-violet-400">full_name,enrollment_number,email,mobile</p>
                <p>Rahul Sharma,23BCE001,rahul@college.edu,9876543210</p>
                <p>Priya Patel,23BCE002,priya@college.edu,9876543211</p>
              </div>
            </div>

            {/* Upload area */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 rounded-xl p-10 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition group mb-4"
            >
              <div className="text-4xl mb-3">📂</div>
              <p className="text-zinc-300 font-medium group-hover:text-white transition">
                Click to upload CSV
              </p>
              <p className="text-zinc-600 text-sm mt-1">.csv files only</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {csvError && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {csvError}
              </div>
            )}

            {importResult && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                {importResult}
              </div>
            )}

            {csvData.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-4">
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <p className="text-sm font-medium">{csvData.length} students ready to import</p>
                  <button
                    onClick={() => { setCsvData([]); if (fileRef.current) fileRef.current.value = '' }}
                    className="text-xs text-zinc-500 hover:text-white transition"
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-zinc-900">
                      <tr className="border-b border-zinc-800">
                        {['Name', 'Enrollment', 'Email', 'Mobile'].map(h => (
                          <th key={h} className="text-left px-4 py-2 text-zinc-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {csvData.map((s, i) => (
                        <tr key={i} className="hover:bg-zinc-800/50">
                          <td className="px-4 py-2 text-white">{s.fullName}</td>
                          <td className="px-4 py-2 text-zinc-400 font-mono">{s.enrollmentNumber}</td>
                          <td className="px-4 py-2 text-zinc-400">{s.email}</td>
                          <td className="px-4 py-2 text-zinc-400">{s.mobile}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={csvData.length === 0 || importing}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40"
            >
              {importing ? 'Importing...' : `Import ${csvData.length} Students`}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

