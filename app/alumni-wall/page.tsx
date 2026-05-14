'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { ProtectedRoute } from '@/lib/protected-route'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
  socialProfiles: Array<{
    platform: string
    profileUrl: string
  }>
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
              <p className="text-muted-foreground">Loading alumni memoirs...</p>
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
                  <Card key={alumnus.userId} className="overflow-hidden">
                    {/* Alumni Profile Header */}
                    <CardHeader className="bg-linear-to-r from-primary/5 to-primary/10">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="shrink-0">
                          <div className="w-16 h-16 bg-linear-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
                            {alumnus.profilePictureUrl ? (
                              <img
                                src={alumnus.profilePictureUrl}
                                alt={alumnus.fullName}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-lg font-bold">
                                {alumnus.fullName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                          <CardTitle className="text-2xl text-foreground">
                            {alumnus.fullName}
                          </CardTitle>
                          {alumnus.nickname && (
                            <p className="text-primary font-medium text-sm mt-1">
                              {alumnus.nickname}
                            </p>
                          )}
                          <p className="text-muted-foreground text-sm mt-1">
                            {alumnus.fullName}
                          </p>
                        {alumnus.bio && (
                          <p className="text-foreground text-sm mt-2 line-clamp-2">
                            {alumnus.bio}
                          </p>
                        )}
                        
                        {/* Social Links */}
                        {alumnus.socialProfiles.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {alumnus.socialProfiles.map((social) => (
                              <a
                                key={social.platform}
                                href={social.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                              >
                                {social.platform}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="pt-6">
                      {alumnus.messages.length > 0 ? (
                        <ul className="space-y-3">
                          {alumnus.messages.map((message) => (
                            <li key={message.id} className="flex gap-3 text-foreground text-sm">
                              <span className="text-primary font-bold">•</span>
                              <span className="whitespace-pre-wrap">{message.text}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-sm">No messages yet</p>
                      )}
                    </CardContent>
                  </Card>
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
