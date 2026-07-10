'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTA() {
  const { isAuthenticated } = useAuth()

  // If logged in, go to Generate. If logged out, go to Signup.
  const targetUrl = isAuthenticated ? '/generate' : '/signup'
  const buttonText = isAuthenticated ? 'Start Generating' : 'Get Started for Free'

  return (
    <section className="py-24 bg-gradient-to-br from-brand-600 to-brand-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900/10 rounded-full mb-8">
          <Sparkles className="h-4 w-4 text-brand-200" />
          <span className="text-sm text-brand-100">Free to start - No credit card required</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Create Your First Ad?
        </h2>

        <p className="text-lg text-brand-200 max-w-2xl mx-auto mb-10">
          Join hundreds of real estate professionals who are saving time and getting better results with AI-powered copy.
        </p>

        <a href={targetUrl}>
          <Button
            size="lg"
            className="text-base px-8 bg-white dark:bg-gray-900 text-brand-700 hover:bg-brand-50"
          >
            {buttonText}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </a>
      </div>
    </section>
  )
}