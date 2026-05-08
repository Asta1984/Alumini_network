'use client';

import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/protected-route';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PostForm from '@/components/post-form';
import PostCard from '@/components/post-card';

interface User {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  createdAt: string;
}

interface Post {
  postId: string;
  authorId: string;
  author: {
    username: string;
    fullName: string;
  };
  content: string;
  taggedUsers: Array<{
    userId: string;
    username: string;
    fullName: string;
  }>;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    fetchUserProfile();
    fetchWallPosts();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      const data = await response.json();
      setProfileUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchWallPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await fetch(`/api/walls/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to load posts');
      }
      const data = await response.json();
      setPosts(data.posts || []);
      setPostCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('[v0] Failed to load posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handlePostSuccess = () => {
    fetchWallPosts();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !profileUser) {
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
              {error}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const isOwnProfile = currentUser?.userId === userId;

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
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                <div className="w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {profileUser.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground text-center mb-1">{profileUser.fullName}</h1>
                <p className="text-center text-primary font-medium mb-4">@{profileUser.username}</p>
                <div className="border-t border-border pt-4 mt-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">Posts on Wall</p>
                    <p className="text-2xl font-bold text-foreground">{postCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wall Section */}
            <div className="md:col-span-2">
              {!isOwnProfile && (
                <div className="mb-6">
                  <PostForm targetUserId={userId} onSuccess={handlePostSuccess} />
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {isOwnProfile ? 'Your Wall' : `${profileUser.fullName}'s Wall`}
                </h2>

                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-card rounded-lg border border-border shadow-sm p-8 text-center">
                    <p className="text-muted-foreground">No posts yet on this wall</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.postId} post={post} />
                    ))}
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
