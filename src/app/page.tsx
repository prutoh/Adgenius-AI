import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Testimonials } from '@/components/landing/testimonials'
import { PricingPreview } from '@/components/landing/pricing-preview'
import { CTA } from '@/components/landing/cta'

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <PricingPreview />
      <CTA />
    </>
  )
}