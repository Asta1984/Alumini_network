'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import crypto from 'crypto';

interface UserSuggestion {
  userId: string;
  username: string;
  fullName: string;
}

interface PostFormProps {
  targetUserId: string;
  onSuccess: () => void;
}

export default function PostForm({ targetUserId, onSuccess }: PostFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_WORDS = 50;

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter((w) => w.length > 0).length;
    setWordCount(words);
  }, [content]);

  const handleSearch = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.users || []);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('[v0] Search error:', err);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    setError('');

    // Check for @ mentions
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = text.substring(lastAtIndex + 1);
      const beforeSpace = afterAt.split(/[\s,]/)[0];

      if (beforeSpace.length > 0) {
        setSearchTerm(beforeSpace);
        handleSearch(beforeSpace);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const addTag = (user: UserSuggestion) => {
    if (!taggedUsers.includes(user.userId)) {
      setTaggedUsers([...taggedUsers, user.userId]);

      // Replace the @ mention in the text
      const lastAtIndex = content.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        const beforeAt = content.substring(0, lastAtIndex);
        const afterMention = content.substring(lastAtIndex).split(/[\s,]/)[1] || '';
        setContent(beforeAt + '@' + user.username + ' ' + afterMention);
      }
    }
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchTerm('');
  };

  const removeTag = (userId: string) => {
    setTaggedUsers(taggedUsers.filter((id) => id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Post content is required');
      return;
    }

    if (wordCount > MAX_WORDS) {
      setError(`Post exceeds ${MAX_WORDS} word limit`);
      return;
    }

    setLoading(true);

    try {
      // Generate idempotency key using content hash
      const idempotencyKey = crypto
        .createHash('sha256')
        .update(content + user?.userId + targetUserId + Date.now())
        .digest('hex');

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          targetUserId,
          taggedUsers,
          idempotencyKey,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      // Reset form
      setContent('');
      setTaggedUsers([]);
      setWordCount(0);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border shadow-sm p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Post on Wall</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="relative mb-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Write a message... (Type @ to mention someone)"
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground resize-none"
          rows={4}
          disabled={loading}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg mt-1 z-10 max-h-48 overflow-y-auto"
          >
            {suggestions.map((user) => (
              <button
                key={user.userId}
                type="button"
                onClick={() => addTag(user)}
                className="w-full text-left px-4 py-2 hover:bg-secondary text-foreground border-b border-border last:border-b-0"
              >
                <p className="font-medium">@{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.fullName}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {wordCount} / {MAX_WORDS} words
          {wordCount > MAX_WORDS && <span className="text-red-600 ml-2">Exceeds limit</span>}
        </div>
      </div>

      {/* Tagged users */}
      {taggedUsers.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {taggedUsers.map((userId) => {
            const user = suggestions.find((u) => u.userId === userId);
            return (
              <div
                key={userId}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>@{user?.username || userId}</span>
                <button
                  type="button"
                  onClick={() => removeTag(userId)}
                  className="text-primary hover:text-primary/80"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !content.trim() || wordCount > MAX_WORDS}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {loading ? 'Posting...' : 'Post'}
      </Button>
    </form>
  );
}
