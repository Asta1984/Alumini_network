import { Skeleton } from '@/components/ui/skeleton'

/**
 * CardSkeleton - Skeleton loader for card-like components
 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <Skeleton className="h-4 w-3/4 bg-zinc-800" />
      <Skeleton className="h-3 w-full bg-zinc-800" />
      <Skeleton className="h-3 w-5/6 bg-zinc-800" />
    </div>
  )
}

/**
 * ProfileCardSkeleton - Skeleton loader for profile cards
 */
export function ProfileCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex gap-4">
      {/* Avatar */}
      <Skeleton className="w-12 h-12 rounded-full bg-zinc-800 shrink-0" />
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3 bg-zinc-800" />
        <Skeleton className="h-3 w-1/2 bg-zinc-800" />
        <Skeleton className="h-3 w-3/4 bg-zinc-800" />
      </div>
    </div>
  )
}

/**
 * ListSkeleton - Skeleton loader for list items
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * TableRowSkeleton - Skeleton loader for table rows
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex gap-4 p-4 border-b border-zinc-800">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 bg-zinc-800 flex-1"
        />
      ))}
    </div>
  )
}

/**
 * TableSkeleton - Skeleton loader for entire table
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-zinc-800 bg-zinc-800/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 bg-zinc-700 flex-1"
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  )
}

/**
 * FormSkeleton - Skeleton loader for form sections
 */
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4 bg-zinc-800" />
        <Skeleton className="h-10 w-full bg-zinc-800 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3 bg-zinc-800" />
        <Skeleton className="h-10 w-full bg-zinc-800 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-1/4 bg-zinc-800 rounded-lg" />
    </div>
  )
}

/**
 * PageSkeleton - Full page skeleton loader
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3 bg-zinc-800" />
        <Skeleton className="h-4 w-1/2 bg-zinc-800" />
      </div>
      
      {/* Search/Filter bar */}
      <Skeleton className="h-10 w-full bg-zinc-800 rounded-lg" />
      
      {/* Content */}
      <TableSkeleton rows={3} columns={5} />
    </div>
  )
}
