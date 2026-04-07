'use client'

import { Document } from '@/types'

interface SummaryBarProps {
  documents: Document[]
}

export default function SummaryBar({ documents }: SummaryBarProps) {
  const counts = {
    expired: documents.filter((d) => d.status === 'expired').length,
    critical: documents.filter((d) => d.status === 'critical').length,
    upcoming: documents.filter((d) => d.status === 'upcoming').length,
    safe: documents.filter((d) => d.status === 'safe').length,
  }

  const urgentCount = counts.expired + counts.critical

  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {urgentCount > 0 && (
          <span className="font-medium text-red-700">
            🔴 {urgentCount} Expired/Critical
          </span>
        )}
        {counts.upcoming > 0 && (
          <span className="font-medium text-yellow-700">
            🟡 {counts.upcoming} Upcoming
          </span>
        )}
        {counts.safe > 0 && (
          <span className="font-medium text-green-700">
            🟢 {counts.safe} Safe
          </span>
        )}
        {documents.length === 0 && (
          <span className="text-gray-500">No documents added yet</span>
        )}
      </div>
    </div>
  )
}
