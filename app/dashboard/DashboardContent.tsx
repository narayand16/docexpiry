'use client'

import { useState, useEffect } from 'react'
import { Document as DocType, Business } from '@/types'
import BottomNav from '@/components/BottomNav'
import SummaryBar from '@/components/SummaryBar'
import DocCard from '@/components/DocCard'
import EmptyState from '@/components/EmptyState'
import OTPModal from '@/components/OTPModal'
import Link from 'next/link'

const statusOrder = { expired: 0, critical: 1, upcoming: 2, safe: 3 }

export default function DashboardContent() {
  const [documents, setDocuments] = useState<DocType[]>([])
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showOTP, setShowOTP] = useState(false)

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('whatsapp_verified') === 'true')

    Promise.all([
      fetch('/api/businesses').then((r) => r.json()),
      fetch('/api/documents').then((r) => r.json()),
    ]).then(([bizData, docData]) => {
      setBusiness(bizData.business || null)
      setDocuments(docData.documents || [])
      setLoading(false)
    })
  }, [])

  const sorted = [...documents].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  )

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </main>
    )
  }

  return (
    <>
      <main className="flex flex-1 flex-col px-6 pt-6 pb-28">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {business?.name || 'Dashboard'}
            </h1>
            <Link
              href="/documents/add"
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-medium text-white active:bg-blue-700 transition-colors"
            >
              + Add
            </Link>
          </div>

          {/* Summary bar */}
          <div className="mb-4">
            <SummaryBar documents={documents} />
          </div>

          {/* Document list */}
          {sorted.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {sorted.map((doc) => (
                <DocCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* WhatsApp banner for unauthenticated users */}
      {!isAuthenticated && documents.length > 0 && (
        <div className="fixed inset-x-0 bottom-14 z-40 bg-green-50 border-t border-green-200 px-4 py-3" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <button
            onClick={() => setShowOTP(true)}
            className="flex w-full items-center justify-center gap-2 text-sm font-medium text-green-800"
          >
            <span>🔔</span>
            <span>Add your WhatsApp number to get renewal reminders →</span>
          </button>
        </div>
      )}

      {showOTP && (
        <OTPModal
          onClose={() => setShowOTP(false)}
          onVerified={() => {
            localStorage.setItem('whatsapp_verified', 'true')
            setShowOTP(false)
            setIsAuthenticated(true)
          }}
        />
      )}

      <BottomNav />
    </>
  )
}
