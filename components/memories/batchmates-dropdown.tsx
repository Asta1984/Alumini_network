'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, X } from 'lucide-react'
import { useAsyncSearch } from '@/lib/hooks/useDebounce'

interface Student {
  id: string
  name: string
  enrollment: string
}

interface BatchmatesDropdownProps {
  onSelect: (studentId: string) => void
  selectedId?: string
  disabled?: boolean
}

export function BatchmatesDropdown({ onSelect, selectedId, disabled }: BatchmatesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Memoize the search function to prevent infinite loops
  const searchFn = useCallback(async (query: string): Promise<Student[]> => {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
    if (res.ok) {
      const data = await res.json()
      return (data.users || []).map((u: any) => ({
        id: u.userId,
        name: u.fullName,
        enrollment: u.enrollmentNumber,
      }))
    }
    return []
  }, [])

  // Use async search hook with 400ms debounce
  const { results, isLoading } = useAsyncSearch(search, searchFn, 400)

  const handleSelect = (student: Student) => {
    setSelectedStudent(student)
    onSelect(student.id)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = () => {
    setSelectedStudent(null)
    setSearch('')
    onSelect('')
  }

  return (
    <div className="relative">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Write to a Batchmate</label>
        
        {selectedStudent ? (
          <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-secondary">
            <span className="flex-1 text-sm text-foreground">{selectedStudent.name}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="h-5 w-5 p-0"
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a batchmate..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
              className="pl-9"
            />
          </div>
        )}

        {isOpen && !selectedStudent && search && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No batchmates found
              </div>
            ) : (
              <div className="divide-y divide-border">
                {results.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelect(student)}
                    className="w-full px-4 py-3 text-left hover:bg-secondary transition text-foreground"
                  >
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.enrollment}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
