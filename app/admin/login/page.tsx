// app/admin/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/store/admin.store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, hydrate, isAuthenticated, isLoading } = useAdminStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { hydrate() }, [hydrate])

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.push('/admin/dashboard')
  }, [isLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Both fields are required'); return }
    setLoading(true)
    try {
      await login(email, password)
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size:48px_48px" />

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center bg-amber-100-500/10 border-amber-200-500/20 mb-4">
            <Image src="/icon.png" alt="Surabhi Icon" width={150} height={100} className='bg-amber-50 rounded-sm border-t-2 border-r-2 p-1' />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="text-zinc-500 text-sm mt-1">Surabhi Alumni Memory Book</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <Input
                type="email"
                placeholder="admin@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:border-blue-500 focus-visible:ring-blue-400/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:border-blue-500 focus-visible:ring-blue-400/20"
              />
            </div>

            <Button
              variant="ghost"
              disabled={loading}
              className="w-full  text-white border mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Student portal? <a href="/login" className="text-zinc-400 hover:text-white transition">Sign in here</a>
        </p>
      </div>
    </div>
  )
}