'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { CheckCircle, AlertCircle, Mail, ArrowRight } from 'lucide-react'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const token = searchParams.get('token')
  const [otp, setOtp] = useState(['', '', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // If there is no token in the URL, show an error message
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing verification link. Please click the link in your email.')
    }
  }, [token])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    // Join the 6 individual inputs back into a single string
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit code.')
      setIsLoading(false)
      return
    }

    try {
      // Verify the OTP code using Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        token: otpCode,
        type: 'email',
      })

      if (error) {
        const errorMessage = error.message || 'Verification failed.'
        
        // Handle expired tokens gracefully
        if (errorMessage.toLowerCase().includes('expired')) {
          setError('This verification link has expired. Please request a new one from the login page.')
        } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('wrong')) {
          setError('Incorrect code. Please check your email and try again.')
        } else {
          setError(errorMessage)
        }
        setIsLoading(false)
        return
      }

      // Success! Redirect to Generate page
      setSuccess(true)
      
      // Wait 2 seconds to show the success state before redirecting
      setTimeout(() => {
        router.push('/generate')
      }, 2000)

    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  // If there's an error or no token, don't show the form
  if (!token || error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 pt-16 pb-12 px-4">
        <Card variant="bordered" padding="lg" className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Invalid Link</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {error || 'The verification link is invalid or missing. Please check your email for the 6-digit code or request a new one from the login page.'}
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </div>
          </Card>
        </div>
    )
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 pt-16 pb-12 px-4">
        <Loader size="lg" text="Verifying your email..." />
      </div>
    )
  }

  // Success State
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 pt-16 pb-12 px-4">
        <Card variant="bordered" padding="lg" className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Verification Complete!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            Your email has been successfully verified. You can now sign in to your account.
          </p>
          <p className="text-gray-500 text-xs mb-6">
            Click the button below to continue to the sign-in page.
          </p>
          <Button onClick={() => router.push('/login')} icon={<ArrowRight className="h-4 w-4" />}>
            Continue to Sign In
          </Button>
        </Card>
      </div>
    )
  }

  // Default State (Ready to enter code)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Check Your Email</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
            We just sent a 6-digit code to your email address. Enter it below to verify your account.
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleVerify}>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-6 animate-fade-in">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-center mb-6">
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
                      // Auto-focus the next input
                      const nextInput = e.target.nextElementSibling as HTMLInputElement
                      if (nextInput) nextInput.focus()
                    }
                    // Only allow numbers
                    if (!/^\d*$/.test(val)) return
                    
                    setOtp(prev => {
                      const newOtp = [...prev]
                      newOtp[index] = val
                      return newOtp
                    })
                  }}
                  className="w-12 h-14 text-center text-2xl font-bold text-gray-900 dark:text-gray-100 rounded-xl border-2 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              ))}
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full mt-4"
              loading={isLoading}
              disabled={otp.join('').length !== 6}
            >
              Verify Account
            </Button>
          </form>
          
          <p className="text-xs text-center text-gray-400 mt-4">
            Didn't receive an email? <button onClick={() => router.push('/login')} className="text-brand-600 hover:underline font-medium">Request a new code here</button>
          </p>
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