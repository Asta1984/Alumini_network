'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { ProtectedRoute } from '@/lib/protected-route'
import { MemoryWallSpinner } from '@/components/memories/memory-wall-spinner'
import { Button } from '@/components/ui/button'
import { AlumniCard } from '@/components/alumni/alumni-card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface SocialProfile {
  platform: 'GITHUB' | 'LINKEDIN' | 'TWITTER' | 'INSTAGRAM' | 'PORTFOLIO'
  profileUrl: string
}

interface Message {
  id: string
  text: string
}

interface AlumniProfile {
  userId: string
  fullName: string
  profilePictureUrl: string | null
  nickname: string | null
  bio: string | null
  socialProfiles: SocialProfile[]
  messages: Message[]
}

interface ApiResponse {
  alumni: AlumniProfile[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AlumniWallPage() {
  const { user } = useAuthStore()
  const [alumni, setAlumni] = useState<AlumniProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchAlumniWall = useCallback(async (page: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/alumni/wall?page=${page}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch alumni wall')
      }
      
      const data: ApiResponse = await response.json()
      setAlumni(data.alumni)
      setTotalPages(data.pagination.pages)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlumniWall(1)
  }, [fetchAlumniWall])

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <div>
                 <h1 className="text-3xl font-bold text-foreground">Alumni Memoir Wall</h1>
                 <p className="text-muted-foreground mt-2">
                  Memories and messages shared with our distinguished alumni
                 </p>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                 Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-96">
              <MemoryWallSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : alumni.length === 0 ? (
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No alumni memoirs yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alumni.map((alumnus) => (
                  <AlumniCard
                    key={alumnus.userId}
                    avatarUrl={alumnus.profilePictureUrl}
                    name={alumnus.fullName}
                    nickname={alumnus.nickname}
                    bio={alumnus.bio}
                    messages={alumnus.messages}
                    socialLinks={alumnus.socialProfiles}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => fetchAlumniWall(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <p className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => fetchAlumniWall(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}
