'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, X } from 'lucide-react'

interface Student {
  id: string
  name: string
  enrollment: string
  label: string
}

interface BatchmatesDropdownProps {
  onSelect: (studentId: string) => void
  selectedId?: string
  disabled?: boolean
}

export function BatchmatesDropdown({ onSelect, selectedId, disabled }: BatchmatesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    const loadStudents = async () => {
      if (!search.trim()) {
        setStudents([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/students/list?search=${encodeURIComponent(search)}`)
        if (res.ok) {
          const data = await res.json()
          setStudents(data.students)
        }
      } catch (error) {
        console.error('Failed to load students:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadStudents, 300)
    return () => clearTimeout(timer)
  }, [search])

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
            <span className="flex-1 text-sm text-foreground">{selectedStudent.label}</span>
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
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or enrollment..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if (!isOpen) setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
              className="pl-9"
            />
          </div>
        )}

        {isOpen && !selectedStudent && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading batchmates...
              </div>
            ) : students.length === 0 && search ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No batchmates found
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelect(student)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition text-foreground"
                  >
                    <div className="font-medium">{student.name}</div>
                    <div className="text-xs text-muted-foreground">{student.enrollment}</div>
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
