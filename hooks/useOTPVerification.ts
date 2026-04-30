'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type OTPStep = 'phone' | 'otp'

interface UseOTPVerificationReturn {
  phone: string
  otp: string
  step: OTPStep
  loading: boolean
  error: string
  setPhone: (value: string) => void
  setOtp: (value: string) => void
  sendOTP: () => Promise<void>
  verifyOTP: () => Promise<void>
  reset: () => void
}

export function useOTPVerification(onVerified: () => void): UseOTPVerificationReturn {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<OTPStep>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const formatPhone = useCallback((raw: string) => {
    return raw.startsWith('+') ? raw : `+91${raw}`
  }, [])

  const sendOTP = useCallback(async () => {
    const digits = phone.replace(/\D/g, '')
    if (!digits || digits.length < 10) {
      setError('Enter a valid 10-digit phone number')
      return
    }

    const formatted = formatPhone(phone)
    if (!/^\+91\d{10}$/.test(formatted)) {
      setError('Enter a valid Indian phone number')
      return
    }

    setLoading(true)
    setError('')

    const { error: otpError } = await supabase.auth.updateUser({
      phone: formatted,
    })

    setLoading(false)

    if (otpError) {
      setError(otpError.message)
      return
    }

    setStep('otp')
  }, [phone, supabase.auth, formatPhone])

  const verifyOTP = useCallback(async () => {
    if (!otp || otp.length < 6) {
      setError('Enter the 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    const formattedPhone = formatPhone(phone)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'phone_change',
    })

    if (verifyError) {
      setError(verifyError.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('reminder_preferences').upsert({
        user_id: user.id,
        phone_number: formattedPhone,
        remind_90_days: true,
        remind_30_days: true,
        remind_7_days: true,
        remind_1_day: true,
      }, { onConflict: 'user_id' })
    }

    setLoading(false)
    onVerified()
  }, [otp, phone, supabase, formatPhone, onVerified])

  const reset = useCallback(() => {
    setPhone('')
    setOtp('')
    setStep('phone')
    setLoading(false)
    setError('')
  }, [])

  return {
    phone,
    otp,
    step,
    loading,
    error,
    setPhone,
    setOtp,
    sendOTP,
    verifyOTP,
    reset,
  }
}
