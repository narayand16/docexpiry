'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessType } from '@/types'
import { BUSINESS_TYPE_LABELS } from '@/constants/documentTypes'

const businessTypes: { value: BusinessType; label: string }[] = (
  Object.entries(BUSINESS_TYPE_LABELS) as [BusinessType, string][]
).map(([value, label]) => ({ value, label }))

export default function SetupForm() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!selectedType || !name.trim()) {
      setError('Please select a business type and enter a name.')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), type: selectedType }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    router.push('/documents/add')
  }

  return (
    <div className="space-y-6">
      {/* Business type selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What kind of business do you run?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {businessTypes.map((bt) => (
            <button
              key={bt.value}
              type="button"
              onClick={() => setSelectedType(bt.value)}
              className={`min-h-12 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                selectedType === bt.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
              }`}
            >
              {bt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Business name */}
      <div>
        <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-2">
          What&apos;s your business name?
        </label>
        <input
          id="business-name"
          type="text"
          placeholder="e.g. Sharma Restaurant"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          maxLength={200}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="min-h-12 w-full rounded-full bg-blue-600 px-6 text-base font-semibold text-white active:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Setting up...' : "Let's get started →"}
      </button>
    </div>
  )
}
