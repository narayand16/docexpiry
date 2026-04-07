'use client'

import Link from 'next/link'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">📋</div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Add your first license or document to start tracking its expiry date.
      </p>
      <Link
        href="/documents/add"
        className="inline-flex items-center justify-center min-h-12 px-6 bg-blue-600 text-white font-medium rounded-full text-base active:bg-blue-700 transition-colors"
      >
        + Add your first document
      </Link>
    </div>
  )
}
