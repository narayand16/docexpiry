'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessType, Document as DocType } from '@/types'
import { DOCUMENT_SUGGESTIONS } from '@/constants/documentTypes'
import WhatsAppNudge from '@/components/WhatsAppNudge'

export default function AddDocumentForm() {
  const router = useRouter()

  const [businessId, setBusinessId] = useState('')
  const [businessType, setBusinessType] = useState<BusinessType>('other')
  const [selectedName, setSelectedName] = useState('')
  const [customName, setCustomName] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [issuedBy, setIssuedBy] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNudge, setShowNudge] = useState(false)
  const [savedDoc, setSavedDoc] = useState<DocType | null>(null)

  useEffect(() => {
    fetch('/api/businesses')
      .then((res) => res.json())
      .then((data) => {
        if (data.business) {
          setBusinessId(data.business.id)
          setBusinessType(data.business.type)
        }
      })
  }, [])

  const docName = isCustom ? customName : selectedName
  const suggestions = DOCUMENT_SUGGESTIONS[businessType] || DOCUMENT_SUGGESTIONS.other

  const handleSubmit = async () => {
    if (!docName.trim()) {
      setError('Please select or enter a document name.')
      return
    }
    if (!day || !month || !year) {
      setError('Please enter the expiry date.')
      return
    }

    const expiryDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

    // Basic date validation
    const parsed = new Date(expiryDate)
    if (isNaN(parsed.getTime())) {
      setError('Invalid date.')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: businessId,
        name: docName.trim(),
        expiry_date: expiryDate,
        issued_by: issuedBy.trim() || null,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      return
    }

    setSavedDoc(data.document)

    // Check if nudge should show
    const nudgeDismissed = localStorage.getItem('nudge_dismissed')
    const isAuthenticated = localStorage.getItem('whatsapp_verified')
    if (!nudgeDismissed && !isAuthenticated) {
      setShowNudge(true)
    } else {
      router.push('/dashboard')
    }
  }

  const handleNudgeDismiss = () => {
    localStorage.setItem('nudge_dismissed', 'true')
    setShowNudge(false)
    router.push('/dashboard')
  }

  const handleVerified = () => {
    localStorage.setItem('whatsapp_verified', 'true')
    localStorage.removeItem('nudge_dismissed')
    setShowNudge(false)
    router.push('/dashboard')
  }

  const currentYear = new Date().getFullYear()

  return (
    <>
      <div className="space-y-6">
        {/* Document name chips */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Which document are you tracking?
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setSelectedName(name)
                  setIsCustom(false)
                }}
                className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  !isCustom && selectedName === name
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
                }`}
              >
                {!isCustom && selectedName === name ? `${name} ✕` : name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setIsCustom(true)
                setSelectedName('')
              }}
              className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                isCustom
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
              }`}
            >
              + Custom
            </button>
          </div>
          {isCustom && (
            <input
              type="text"
              placeholder="Enter document name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={200}
              autoFocus
            />
          )}
        </div>

        {/* Expiry date — 3 dropdowns */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When does it expire?
          </label>
          <div className="grid grid-cols-3 gap-3">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={String(d)}>{d}</option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">Month</option>
              {[
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
              ].map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">Year</option>
              {Array.from({ length: 11 }, (_, i) => currentYear + i).map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Issued by */}
        <div>
          <label htmlFor="issued-by" className="block text-sm font-medium text-gray-700 mb-2">
            Who issued it? <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="issued-by"
            type="text"
            placeholder="e.g. Municipal Corporation"
            value={issuedBy}
            onChange={(e) => setIssuedBy(e.target.value)}
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
          {loading ? 'Saving...' : 'Save Document'}
        </button>
      </div>

      {showNudge && (
        <WhatsAppNudge
          document={savedDoc}
          onDismiss={handleNudgeDismiss}
          onVerified={handleVerified}
        />
      )}
    </>
  )
}
