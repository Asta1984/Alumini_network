'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAsyncSearch, useDebounce } from '@/lib/hooks'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface User {
  id: string
  fullName: string
  enrollmentNumber: string
  email: string
  mobile: string
  isProfileCompleted: boolean
  userType?: 'STUDENT' | 'ALUMNI'
  createdAt: string
}

interface Pagination {
  page: number
  total: number
  pages: number
}

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, pages: 1 })
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [loading, setLoading] = useState(false)
  const [tagLoading, setTagLoading] = useState<string | null>(null)
  const [tagSuccess, setTagSuccess] = useState<string | null>(null)
  const [tagError, setTagError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [graduationYearFilter, setGraduationYearFilter] = useState<string>('')
  const [students, setStudents] = useState<User[]>([])
  

  useEffect(() => {
    fetchUsers(1, debouncedSearch)
  }, [debouncedSearch])

  // Search function for useAsyncSearch
  const searchFn = useCallback(async (query: string) => {
    const params = new URLSearchParams({ page: '1' })
    if (query) params.set('q', query)
    const res = await fetch(`/api/admin/students?${params}`)
    if (!res.ok) throw new Error('Search failed')
    const data = await res.json()
    setStudents(data.students)
    setPagination(data.pagination)
    return data.students
  }, [])
  const { results, isLoading: searchLoading } = useAsyncSearch(searchQuery, searchFn, 400)
  
  const fetchUsers = async (page = 1, q = '', gradYear = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (q) params.set('q', q)
      if (gradYear) params.set('graduationYear', gradYear)
      const res = await fetch(`/api/admin/students?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.students)
        setPagination(data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }

  const tagAsAlumni = async (userId: string, currentType?: string) => {
    const newType = currentType === 'ALUMNI' ? 'STUDENT' : 'ALUMNI'
    setTagLoading(userId)
    setTagError(null)
    setTagSuccess(null)

    try {
      const res = await fetch(`/api/admin/users/${userId}/tag-alumni`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: newType }),
      })

      if (res.ok) {
        const data = await res.json()
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === userId ? { ...u, userType: newType as 'STUDENT' | 'ALUMNI' } : u
          )
        )
        setTagSuccess(`Tagged as ${newType}`)
        setTimeout(() => setTagSuccess(null), 3000)
      } else {
        const error = await res.json()
        setTagError(error.error || 'Failed to tag user')
      }
    } catch (err) {
      setTagError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setTagLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-zinc-500 text-sm mt-0.5">{pagination.total} total users</p>
      </div>

      {/* Alerts */}
      {tagSuccess && (
        <div className="mb-4 p-4 bg-emerald-900/20 border border-emerald-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-300">{tagSuccess}</span>
        </div>
      )}
      {tagError && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300">{tagError}</span>
        </div>
      )}

            {/* Search and Filters */}
            <div className="flex gap-2 mb-6 items-center flex-wrap">
              <Input
                placeholder="Search by name, enrollment, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 max-w-sm"
              />
              
              {/* Graduation Year Filter */}
              <select
                value={graduationYearFilter}
                onChange={(e) => {
                  setGraduationYearFilter(e.target.value)
                  fetchUsers(1, searchQuery, e.target.value)
                }}
                className="bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-sm max-w-xs"
              >
                <option value="">All Years</option>
                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={String(year)}>{year}</option>
                ))}
              </select>

              {searchLoading && <span className="text-xs text-zinc-500">Searching...</span>}
              {(searchQuery || graduationYearFilter) && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-zinc-500 hover:text-white"
                  onClick={() => { 
                    setSearchQuery('')
                    setGraduationYearFilter('')
                    fetchUsers(1, '', '')
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Users', value: pagination.total, color: 'text-white' },
          { label: 'Alumni', value: users.filter(u => u.userType === 'ALUMNI').length, color: 'text-amber-400' },
          { label: 'Students', value: users.filter(u => u.userType === 'STUDENT').length, color: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-300" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg">No users found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Name', 'Enrollment', 'Email', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-zinc-800/50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{user.fullName}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                    {user.enrollmentNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-zinc-400 text-xs">{user.email}</p>
                    <p className="text-zinc-500 text-xs">{user.mobile}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge 
                      variant={user.userType === 'ALUMNI' ? 'default' : 'secondary'}
                      className={user.userType === 'ALUMNI' ? 'bg-amber-600 text-white' : 'bg-zinc-700 text-zinc-300'}
                    >
                      {user.userType || 'STUDENT'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                      user.isProfileCompleted
                        ? 'border-emerald-700 text-emerald-400'
                        : 'border-zinc-700 text-zinc-500'
                    }`}>
                      {user.isProfileCompleted ? '✓ Complete' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => tagAsAlumni(user.id, user.userType)}
                      disabled={tagLoading === user.id}
                      className={`text-xs font-medium transition flex items-center gap-1 ${
                        tagLoading === user.id
                          ? 'text-zinc-500'
                          : user.userType === 'ALUMNI'
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-accent hover:text-accent/80'
                      } disabled:opacity-50`}
                    >
                      {tagLoading === user.id && <Loader2 className="w-3 h-3 animate-spin" />}
                      {tagLoading === user.id 
                        ? 'Tagging...' 
                        : user.userType === 'ALUMNI' 
                        ? 'Revert to Student' 
                        : 'Tag as Alumni'}
                    </button>
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
              onClick={() => fetchUsers(pagination.page - 1, debouncedSearch)}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchUsers(pagination.page + 1, debouncedSearch)}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
