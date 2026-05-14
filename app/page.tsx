'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Settings } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Surabhi</h1>
                <p className="text-sm text-muted-foreground">Alumni Memory Book</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline">Student Login</Button>
              </Link>
              <Link href="/admin/login">
                <Button className="bg-primary hover:bg-primary/90">Admin Panel</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
            Preserve Your Legacy
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
            Create lasting memories with your batchmates. Share stories, wisdom, and moments that define your journey at Surabhi.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Portal Card */}
          <div className="group rounded-lg border border-border bg-card p-8 hover:border-primary hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-semibold text-foreground">Alumni Portal</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Write memories, connect with batchmates, and explore the stories of your peers. Your legacy starts here.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>Write and share your memories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>View AI-generated summaries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>Connect with your batch</span>
              </li>
            </ul>
            <Link href="/login" className="w-full block">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Enter Alumni Portal
              </Button>
            </Link>
          </div>

          {/* Admin Portal Card */}
          <div className="group rounded-lg border border-border bg-card p-8 hover:border-primary hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-semibold text-foreground">Admin Panel</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Manage the platform, moderate submissions, and ensure quality of the memory book experience.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>Manage student profiles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>Review submissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>Generate onboarding links</span>
              </li>
            </ul>
            <Link href="/admin/login" className="w-full block">
              <Button variant="outline" className="w-full">
                Access Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Surabhi Alumni Memory Book © 2026. Preserving memories, one story at a time.
          </p>
        </div>
      </footer>
    </div>
  )
}
