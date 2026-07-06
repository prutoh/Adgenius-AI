import crypto from 'crypto'

/**
 * Verify Lemon Squeezy webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    console.error('LEMON_SQUEEZY_WEBHOOK_SECRET is not set')
    return false
  }

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Parse Lemon Squeezy webhook event
 */
export interface LemonSqueezyEvent {
  meta: {
    event_name: string
    custom_data: {
      user_id: string
    }
  }
  data: {
    id: string
    attributes: {
      renewal_price: any
      status: string
      product_id: number
      variant_id: number
      user_email: string
      created_at: string
      updated_at: string
      ends_at: string | null
      renews_at: string | null
      trial_ends_at: string | null
    }
  }
}

/**
 * Map Lemon Squeezy status to our internal status
 */
export function mapSubscriptionStatus(
  lsStatus: string
): 'active' | 'cancelled' | 'past_due' | 'expired' {
  const statusMap: Record<string, 'active' | 'cancelled' | 'past_due' | 'expired'> = {
    active: 'active',
    paused: 'active',
    pending: 'past_due',
    past_due: 'past_due',
    cancelled: 'cancelled',
    expired: 'expired',
    unpaid: 'past_due',
  }

  return statusMap[lsStatus] || 'expired'
}

/**
 * Map variant ID to plan ID
 */
export function mapVariantToPlan(variantId: number): 'pro' | 'unlimited' | null {
  const proMonthly = process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID
  const proYearly = process.env.LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID
  const unlimitedMonthly = process.env.LEMON_SQUEEZY_UNLIMITED_MONTHLY_VARIANT_ID
  const unlimitedYearly = process.env.LEMON_SQUEEZY_UNLIMITED_YEARLY_VARIANT_ID

  if (variantId.toString() === proMonthly || variantId.toString() === proYearly) {
    return 'pro'
  }
  if (variantId.toString() === unlimitedMonthly || variantId.toString() === unlimitedYearly) {
    return 'unlimited'
  }
  return null
}