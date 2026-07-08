'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { PLANS } from '@/lib/utils/constants'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, CreditCard, Loader2, AlertTriangle } from 'lucide-react'
import { useState, useEffect, Suspense, useCallback } from 'react'
import { getVariantId, createCheckoutUrl } from '@/lib/payments/plans'

function PricingContent() {
  const { isAuthenticated, profile, session, refreshProfile } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const highlightedPlan = searchParams.get('plan')
  const currentPlanId = profile?.plan_id || 'free'

  // PayPal state
  const [paypalLoading, setPaypalLoading] = useState<string | null>(null) // tracks which plan is loading
  const [paypalError, setPaypalError] = useState<string | null>(null)
  const [captureLoading, setCaptureLoading] = useState(false)

  // PayPal return handling
  const paypalStatus = searchParams.get('paypal')

  useEffect(() => {
    if (paypalStatus === 'success' || paypalStatus === 'cancelled') {
      // Clean URL without refreshing the page
      const url = new URL(window.location.href)
      url.searchParams.delete('paypal')
      window.history.replaceState({}, '', url.toString())
    }
  }, [paypalStatus])

  const handleFreePlan = () => {
    if (isAuthenticated) {
      router.push('/generate')
    } else {
      router.push('/signup')
    }
  }

  const handleLemonSqueezyCheckout = useCallback(
    async (planId: string, interval: 'monthly' | 'yearly') => {
      if (!isAuthenticated || !session) {
        router.push(`/signup?redirect=/pricing?plan=${planId}`)
        return
      }

      const variantId = getVariantId(planId as 'pro' | 'unlimited', interval)
      if (!variantId) {
        alert('Payment is being configured. Please try again later.')
        return
      }

      const checkoutUrl = createCheckoutUrl(
        variantId,
        session.user.id,
        session.user.email || ''
      )
      window.location.href = checkoutUrl
    },
    [isAuthenticated, session, router]
  )

  const handlePayPalCheckout = useCallback(
    async (planId: 'pro' | 'unlimited', interval: 'monthly' | 'yearly') => {
      if (!isAuthenticated) {
        router.push(`/signup?redirect=/pricing?plan=${planId}`)
        return
      }

      setPaypalError(null)
      setPaypalLoading(planId)

      try {
        const response = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, interval }),
        })

        const data = await response.json()

        if (!response.ok) {
          setPaypalError(data.error || 'Failed to create PayPal order')
          return
        }

        // Store plan info for capture after redirect
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'paypal_pending_order',
            JSON.stringify({ orderId: data.orderId, planId, interval })
          )
        }

        // Redirect to PayPal approval
        window.location.href = data.approvalUrl
      } catch {
        setPaypalError('Something went wrong. Please try again.')
      } finally {
        setPaypalLoading(null)
      }
    },
    [isAuthenticated, router]
  )

  // Handle PayPal return — capture the order
  useEffect(() => {
    if (paypalStatus !== 'success') return

    const pending = sessionStorage.getItem('paypal_pending_order')
    if (!pending) return

    let parsed: { orderId: string; planId: string; interval: string }
    try {
      parsed = JSON.parse(pending)
    } catch {
      return
    }

    async function captureOrder() {
      setCaptureLoading(true)
      try {
        const response = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: parsed.orderId,
            planId: parsed.planId,
            interval: parsed.interval,
          }),
        })

        if (response.ok) {
          await refreshProfile()
          router.push('/dashboard?upgraded=true')
        } else {
          const data = await response.json()
          setPaypalError(data.error || 'Payment capture failed')
        }
      } catch {
        setPaypalError('Failed to complete payment. Please contact support.')
      } finally {
        setCaptureLoading(false)
        sessionStorage.removeItem('paypal_pending_order')
      }
    }

    captureOrder()
  }, [paypalStatus, refreshProfile, router])

  if (captureLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-gray-600">Completing your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Choose the Right Plan for You</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Start free, upgrade when you&apos;re ready.</p>
        </div>

        {/* PayPal status banner */}
        {paypalStatus === 'cancelled' && (
          <div className="mb-6 max-w-lg mx-auto p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              PayPal payment was cancelled. No charges were made.
            </p>
          </div>
        )}

        {paypalError && (
          <div className="mb-6 max-w-lg mx-auto p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{paypalError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const isHighlighted = highlightedPlan
              ? highlightedPlan === plan.id
              : plan.highlighted
            const isCurrentPlan = plan.id === currentPlanId
            const isPaidPlan = plan.price > 0
            const isPaypalLoading = paypalLoading === plan.id

            return (
              <Card
                key={plan.id}
                variant={isHighlighted ? 'elevated' : 'bordered'}
                padding="lg"
                className={`relative flex flex-col ${isHighlighted ? 'border-2 border-brand-500' : ''}`}
              >
                {isHighlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-600 text-white text-sm font-medium px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Recommended
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">${plan.price}</span>
                    {plan.price > 0 && <span className="text-gray-500 text-lg">/month</span>}
                  </div>
                  {plan.priceYearly > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      or ${plan.priceYearly}/year{' '}
                      <span className="text-green-600 font-medium">
                        (save ${plan.price * 12 - plan.priceYearly})
                      </span>
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto space-y-3">
                  {isCurrentPlan ? (
                    <Button variant="secondary" className="w-full" size="lg" disabled>
                      Current Plan
                    </Button>
                  ) : !isAuthenticated && isPaidPlan ? (
                    <Button
                      variant={isHighlighted ? 'primary' : 'secondary'}
                      className="w-full"
                      size="lg"
                      onClick={() => router.push(`/signup?redirect=/pricing?plan=${plan.id}`)}
                    >
                      Get Started
                    </Button>
                  ) : isPaidPlan ? (
                    <>
                      {/* Pay with Card (Lemon Squeezy) */}
                      <Button
                        variant={isHighlighted ? 'primary' : 'secondary'}
                        className="w-full"
                        size="lg"
                        onClick={() =>
                          handleLemonSqueezyCheckout(plan.id, 'monthly')
                        }
                        icon={<CreditCard className="h-4 w-4" />}
                      >
                        Pay with Card
                      </Button>

                      {/* Pay with PayPal */}
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() =>
                          handlePayPalCheckout(plan.id as 'pro' | 'unlimited', 'monthly')
                        }
                        loading={isPaypalLoading}
                        icon={
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"
                              fill="#003087"
                            />
                            <path
                              d="M21.222 6.917c-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788l.06-.26.96-6.09.062-.336a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471a3.627 3.627 0 0 0-.714-.751z"
                              fill="#0070E0"
                            />
                            <path
                              d="M8.73 7.17a.925.925 0 0 1 .36-.078h5.36c.634 0 1.228.042 1.775.13.155.025.307.054.455.088.148.034.292.073.432.117a4.87 4.87 0 0 1 .569.2c.93 4.778-4.006 7.2-9.138 7.2h-2.19a.563.563 0 0 0-.556.48l-1.262 7.998a.296.296 0 0 1-.293.248h-3.06a.467.467 0 0 1-.461-.539L2.84 1.244a.558.558 0 0 1 .552-.468h5.36c.434 0 .8.316.87.745l.108.65z"
                              fill="#003087"
                            />
                            <path
                              d="M17.185 7.21a6.97 6.97 0 0 0-.455-.088 11.27 11.27 0 0 0-1.775-.13h-5.36a.925.925 0 0 0-.91.775l-1.145 7.25-.033.21a.563.563 0 0 1 .555-.48h2.19c5.132 0 8.208-2.422 9.138-7.2a4.87 4.87 0 0 0-.569-.2 8.043 8.043 0 0 0-.636-.137z"
                              fill="#0070E0"
                            />
                          </svg>
                        }
                      >
                        Pay with PayPal
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant={isHighlighted ? 'primary' : 'secondary'}
                      className="w-full"
                      size="lg"
                      onClick={handleFreePlan}
                    >
                      Get Started Free
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-16">
          <p>Loading...</p>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  )
}