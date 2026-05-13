'use client'

import { Badge } from '@/components/ui/badge'

export type StatusType = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive'

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<StatusType, { variant: any; label: string }> = {
  pending: {
    variant: 'outline',
    label: 'Pending',
  },
  approved: {
    variant: 'default',
    label: 'Approved',
  },
  rejected: {
    variant: 'destructive',
    label: 'Rejected',
  },
  active: {
    variant: 'default',
    label: 'Active',
  },
  inactive: {
    variant: 'outline',
    label: 'Inactive',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
