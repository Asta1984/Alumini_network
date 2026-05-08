'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="md:text-3xl font-bold text-foreground">Campus Connect</h1>
            <p className="text-sm text-muted-foreground">Student Social Network</p>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-4 text-balance">
            Connect with Your Campus Community
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Share messages with classmates, post on their walls, and build meaningful connections within your institution.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-secondary px-8 py-6 text-lg">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card rounded-lg border-t-2 border-l-2 shadow-sm p-8 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-90">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 text-xl">
              💬
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Post on Walls</h3>
            <p className="text-muted-foreground">Write up to 50 words on classmates&apos; walls to share your thoughts and messages.</p>
          </div>

          <div className="bg-card rounded-lg border-t-2 border-l-2 shadow-sm p-8 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-90">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 text-xl">
              @
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Mention Friends</h3>
            <p className="text-muted-foreground">Tag other students in your posts using @mentions to start conversations.</p>
          </div>

          <div className="bg-card rounded-lg border-t-2 border-l-2 shadow-sm p-8 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-90">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 text-xl">
              👥
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Discover Students</h3>
            <p className="text-muted-foreground">Search and discover new friends in your institution to expand your network.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 Campus Connect. A student-focused social network.</p>
        </div>
      </footer>
    </div>
  );
}
