// app/login/page.tsx

'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth.store'
import Image from 'next/image'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const onboardingToken = searchParams.get('token')

  const {
    loginStep,
    maskedEmail,
    requestOtp,
    verifyOtp,
    resetLoginFlow,
  } = useAuthStore()

  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!identifier.trim()) {
      setError('Email or mobile number is required')
      return
    }

    setLoading(true)

    try {
      await requestOtp(identifier.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    setLoading(true)

    try {
      await verifyOtp(otp.trim())

      await new Promise((resolve) => setTimeout(resolve, 150))

      const { user } = useAuthStore.getState()

      if (onboardingToken) {
        router.push(`/onboarding?token=${encodeURIComponent(onboardingToken)}`)
        return
      }

      if (user && !user.isProfileCompleted) {
        router.push('/onboarding')
      } else if (user && user.isProfileCompleted) {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border border-border p-8">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-amber-100-500/10 border-amber-200-500/20 mb-4">
            <Image src="/icon.png" alt="Surabhi Icon" width={150} height={100} className='bg-amber-50 rounded-sm border-t-2 border-r-2 p-1' />
            </div>
          </div>

          {loginStep === 'identifier' ? (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Sign in
              </h2>

              <p className="text-sm text-muted-foreground mb-6">
                Enter your registered email or mobile number
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email or Mobile
                  </label>

                  <Input
                    type="text"
                    placeholder="you@institution.edu or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <Button
                  variant="secondary"
                  disabled={loading}
                  className="w-full border mt-2"                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Enter OTP
              </h2>

              <p className="text-sm text-muted-foreground mb-6">
                A 6-digit OTP was sent to{' '}
                <span className="font-medium text-foreground">
                  {maskedEmail}
                </span>
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    OTP
                  </label>

                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="483920"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ''))
                    }
                    disabled={loading}
                    autoFocus
                    className="tracking-widest text-center text-xl"
                  />
                </div>

                <Button
                  variant="secondary"
                  disabled={loading}
                  className="w-full border mt-2"  >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </form>

              <button
                onClick={() => {
                  resetLoginFlow()
                  setError('')
                  setOtp('')
                }}
                className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition text-center"
              >
                ← Use a different email or mobile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}