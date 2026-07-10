import { Plan, PlanId } from '@/types'

/**
 * Get plan by ID
 */
export function getPlan(planId: PlanId): Plan | undefined {
  return PLANS.find(p => p.id === planId)
}

/**
 * Get Lemon Squeezy variant ID for a plan
 */
export function getVariantId(planId: PlanId, interval: 'monthly' | 'yearly'): string {
  const envKey = planId === 'pro' 
    ? interval === 'monthly' 
      ? 'LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID'
      : 'LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID'
    : interval === 'monthly'
      ? 'LEMON_SQUEEZY_UNLIMITED_MONTHLY_VARIANT_ID'
      : 'LEMON_SQUEEZY_UNLIMITED_YEARLY_VARIANT_ID'

  return process.env[envKey] || ''
}

/**
 * Create Lemon Squeezy checkout URL
 */
export function createCheckoutUrl(
  variantId: string,
  userId: string,
  userEmail: string
): string {
  // Store SLUG is used in the checkout URL (the subdomain), NOT the numeric store ID
  // e.g. if store URL is https://my-store.lemonsqueezy.com, slug = "my-store"
  const storeSlug = process.env.LEMON_SQUEEZY_STORE_SLUG
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const url = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][user_id]=${userId}&checkout[email]=${userEmail}&checkout[redirect_url]=${encodeURIComponent(`${appUrl}/dashboard?upgraded=true`)}`

  console.log('[LemonSqueezy] Checkout URL:', url)
  return url
}

/**
 * Get Lemon Squeezy management portal URL
 */
export function getManagementUrl(): string {
  const storeSlug = process.env.LEMON_SQUEEZY_STORE_SLUG
  return `https://${storeSlug}.lemonsqueezy.com/billing`
}

// Re-export plans from constants
import { PLANS } from '@/lib/utils/constants'
export { PLANS }