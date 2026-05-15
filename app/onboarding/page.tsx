'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

interface SocialProfile {
  platform: 'LINKEDIN' | 'INSTAGRAM' | 'GITHUB' | 'TWITTER' | 'PORTFOLIO'
  profileUrl: string
}

const SOCIAL_PLATFORMS = [
  { id: 'LINKEDIN', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourprofile', required: true },
  { id: 'INSTAGRAM', label: 'Instagram', placeholder: 'https://instagram.com/yourprofile', required: false },
  { id: 'GITHUB', label: 'GitHub', placeholder: 'https://github.com/yourprofile', required: false },
  { id: 'TWITTER', label: 'Twitter', placeholder: 'https://twitter.com/yourprofile', required: false },
  { id: 'PORTFOLIO', label: 'Portfolio', placeholder: 'https://yourportfolio.com', required: false },
] as const

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [onboardingToken, setOnboardingToken] = useState<string | null>(null)

  // Editable fields
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [socialProfiles, setSocialProfiles] = useState<Record<string, string>>({
    LINKEDIN: '',
    INSTAGRAM: '',
    GITHUB: '',
    TWITTER: '',
    PORTFOLIO: '',
  })

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

  const handleSocialProfileChange = (platform: string, value: string) => {
    setSocialProfiles((prev) => ({
      ...prev,
      [platform]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onboardingToken) return

    setIsSubmitting(true)

    try {
      // Validate required LinkedIn
      if (!socialProfiles.LINKEDIN.trim()) {
        toast({
          title: 'Error',
          description: 'LinkedIn profile is required',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      // Build social profiles array
      const profiles: SocialProfile[] = []
      SOCIAL_PLATFORMS.forEach(({ id }) => {
        if (socialProfiles[id]?.trim()) {
          profiles.push({
            platform: id as SocialProfile['platform'],
            profileUrl: socialProfiles[id].trim(),
          })
        }
      })

      // Submit with onboarding token in header (takes precedence over stored browser token)
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${onboardingToken}`,
        },
        body: JSON.stringify({
          nickname: nickname.trim() || undefined,
          bio: bio.trim() || undefined,
          socialProfiles: profiles,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to complete profile')
      }

      toast({
        title: 'Success',
        description: 'Welcome to Surabhi Alumni Memory Book!',
      })
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!onboardingToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Welcome to Surabhi Alumni</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete your profile to get started</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-8">
          
          {/* Optional Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Additional Information</h3>
            <p className="text-sm text-muted-foreground mb-4">Help us get to know you better</p>

            <div className="space-y-4">
              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nickname (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g., Alex, AJ, Salil"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">How your batchmates can call you</p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bio (Optional)</label>
                <Textarea
                  placeholder="Share a bit about yourself, your interests, or career goals..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={isSubmitting}
                  className="resize-none h-20"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/500 characters</p>
              </div>
            </div>
          </div>

          {/* Social Profiles Section */}
          <div className="border-t border-border pt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Connect Your Profiles</h3>
            <p className="text-sm text-muted-foreground mb-6">Help peers find you on social platforms</p>

            <div className="space-y-4">
              {SOCIAL_PLATFORMS.map(({ id, label, placeholder, required }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {label}
                    {required ? ' *' : ' (Optional)'}
                  </label>
                  <Input
                    type="url"
                    placeholder={placeholder}
                    value={socialProfiles[id] || ''}
                    onChange={(e) => handleSocialProfileChange(id, e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-border pt-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
            >
              {isSubmitting ? 'Completing Profile...' : 'Complete Profile & Continue'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              By completing your profile, you agree to share this information with your batchmates
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}
