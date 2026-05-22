'use client';

import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/lib/protected-route';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MemoryWallSpinner } from '@/components/memories/memory-wall-spinner';
import { MessagePreview } from '@/components/memories/message-preview';

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

// Add to your SentMessage interface (or import it from message-preview component)
interface SentMessage {
  id: string;
  recipientId: string;
  recipientName: string;
  messageText: string;
  characterCount: number;
  createdAt: string | Date;
  status: 'pending' | 'approved' | 'rejected';
}


export default function AlumniProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  useEffect(() => {
    fetchAlumniProfile();
    fetchSentMessages();
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
  const fetchSentMessages = async () => {
  try {
    setMessagesLoading(true);
    const response = await fetch('/api/messages/sent');
    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    setSentMessages(data.messages); 
  } catch (err) {
    console.error('Failed to load sent messages:', err);
  } finally {
    setMessagesLoading(false);
  }
};

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <MemoryWallSpinner />
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
  const platformIcons: Record<string, React.ReactNode> = {
    LINKEDIN: <Image src="/linkedin-svgrepo-com.svg" alt="LinkedIn" width={16} height={16} />,
    INSTAGRAM: <Image src="/instagram.svg" alt="Instagram" width={16} height={16} />,
    GITHUB: <Image src="/github.svg" alt="GitHub" width={16} height={16} />,
    TWITTER: <Image src="/x.svg" alt="Twitter" width={16} height={16} />,
  };



  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-end">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-foreground hover:bg-secondary">
                ← Dashboard
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
  <div className="bg-card rounded-lg border border-border shadow-sm p-8">
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">Memory</h2>
      <p className="text-sm text-muted-foreground">
        {isOwnProfile
          ? 'Your memory summary'
          : `${profile.fullName}'s alumni memory summary`}
      </p>
    </div>

    {/* No memories at all */}
    {!profile.aiSummary && sentMessages.length === 0 && (
      <div className="bg-secondary/20 rounded-lg p-8 text-center border border-border/50">
        <p className="text-muted-foreground">
          {isOwnProfile ? 'No memory yet. Write your memories.' : 'No memory shared yet.'}
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

    {/* AI Summary if available */}
    {profile.aiSummary && (
      <div className="bg-secondary/30 rounded-lg p-6 border border-border/50 mb-6">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {profile.aiSummary}
        </p>
      </div>
    )}

    {/* Sent Messages */}
    {sentMessages.length > 0 && (
      <div>
        <h3 className="font-semibold text-foreground mb-4">
          {isOwnProfile ? 'Your Sent Memories' : 'Memories Written'}
        </h3>
        <MessagePreview messages={sentMessages} isLoading={messagesLoading} />
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
