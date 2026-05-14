'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { ProtectedRoute } from '@/lib/protected-route'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAsyncSearch } from '@/lib/hooks/useDebounce'
import Link from 'next/link'

interface UserResult {
  userId: string
  fullName: string
  enrollmentNumber: string
  profilePictureUrl: string | null
  nickname: string | null
  linkedInUrl: string | null
}

interface CurrentUserProfile extends UserResult {
  bio?: string | null
  socialProfiles?: Array<{
    platform: 'LINKEDIN' | 'INSTAGRAM' | 'GITHUB' | 'TWITTER' | 'PORTFOLIO'
    profileUrl: string
  }>
}

export default function SearchPage() {
  const { user: currentUser } = useAuthStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUserProfile, setCurrentUserProfile] = useState<CurrentUserProfile | null>(null)
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true)

  // Fetch current user's profile
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!currentUser?.userId) return

      try {
        setLoadingCurrentUser(true)
        const response = await fetch(`/api/users/${currentUser.userId}`)
        if (response.ok) {
          const data = await response.json()
          setCurrentUserProfile(data)
        }
      } catch (err) {
        console.error('Failed to fetch current user profile:', err)
      } finally {
        setLoadingCurrentUser(false)
      }
    }

    fetchCurrentUserProfile()
  }, [currentUser?.userId])

  // Memoize the search function to prevent infinite loops
  const searchFn = useCallback(async (query: string): Promise<UserResult[]> => {
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error('Search failed')
    }
    const data = await response.json()
    return data.users || []
  }, [])

  // Use async search hook with 400ms debounce
  const { results, isLoading, error, hasSearched } = useAsyncSearch(
    searchQuery,
    searchFn,
    400,
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-foreground hover:bg-secondary mb-4">
                ← Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Find Alumni</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Search and connect with your batchmates
            </p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Discover Alumni</h2>
              <p className="text-muted-foreground">
                Search by name, enrollment number, or nickname to find your batchmates
              </p>
            </div>

            {/* Current User Profile Card */}
            {loadingCurrentUser ? (
              <div className="mb-8 bg-card rounded-lg border border-primary/20 shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-secondary rounded mb-2"></div>
              </div>
            ) : (
              currentUserProfile && (
                <div className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20 shadow-sm p-6">
                  <div className="flex items-center justify-between gap-6">
                    {/* Left: Avatar and Info */}
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 relative">
                        <div className="w-14 h-14 bg-linear-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
                          {currentUserProfile.profilePictureUrl ? (
                            <img
                              src={currentUserProfile.profilePictureUrl}
                              alt={currentUserProfile.fullName}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {currentUserProfile.fullName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                          You
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{currentUserProfile.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {currentUserProfile.enrollmentNumber}
                        </p>
                        {currentUserProfile.nickname && (
                          <p className="text-sm text-primary font-medium">{currentUserProfile.nickname}</p>
                        )}
                      </div>
                    </div>

                    {/* Right: View Button */}
                    <Button
                      className="bg-primary hover:bg-primary/90 shrink-0"
                      onClick={() => router.push(`/profile/${currentUserProfile.userId}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              )
            )}

            {/* Search Input */}
            <div className="mb-8">
              <Input
                type="text"
                placeholder="Search by name, enrollment, or nickname..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Results update automatically as you type
              </p>
            </div>

            {/* Results Section */}
            <div>
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {!isLoading && hasSearched && results.length === 0 && (
                <div className="bg-card rounded-lg border border-border shadow-sm p-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    No alumni found matching &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Try searching with a different name or enrollment number
                  </p>
                </div>
              )}

              {!isLoading && !hasSearched && searchQuery === '' && (
                <div className="bg-secondary/20 rounded-lg border border-border shadow-sm p-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    Start typing to search for alumni
                  </p>
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Found {results.length} alumni
                  </p>
                  {results.map((result) => {
                    const isCurrentUser = result.userId === currentUser?.userId
                    return (
                      <div
                        key={result.userId}
                        className={`rounded-lg border shadow-sm p-4 transition cursor-pointer ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/40 hover:border-primary hover:shadow-md'
                            : 'bg-card border-border hover:border-primary hover:shadow-md'
                        }`}
                        onClick={() => router.push(`/profile/${result.userId}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            router.push(`/profile/${result.userId}`)
                          }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="shrink-0 relative">
                            <div className="w-12 h-12 bg-linear-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
                              {result.profilePictureUrl ? (
                                <img
                                  src={result.profilePictureUrl}
                                  alt={result.fullName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold">
                                  {result.fullName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            {isCurrentUser && (
                              <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                You
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{result.fullName}</p>
                              {isCurrentUser && (
                                <span className="text-xs bg-primary/20 text-primary font-medium px-2 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {result.enrollmentNumber}
                            </p>
                            {result.nickname && (
                              <p className="text-sm text-primary font-medium">{result.nickname}</p>
                            )}
                          </div>

                          {/* LinkedIn Link */}
                          {result.linkedInUrl && (
                            <a
                              href={result.linkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-sm font-medium">LinkedIn</span>
                            </a>
                          )}

                          {/* Visit Profile Button */}
                          <Button
                            variant="outline"
                            className="border-border text-foreground hover:bg-secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/profile/${result.userId}`)
                            }}
                          >
                            Visit
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
