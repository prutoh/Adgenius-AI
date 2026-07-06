'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { PLANS } from '@/lib/utils/constants'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, AlertTriangle } from 'lucide-react'
import { useState, Suspense } from 'react'

function PricingContent() {
  const { isAuthenticated, profile } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const highlightedPlan = searchParams.get('plan')
  const [setupMessage, setSetupMessage] = useState<string | null>(null)

  function handleFreePlan() {
    if (isAuthenticated) {
      router.push('/generate')
    } else {
      router.push('/signup')
    }
  }

  function handleUpgrade(planId: string) {
    if (!isAuthenticated) {
      router.push(`/signup?redirect=/pricing?plan=${planId}`)
      return
    }
    
    setSetupMessage(`Payment integration is being set up. Connect Lemon Squeezy to enable the ${planId} plan.`)
    setTimeout(() => setSetupMessage(null), 5000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">Choose the Right Plan for You</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Start free, upgrade when you&apos;re ready.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const isHighlighted = highlightedPlan 
              ? highlightedPlan === plan.id 
              : plan.highlighted

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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    {plan.price > 0 && <span className="text-gray-500 text-lg">/month</span>}
                  </div>
                  {plan.priceYearly > 0 && <p className="text-sm text-gray-500 mt-2">or ${plan.priceYearly}/year <span className="text-green-600 font-medium">(save ${plan.price * 12 - plan.priceYearly})</span></p>}
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="h-3 w-3 text-green-600" /></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto">
                  {plan.price === 0 ? (
                    isAuthenticated ? (
                      <Button variant="secondary" className="w-full" size="lg" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" size="lg" onClick={handleFreePlan}>
                        Get Started Free
                      </Button>
                    )
                  ) : (
                    <Button 
                      variant={isHighlighted ? 'primary' : 'secondary'} 
                      className="w-full" 
                      size="lg" 
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  )}

                  {setupMessage && plan.price > 0 && (
                    <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 animate-fade-in">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-700">{setupMessage}</p>
                    </div>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-16"><p>Loading...</p></div>}>
      <PricingContent />
    </Suspense>
  )
}