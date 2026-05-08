'use client';

import Link from 'next/link';

interface TaggedUser {
  userId: string;
  username: string;
  fullName: string;
}

interface Post {
  postId: string;
  authorId: string;
  author: {
    username: string;
    fullName: string;
  };
  content: string;
  taggedUsers: TaggedUser[];
  createdAt: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-6">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/profile/${post.authorId}`} className="hover:opacity-80 transition">
          <div>
            <p className="font-semibold text-foreground">{post.author.fullName}</p>
            <p className="text-sm text-primary">@{post.author.username}</p>
          </div>
        </Link>
        <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
      </div>

      <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

      {post.taggedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.taggedUsers.map((user) => (
            <Link
              key={user.userId}
              href={`/profile/${user.userId}`}
              className="bg-primary/10 text-primary px-2 py-1 rounded text-xs hover:bg-primary/20 transition"
            >
              @{user.username}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
