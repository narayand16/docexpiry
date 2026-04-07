'use client'

import { useState } from 'react'
import { Document } from '@/types'
import OTPModal from './OTPModal'

interface WhatsAppNudgeProps {
  document: Document | null
  onDismiss: () => void
  onVerified: () => void
}

function getNudgeCopy(doc: Document | null) {
  if (!doc) {
    return {
      emoji: '🔔',
      title: 'Never miss a renewal again',
      body: 'Want us to remind you on WhatsApp before your documents expire?',
      urgency: 'A fine costs more than 30 seconds of your time.',
    }
  }

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

  if (diffDays <= 30) {
    return {
      emoji: '⚠️',
      title: `Your ${doc.name} expires in ${diffDays} days`,
      body: 'One WhatsApp number is all it takes to stay safe.',
      urgency: 'A fine costs more than 30 seconds of your time.',
    }
  }

  if (diffDays <= 90) {
    return {
      emoji: '🔔',
      title: `${doc.name} is coming up for renewal`,
      body: `It expires on ${formatted}. Let us nudge you at the right time — no spam, just one message.`,
      urgency: '',
    }
  }

  return {
    emoji: '✅',
    title: "You're set for now. But renewals sneak up.",
    body: `Your ${doc.name} expires on ${formatted}. Want a heads-up on WhatsApp when it's time?`,
    urgency: '',
  }
}

export default function WhatsAppNudge({ document, onDismiss, onVerified }: WhatsAppNudgeProps) {
  const [showOTP, setShowOTP] = useState(false)
  const copy = getNudgeCopy(document)

  if (showOTP) {
    return <OTPModal onClose={() => setShowOTP(false)} onVerified={onVerified} />
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onDismiss}
      />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-6 pt-6 shadow-2xl" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto max-w-lg">
          <div className="mb-1 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-gray-300" />
          </div>

          <div className="py-4 text-center">
            <div className="text-3xl mb-2">{copy.emoji}</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{copy.title}</h2>
            <p className="text-sm text-gray-600 mb-1">{copy.body}</p>
            {copy.urgency && (
              <p className="text-sm text-gray-500 italic">{copy.urgency}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 pb-2">
            <button
              onClick={() => setShowOTP(true)}
              className="min-h-12 w-full rounded-full bg-green-600 px-6 text-base font-medium text-white active:bg-green-700 transition-colors"
            >
              ✅ Yes, remind me on WhatsApp
            </button>
            <button
              onClick={onDismiss}
              className="min-h-12 w-full rounded-full bg-gray-100 px-6 text-base font-medium text-gray-600 active:bg-gray-200 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
