'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { PLANS } from '@/lib/utils/constants'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export function PricingPreview() {
  const { isAuthenticated, profile } = useAuth()
  const [setupMessage, setSetupMessage] = useState<string | null>(null)

  function handleFreePlan() {
    if (isAuthenticated) {
      window.location.href = '/generate'
    } else {
      window.location.href = '/signup'
    }
  }

  function handleUpgrade(planId: string) {
    if (!isAuthenticated || !profile) {
      window.location.href = `/signup?redirect=/pricing?plan=${planId}`
      return
    }
    
    setSetupMessage(`Payment integration is being set up. Connect Lemon Squeezy to enable the ${planId} plan.`)
    setTimeout(() => setSetupMessage(null), 5000)
  }

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-gray-900 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              variant={plan.highlighted ? 'elevated' : 'bordered'}
              padding="lg"
              className={`relative flex flex-col ${plan.highlighted ? 'border-2 border-brand-500 scale-105' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">/month</span>
                  )}
                </div>
                {plan.priceYearly > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    ${plan.priceYearly}/year (save ${plan.price * 12 - plan.priceYearly})
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
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
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                    size="lg"
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    Upgrade Now
                  </Button>
                )}

                {setupMessage && plan.price > 0 && (
                  <div className="mt-3 p-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2 animate-fade-in">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">{setupMessage}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}