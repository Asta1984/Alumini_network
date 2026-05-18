'use client';

import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/lib/protected-route';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PageSkeleton } from '@/components/skeletons';
import Link from 'next/link';

interface AlumniProfile {
  userId: string;
  fullName: string;
  enrollmentNumber: string;
  profilePictureUrl: string | null;
  nickname: string | null;
  bio: string | null;
  socialProfiles: Array<{
    platform: 'LINKEDIN' | 'INSTAGRAM' | 'GITHUB' | 'TWITTER';
    profileUrl: string;
  }>;
  aiSummary: string | null;
  createdAt: string;
}

export default function AlumniProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlumniProfile();
  }, [userId]);

  const fetchAlumniProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Profile not found');
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <PageSkeleton />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-card">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-foreground hover:bg-secondary">
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error || 'Profile not found'}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const isOwnProfile = currentUser?.userId === userId;
  const platformIcons: Record<string, string> = {
    LINKEDIN: '🔗',
    INSTAGRAM: '📸',
    GITHUB: '💻',
    TWITTER: '𝕏',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-foreground hover:bg-secondary">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar: Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border shadow-sm p-6 sticky top-6">
                {/* Avatar */}
                <div className="w-20 h-20 bg-linear-to-br from-primary to-primary/50 rounded-full mx-auto mb-4 flex items-center justify-center shrink-0">
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={profile.fullName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Name & Details */}
                <h1 className="text-2xl font-bold text-foreground text-center mb-1">
                  {profile.fullName}
                </h1>
                {profile.nickname && (
                  <p className="text-center text-primary font-medium mb-2 text-sm">
                    {profile.nickname}
                  </p>
                )}
                <p className="text-center text-xs text-muted-foreground mb-4">
                  Enrollment: {profile.enrollmentNumber}
                </p>

                {/* Bio */}
                {profile.bio && (
                  <div className="border-t border-border pt-4 mb-4">
                    <p className="text-sm text-muted-foreground text-center">{profile.bio}</p>
                  </div>
                )}

                {/* Social Profiles */}
                {profile.socialProfiles.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <h3 className="text-xs font-semibold text-foreground uppercase mb-3">
                      Connect
                    </h3>
                    <div className="space-y-2">
                      {profile.socialProfiles.map((social) => (
                        <a
                          key={social.platform}
                          href={social.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded hover:bg-secondary transition text-sm text-foreground hover:text-primary"
                        >
                          <span>{platformIcons[social.platform]}</span>
                          <span className="truncate capitalize">
                            {social.platform.toLowerCase()}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main: Memory Card */}
            <div className="lg:col-span-2">
              {/* Memory Card */}
              <div className="bg-card rounded-lg border border-border shadow-sm p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Memory</h2>
                  <p className="text-sm text-muted-foreground">
                    {isOwnProfile
                      ? 'Your memory summary'
                      : `${profile.fullName}'s alumni memory summary`}
                  </p>
                </div>

                {profile.aiSummary ? (
                  <div className="bg-secondary/30 rounded-lg p-6 border border-border/50">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {profile.aiSummary}
                    </p>
                  </div>
                ) : (
                  <div className="bg-secondary/20 rounded-lg p-8 text-center border border-border/50">
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? 'No memory yet. Write your memories.'
                        : 'No memory shared yet.'}
                    </p>
                    {isOwnProfile && (
                      <Link href="/memories">
                        <Button className="mt-4 bg-primary hover:bg-primary/90">
                          Write Your Memory
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
