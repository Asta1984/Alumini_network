'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface UserResult {
  userId: string;
  username: string;
  fullName: string;
}

export default function SearchPage() {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.users || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('[v0] Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-foreground hover:bg-secondary">
                ← Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Campus Connect</h1>
            <div className="text-right">
              <p className="font-medium text-foreground">{currentUser?.fullName}</p>
              <p className="text-sm text-muted-foreground">@{currentUser?.username}</p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Find Students</h2>
              <p className="text-muted-foreground">Search for classmates and visit their profiles</p>
            </div>

            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </form>

            {searched && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Searching...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="bg-card rounded-lg border border-border shadow-sm p-8 text-center">
                    <p className="text-muted-foreground">No students found matching &quot;{searchQuery}&quot;</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Found {results.length} student{results.length !== 1 ? 's' : ''}
                    </p>
                    {results.map((result) => (
                      <Link key={result.userId} href={`/profile/${result.userId}`}>
                        <div className="bg-card rounded-lg border border-border shadow-sm p-4 hover:border-primary hover:shadow-md transition">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-foreground">{result.fullName}</p>
                              <p className="text-sm text-primary">@{result.username}</p>
                            </div>
                            <Button
                              variant="outline"
                              className="border-border text-foreground hover:bg-secondary"
                              asChild
                            >
                              <span>Visit Profile</span>
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
