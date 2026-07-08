'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PLANS, FREE_TIER_LIMIT } from '@/lib/utils/constants'
import { X, Sparkles, Zap, Infinity } from 'lucide-react'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  usedGenerations: number
}

export function PaywallModal({ isOpen, onClose, usedGenerations }: PaywallModalProps) {
  if (!isOpen) return null

  const planIcons = {
    pro: <Zap className="h-6 w-6" />,
    unlimited: <Infinity className="h-6 w-6" />,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            You&apos;ve used all {FREE_TIER_LIMIT} free generations
          </h2>
          <p className="text-gray-500">
            Upgrade to keep creating high-converting ad copy
          </p>
        </div>

        <div className="space-y-4">
          {PLANS.filter(p => p.id !== 'free').map((plan) => (
            <Card
              key={plan.id}
              variant={plan.highlighted ? 'bordered' : 'default'}
              padding="md"
              className={plan.highlighted ? 'border-brand-500 relative' : ''}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-brand-50 dark:bg-brand-900/30 rounded-lg text-brand-600">
                  {planIcons[plan.id as 'pro' | 'unlimited']}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                    <div className="text-right">
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {plan.generations ? `${plan.generations} generations/month` : 'Unlimited generations'}
                  </p>
                  <ul className="space-y-1 mb-4">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/pricing?plan=${plan.id}`}>
                    <Button
                      variant={plan.highlighted ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full"
                    >
                      Upgrade to {plan.name}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}