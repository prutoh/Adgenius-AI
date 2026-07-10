'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { CheckCircle, AlertCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // The email the user signed up with — passed via ?email= from signup page
  const signupEmail = searchParams.get('email')

  const [email, setEmail] = useState(signupEmail || '')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [view, setView] = useState<'loading' | 'check_inbox' | 'enter_code' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  // On mount, check if the user already has a confirmed session
  // (happens when they click the email link and Supabase auto-processes #access_token hash)
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Check if email is confirmed
          if (session.user.email_confirmed_at) {
            setView('success')
            return
          }
        }

        // No confirmed session — check if we got here from the signup page
        if (signupEmail) {
          setView('check_inbox')
        } else {
          // User navigated here directly (e.g. clicked email link that didn't auto-confirm)
          // Try to get email from URL hash tokens
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const type = hashParams.get('type')

          if (accessToken && (type === 'signup' || type === 'email')) {
            // Supabase client should have already processed the hash tokens
            // Wait a moment and check session again
            await new Promise(resolve => setTimeout(resolve, 1500))
            const { data: { session: refreshedSession } } = await supabase.auth.getSession()
            if (refreshedSession?.user?.email_confirmed_at) {
              setView('success')
              return
            }
          }

          // No session at all — show the email input + OTP form
          setView('enter_code')
        }
      } catch {
        setView('enter_code')
      }
    }

    checkSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for auth state changes (handles hash token processing)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          if (session?.user?.email_confirmed_at) {
            setView('success')
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setView('loading')

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit code.')
      setView('enter_code')
      return
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otpCode,
        type: 'email',
      })

      if (error) {
        const msg = error.message || 'Verification failed.'
        if (msg.toLowerCase().includes('expired')) {
          setError('This code has expired. Please request a new one.')
        } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('wrong')) {
          setError('Incorrect code. Please check and try again.')
        } else {
          setError(msg)
        }
        setView('enter_code')
        return
      }

      setView('success')
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setView('enter_code')
    }
  }, [email, otp, supabase])

  const handleResend = useCallback(async () => {
    if (!email) return
    setResendLoading(true)
    setResendMessage(null)
    setError(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setResendMessage('A new verification email has been sent. Check your inbox.')
        setView('check_inbox')
      }
    } catch {
      setError('Failed to resend email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }, [email, supabase])

  // Loading state
  if (view === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 pt-16 pb-12 px-4">
        <Loader size="lg" text="Checking verification status..." />
      </div>
    )
  }

  // Success state
  if (view === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 pt-16 pb-12 px-4">
        <Card variant="bordered" padding="lg" className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Email Verified!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Your email has been successfully verified. You can now sign in to your account.
          </p>
          <Button onClick={() => router.push('/login')} icon={<ArrowRight className="h-4 w-4" />} size="lg">
            Continue to Sign In
          </Button>
        </Card>
      </div>
    )
  }

  // Check inbox state (after signup or resend)
  if (view === 'check_inbox') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4">
        <div className="max-w-md w-full">
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Check Your Email</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              We sent a verification link to:
            </p>
            <p className="text-brand-600 font-medium text-sm mb-6 break-all">
              {email || 'your email address'}
            </p>
            <p className="text-gray-500 text-xs mb-6">
              Click the link in the email to verify your account. The link expires in 24 hours.
            </p>

            {resendMessage && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-4">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                {resendMessage}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={handleResend}
                loading={resendLoading}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Resend Verification Email
              </Button>
              <Button
                variant="secondary"
                onClick={() => setView('enter_code')}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Enter 6-Digit Code Instead
              </Button>
            </div>

            <p className="text-xs text-center text-gray-400 mt-6">
              Wrong email?{' '}
              <button onClick={() => router.push('/signup')} className="text-brand-600 hover:underline font-medium">
                Sign up again
              </button>
            </p>
          </Card>
        </div>
      </div>
    )
  }

  // Enter code / Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {error && !email ? 'Invalid Link' : 'Enter Verification Code'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {error && !email
              ? 'The verification link may have expired. Enter your email and the 6-digit code to verify manually.'
              : 'Enter the 6-digit code sent to your email address.'}
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-fade-in">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Email input (shown if we don't know the email yet) */}
            {!email && (
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}

            {/* 6-digit OTP input */}
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val.length === 1) {
                      const nextInput = e.target.nextElementSibling as HTMLInputElement
                      if (nextInput) nextInput.focus()
                    }
                    if (!/^\d*$/.test(val)) return
                    setOtp(prev => {
                      const newOtp = [...prev]
                      newOtp[index] = val
                      return newOtp
                    })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && index > 0) {
                      const prevInput = e.target.previousElementSibling as HTMLInputElement
                      if (prevInput) prevInput.focus()
                    }
                  }}
                  className="w-12 h-14 text-center text-2xl font-bold text-gray-900 dark:text-gray-100 rounded-xl border-2 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              ))}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={view === 'loading'}
              disabled={otp.join('').length !== 6 || !email}
            >
              Verify Account
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3 mt-6">
            <button
              onClick={handleResend}
              disabled={resendLoading || !email}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
            <p className="text-xs text-gray-400">
              <button onClick={() => router.push('/login')} className="text-brand-600 hover:underline font-medium">
                Back to Sign In
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-16"><Loader size="lg" text="Loading..." /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}