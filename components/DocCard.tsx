'use client'

import { Document } from '@/types'
import StatusBadge from './StatusBadge'
import Link from 'next/link'

function getExpiryText(doc: Document): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(doc.expiry_date)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const formatted = expiry.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  if (diffDays < 0) {
    return `Expired ${Math.abs(diffDays)} days ago · Renew now`
  }
  if (diffDays === 0) {
    return `Expires today · Renew now`
  }
  if (diffDays === 1) {
    return `Expires tomorrow · Due ${formatted}`
  }
  return `Expires in ${diffDays} days · Due ${formatted}`
}

export default function DocCard({ doc }: { doc: Document }) {
  return (
    <Link href={`/documents/${doc.id}/edit`} className="block">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm active:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900 truncate">{doc.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{getExpiryText(doc)}</p>
          </div>
          <StatusBadge status={doc.status} />
        </div>
      </div>
    </Link>
  )
}
