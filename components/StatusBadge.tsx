'use client'

import { DocumentStatus } from '@/types'

const statusConfig: Record<DocumentStatus, { label: string; color: string; emoji: string }> = {
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800', emoji: '🔴' },
  critical: { label: 'Critical', color: 'bg-orange-100 text-orange-800', emoji: '🔴' },
  upcoming: { label: 'Upcoming', color: 'bg-yellow-100 text-yellow-800', emoji: '🟡' },
  safe: { label: 'Safe', color: 'bg-green-100 text-green-800', emoji: '🟢' },
}

export default function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  )
}
