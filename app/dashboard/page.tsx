'use client';

import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/lib/protected-route';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user && !user.isProfileCompleted) {
      router.push('/onboarding');
    }
  }, [user, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Surabhi Alumni Memory Book</h1>
              <p className="text-sm text-muted-foreground">Preserve and celebrate alumni memories</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-foreground">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">@{user?.fullName}</p>
              </div>
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="outline"
                className="border-border text-foreground hover:bg-secondary"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Welcome back, {user?.fullName}!</h2>
                <p className="text-muted-foreground mb-4">
                  Explore alumni memories, contribute your own, and celebrate the community you're part of.
                </p>
                <Link href={`/profile/${user?.userId}`}>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    View Your Profile
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                  <p className="text-sm text-muted-foreground">Your Profile</p>
                  <p className="text-2xl font-bold text-foreground">{user?.fullName}</p>
                </div>
                <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="text-lg font-semibold text-foreground">
                    {user?.createdAt && new Date(user.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                   })}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/alumni-wall" className="block">
                    <Button
                      variant="ghost"
                      className="w-full justify-start border-border text-foreground hover:bg-secondary"
                    >
                      Alumni Memoir Wall
                    </Button>
                  </Link>
                  <Link href="/memories" className="block">
                    <Button
                      variant="ghost"
                      className="w-full justify-start border-border text-foreground hover:bg-secondary"
                    >
                      Write a Memory
                    </Button>
                  </Link>
                  <Link href={`/profile/${user?.userId}`} className="block">
                    <Button
                      variant="ghost"
                      className="w-full justify-start border-border text-foreground hover:bg-secondary"
                    >
                      View Profile
                    </Button>
                  </Link>
                  <Link href="/search" className="block">
                    <Button
                      variant="ghost"
                      className="w-full justify-start border-border text-foreground hover:bg-secondary"
                    >
                      Find Alumni
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-card rounded-lg border border-border shadow-sm p-6 mt-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Getting Started</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Explore the alumni memoir wall to read messages</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Write a memory for fellow alumni</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Search for classmates and their profiles</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
