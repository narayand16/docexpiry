'use client'

import { useOTPVerification } from '@/hooks/useOTPVerification'

interface OTPModalProps {
  onClose: () => void
  onVerified: () => void
}

export default function OTPModal({ onClose, onVerified }: OTPModalProps) {
  const {
    phone,
    otp,
    step,
    loading,
    error,
    setPhone,
    setOtp,
    sendOTP,
    verifyOTP,
  } = useOTPVerification(onVerified)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-6 pt-6 shadow-2xl" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto max-w-lg">
          <div className="mb-1 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-gray-300" />
          </div>

          <div className="py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 text-center">
              {step === 'phone' ? 'Enter your WhatsApp number' : 'Verify OTP'}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              {step === 'phone'
                ? "We'll send a one-time code to verify your number."
                : `We sent a code to +91${phone}`}
            </p>

            {error ? (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            ) : null}

            {step === 'phone' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 shrink-0">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <button
                  onClick={sendOTP}
                  disabled={loading}
                  className="min-h-12 w-full rounded-full bg-green-600 px-6 text-base font-medium text-white active:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl font-mono tracking-widest text-gray-900 placeholder:text-gray-400 placeholder:text-base placeholder:tracking-normal placeholder:font-sans focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={verifyOTP}
                  disabled={loading}
                  className="min-h-12 w-full rounded-full bg-green-600 px-6 text-base font-medium text-white active:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable Reminders'}
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-3 min-h-12 w-full rounded-full bg-gray-100 px-6 text-base font-medium text-gray-600 active:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
