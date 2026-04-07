'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

interface EditDocumentFormProps {
  documentId: string
}

export default function EditDocumentForm({ documentId }: EditDocumentFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [issuedBy, setIssuedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        const doc = data.documents?.find((d: { id: string }) => d.id === documentId)
        if (doc) {
          setName(doc.name)
          const [y, m, d2] = doc.expiry_date.split('-')
          setYear(y)
          setMonth(String(parseInt(m)))
          setDay(String(parseInt(d2)))
          setIssuedBy(doc.issued_by || '')
          setNotes(doc.notes || '')
        }
        setLoading(false)
      })
  }, [documentId])

  const handleSave = async () => {
    if (!name.trim() || !day || !month || !year) {
      setError('Name and expiry date are required.')
      return
    }

    const expiryDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    const parsed = new Date(expiryDate)
    if (isNaN(parsed.getTime())) {
      setError('Invalid date.')
      return
    }

    setSaving(true)
    setError('')

    const res = await fetch(`/api/documents/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        expiry_date: expiryDate,
        issued_by: issuedBy.trim() || null,
        notes: notes.trim() || null,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      return
    }

    router.push('/dashboard')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      return
    }

    setSaving(true)
    const res = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' })
    setSaving(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to delete')
      return
    }

    router.push('/dashboard')
  }

  const currentYear = new Date().getFullYear()

  if (loading) {
    return <div className="text-center text-gray-400 text-sm py-12">Loading...</div>
  }

  return (
    <>
      <div className="space-y-6">
        {/* Document name */}
        <div>
          <label htmlFor="doc-name" className="block text-sm font-medium text-gray-700 mb-2">
            Document name
          </label>
          <input
            id="doc-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            maxLength={200}
          />
        </div>

        {/* Expiry date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry date
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
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">Year</option>
              {Array.from({ length: 11 }, (_, i) => currentYear - 1 + i).map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Issued by */}
        <div>
          <label htmlFor="issued-by" className="block text-sm font-medium text-gray-700 mb-2">
            Issued by <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="issued-by"
            type="text"
            value={issuedBy}
            onChange={(e) => setIssuedBy(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            maxLength={200}
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            maxLength={500}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="min-h-12 w-full rounded-full bg-blue-600 px-6 text-base font-semibold text-white active:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          onClick={handleDelete}
          disabled={saving}
          className="min-h-12 w-full text-center text-sm font-medium text-red-600 active:text-red-700 disabled:opacity-50"
        >
          Delete this document
        </button>
      </div>

      <BottomNav />
    </>
  )
}
