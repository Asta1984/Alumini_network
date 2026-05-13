'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageModal } from './message-modal'
import { format } from 'date-fns'

interface Message {
  id: string
  senderName: string
  senderEnrollment: string
  senderId: string
  text: string
  characterCount: number
  createdAt: Date
}

interface Student {
  id: string
  fullName: string
  enrollmentNumber: string
  messagesReceived: number
}

interface MessageTabProps {
  students: Student[]
}

export function MessagesTab({ students }: MessageTabProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageLoading, setMessageLoading] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })

  const fetchMessages = async (studentId: string, page = 1) => {
    setMessageLoading(true)
    try {
      const res = await fetch(`/api/admin/messages?studentId=${studentId}&page=${page}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        setPagination(data.pagination)
      }
    } finally {
      setMessageLoading(false)
    }
  }

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
    setMessages([])
    setPagination({ page: 1, total: 0, pages: 1 })
    fetchMessages(student.id, 1)
  }

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message)
    setShowModal(true)
  }

  return (
    <div className="flex gap-6">
      {/* Students List */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-3">Select Student</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            {students.length === 0 ? (
              <div className="p-4 text-center text-zinc-500">
                <p>No students found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-zinc-800">
                  {students.map(student => (
                    <tr
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className={`cursor-pointer hover:bg-zinc-800/50 transition ${
                        selectedStudent?.id === student.id ? 'bg-violet-600/20 border-l-2 border-l-violet-600' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{student.fullName}</p>
                        <p className="text-xs text-zinc-500">{student.enrollmentNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {student.messagesReceived > 0 && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                            {student.messagesReceived}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Messages Panel */}
      {selectedStudent ? (
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-1">
              Messages for {selectedStudent.fullName}
            </h2>
            <p className="text-sm text-zinc-500">
              {selectedStudent.messagesReceived} total
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {messageLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="p-6 text-center text-zinc-500">
                <p>No messages received</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <div className="divide-y divide-zinc-800">
                  {messages.map(msg => (
                    <div key={msg.id} className="p-4 hover:bg-zinc-800/30 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            {msg.senderName}
                          </p>
                          <p className="text-xs text-zinc-500 mb-2">
                            {msg.senderEnrollment} • {format(new Date(msg.createdAt), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-zinc-300 line-clamp-2">
                            {msg.text}
                          </p>
                          <p className="text-xs text-zinc-600 mt-1">
                            {msg.characterCount} chars
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewMessage(msg)}
                          className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 whitespace-nowrap shrink-0"
                        >
                          View Full
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                  onClick={() => fetchMessages(selectedStudent.id, pagination.page - 1)}
                  className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchMessages(selectedStudent.id, pagination.page + 1)}
                  className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-center">
          <p className="text-zinc-500">Select a student to view messages</p>
        </div>
      )}

      {/* Message Modal */}
      <MessageModal
        isOpen={showModal}
        onOpenChange={setShowModal}
        message={selectedMessage}
      />
    </div>
  )
}
