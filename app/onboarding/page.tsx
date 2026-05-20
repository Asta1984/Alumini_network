'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { ProtectedRoute } from '@/lib/protected-route'

interface SocialProfile {
  platform: 'LINKEDIN' | 'INSTAGRAM' | 'GITHUB' | 'TWITTER'
  profileUrl: string
}

function OnboardingForm() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const [onboardingToken, setOnboardingToken] = useState<string | null>(null)
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear?.toString() || '')
  const [linkedin, setLinkedin] = useState('')
  const [instagram, setInstagram] = useState('')
  const [github, setGithub] = useState('')
  const [twitter, setTwitter] = useState('')

  // Extract token from URL on mount
  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      toast({
        title: 'Error',
        description: 'Invalid or missing onboarding link',
        variant: 'destructive',
      })
      router.push('/')
      return
    }
    setOnboardingToken(token)
  }, [searchParams, toast, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!onboardingToken) return
    setIsLoading(true)

    try {
      if (!fullName.trim()) {
        toast({ title: 'Error', description: 'Full name is required', variant: 'destructive' })
        setIsLoading(false)
        return
      }

      if (!linkedin.trim()) {
        toast({ title: 'Error', description: 'LinkedIn profile is required', variant: 'destructive' })
        setIsLoading(false)
        return
      }

      const socialProfiles: SocialProfile[] = [
        { platform: 'LINKEDIN', profileUrl: linkedin.trim() },
      ]

      if (instagram.trim()) socialProfiles.push({ platform: 'INSTAGRAM', profileUrl: instagram.trim() })
      if (github.trim()) socialProfiles.push({ platform: 'GITHUB', profileUrl: github.trim() })
      if (twitter.trim()) socialProfiles.push({ platform: 'TWITTER', profileUrl: twitter.trim() })

      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingToken,
          fullName: fullName.trim(),
          nickname: nickname.trim() || undefined,
          bio: bio.trim() || undefined,
          graduationYear: graduationYear.trim() ? parseInt(graduationYear.trim(), 10) : undefined,
          socialProfiles,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to complete profile')
      }

      // Refresh auth store with updated user data
      const { hydrate } = useAuthStore.getState()
      await hydrate()

      toast({ title: 'Success', description: 'Profile completed successfully' })
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
        <Input
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">This is how your peers will see you</p>
      </div>

      {/* Nickname */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Nickname (Optional)</label>
        <Input
          type="text"
          placeholder="e.g., Salil, SM, etc."
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Bio (Optional)</label>
        <Textarea
          placeholder="Tell us about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={isLoading}
          className="resize-none h-24"
        />
        <p className="text-xs text-muted-foreground mt-1">Share a bit about yourself (max 500 characters)</p>
      </div>

      {/* Graduation Year */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Graduation Year (Optional)</label>
        <Input
          type="number"
          placeholder="e.g., 2020"
          value={graduationYear}
          onChange={(e) => setGraduationYear(e.target.value)}
          disabled={isLoading}
          min="1990"
          max={new Date().getFullYear() + 10}
        />
        <p className="text-xs text-muted-foreground mt-1">Your expected or actual graduation year</p>
      </div>

      {/* Social Profiles */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Social Profiles</h3>
        <p className="text-sm text-muted-foreground mb-6">Connect your social profiles to help peers find you</p>

        {/* LinkedIn */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">LinkedIn Profile URL *</label>
          <Input
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">Required - Must contain linkedin.com/in/</p>
        </div>

        {/* Instagram */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Instagram (Optional)</label>
          <Input
            type="url"
            placeholder="https://instagram.com/yourprofile"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* GitHub */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">GitHub (Optional)</label>
          <Input
            type="url"
            placeholder="https://github.com/yourprofile"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Twitter/Portfolio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Twitter / Portfolio (Optional)</label>
          <Input
            type="url"
            placeholder="https://twitter.com/yourprofile or portfolio link"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="border-t border-border pt-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? 'Completing Profile...' : 'Complete Profile & Continue'}
        </Button>
      </div>
    </form>
  )
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome to Surabhi Alumni Memory Book</p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <Suspense fallback={
            <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
              Loading...
            </div>
          }>
            <OnboardingForm />
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  )
}
