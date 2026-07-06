'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useUsage } from '@/hooks/use-usage'
import { useGenerate } from '@/hooks/use-generate'
import { PropertyForm } from '@/components/generate/property-form'
import { OutputDisplay } from '@/components/generate/output-display'
import { UsageCounter } from '@/components/generate/usage-counter'
import { PaywallModal } from '@/components/shared/paywall-modal'
import { Loader } from '@/components/ui/loader'
import type { PropertyInput } from '@/types'

export default function GeneratePage() {
  const { isAuthenticated, isLoading: authLoading, planId } = useAuth()
  const { output, isGenerating, error, generate, reset } = useGenerate()
  const { usage, hasReachedLimit, incrementUsage } = useUsage()
  const [showPaywall, setShowPaywall] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/generate')
    }
  }, [isAuthenticated, authLoading, router])

  // Listen for the custom event from the form instead of using props
    // Listen for the custom event from the form instead of using props
  useEffect(() => {
    async function handleGenerationEvent(e: Event) {
      const customEvent = e as CustomEvent
      const input = customEvent.detail as PropertyInput

      if (hasReachedLimit && planId === 'free') {
        setShowPaywall(true)
        return
      }

      await generate(input)
      incrementUsage()
    }

    window.addEventListener('start-generation', handleGenerationEvent)
    return () => window.removeEventListener('start-generation', handleGenerationEvent)
  }, [generate, hasReachedLimit, incrementUsage, planId])

  // ADD THIS NEW LISTENER FOR THE PLATFORM LOCK:
  useEffect(() => {
    function handleShowPaywall() {
      // Only show paywall for free users - paid plans have full access
      if (planId === 'free') {
        setShowPaywall(true)
      }
    }
    window.addEventListener('show-paywall', handleShowPaywall)
    return () => window.removeEventListener('show-paywall', handleShowPaywall)
  }, [planId])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader size="lg" text="Loading..." />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Generate Ad Copy</h1>
            <p className="text-gray-600 mt-1">Fill in your property details and let AI do the magic.</p>
          </div>
          <UsageCounter />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              {/* Notice we removed the onSubmit prop completely */}
              <PropertyForm planId={planId} />
            </div>
          </div>

          <div className="space-y-6">
            <OutputDisplay
              output={output}
              isGenerating={isGenerating}
              error={error}
              platform={undefined}
              onReset={reset}
            />

            {!output && !isGenerating && !error && (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Your ad copy will appear here</h3>
                <p className="text-sm text-gray-500">Fill in the form and click generate to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        usedGenerations={usage.used}
      />
    </div>
  )
}