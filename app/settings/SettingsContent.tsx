'use client'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import OTPModal from '@/components/OTPModal'
import { ReminderPreferences } from '@/types'

export default function SettingsContent() {
  const [settings, setSettings] = useState<ReminderPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [message, setMessage] = useState('')

  const [remind90, setRemind90] = useState(true)
  const [remind30, setRemind30] = useState(true)
  const [remind7, setRemind7] = useState(true)
  const [remind1, setRemind1] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings)
          setRemind90(data.settings.remind_90_days)
          setRemind30(data.settings.remind_30_days)
          setRemind7(data.settings.remind_7_days)
          setRemind1(data.settings.remind_1_day)
        }
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    if (!settings?.phone_number) return

    setSaving(true)
    setMessage('')

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: settings.phone_number,
        remind_90_days: remind90,
        remind_30_days: remind30,
        remind_7_days: remind7,
        remind_1_day: remind1,
      }),
    })

    setSaving(false)

    if (res.ok) {
      setMessage('Preferences saved!')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('Failed to save. Please try again.')
    }
  }

  const handleClearData = async () => {
    if (!confirm('This will delete all your data including businesses, documents, and preferences. This cannot be undone. Are you sure?')) {
      return
    }
    // For V1, we just clear localStorage and redirect
    localStorage.clear()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </main>
    )
  }

  return (
    <>
      <main className="flex flex-1 flex-col px-6 pt-8 pb-28">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

          {!settings ? (
            /* No phone number yet */
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="text-3xl mb-3">📵</div>
              <p className="text-sm text-gray-600 mb-1">
                You haven&apos;t added a WhatsApp number yet.
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Reminders won&apos;t be sent until you do.
              </p>
              <button
                onClick={() => setShowOTP(true)}
                className="min-h-12 rounded-full bg-green-600 px-6 text-base font-medium text-white active:bg-green-700 transition-colors"
              >
                Add WhatsApp number →
              </button>
            </div>
          ) : (
            /* Has phone number — show preferences */
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Reminders</h2>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">WhatsApp number</span>
                  <span className="text-sm font-medium text-gray-900">{settings.phone_number}</span>
                </div>

                <p className="text-sm text-gray-500 mb-3">Remind me before expiry:</p>

                <div className="space-y-3">
                  {[
                    { label: '90 days before', value: remind90, setter: setRemind90 },
                    { label: '30 days before', value: remind30, setter: setRemind30 },
                    { label: '7 days before', value: remind7, setter: setRemind7 },
                    { label: '1 day before', value: remind1, setter: setRemind1 },
                  ].map((item) => (
                    <label key={item.label} className="flex min-h-10 items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={(e) => item.setter(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {message && (
                <div className={`rounded-lg p-3 text-sm ${message.includes('saved') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="min-h-12 w-full rounded-full bg-blue-600 px-6 text-base font-semibold text-white active:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save preferences'}
              </button>

              <hr className="border-gray-200" />

              <button
                onClick={handleClearData}
                className="min-h-12 w-full text-center text-sm font-medium text-red-600 active:text-red-700"
              >
                Clear all data
              </button>
            </div>
          )}
        </div>
      </main>

      {showOTP && (
        <OTPModal
          onClose={() => setShowOTP(false)}
          onVerified={() => {
            localStorage.setItem('whatsapp_verified', 'true')
            setShowOTP(false)
            // Reload settings
            fetch('/api/settings')
              .then((r) => r.json())
              .then((data) => {
                if (data.settings) {
                  setSettings(data.settings)
                  setRemind90(data.settings.remind_90_days)
                  setRemind30(data.settings.remind_30_days)
                  setRemind7(data.settings.remind_7_days)
                  setRemind1(data.settings.remind_1_day)
                }
              })
          }}
        />
      )}

      <BottomNav />
    </>
  )
}
