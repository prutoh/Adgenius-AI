import { PlanId } from '@/types'
import { PLANS } from '@/lib/utils/constants'

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || ''
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || ''

let accessTokenCache: { token: string; expiresAt: number } | null = null

/**
 * Get PayPal access token using client credentials
 */
async function getAccessToken(): Promise<string> {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal auth failed: ${error}`)
  }

  const data = await response.json()
  accessTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // expire 60s early
  }

  return data.access_token
}

/**
 * Get the price for a plan based on interval
 */
function getPlanPrice(planId: PlanId, interval: 'monthly' | 'yearly'): number {
  const plan = PLANS.find((p) => p.id === planId)
  if (!plan) throw new Error(`Invalid plan: ${planId}`)
  return interval === 'monthly' ? plan.price : plan.priceYearly
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(
  planId: 'pro' | 'unlimited',
  interval: 'monthly' | 'yearly'
): Promise<{ orderId: string; approvalUrl: string }> {
  const accessToken = await getAccessToken()
  const amount = getPlanPrice(planId, interval)

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `${planId}-${interval}`,
          description: `AdGenius AI ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - ${interval === 'monthly' ? 'Monthly' : 'Yearly'}`,
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'AdGenius AI',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?paypal=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?paypal=cancelled`,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal create order failed: ${error}`)
  }

  const data = await response.json()
  const approvalLink = data.links?.find(
    (link: { rel: string; href: string }) => link.rel === 'approve'
  )

  if (!approvalLink) {
    throw new Error('PayPal approval URL not found')
  }

  return {
    orderId: data.id,
    approvalUrl: approvalLink.href,
  }
}

/**
 * Capture a PayPal order
 */
export async function capturePayPalOrder(orderId: string): Promise<{
  id: string
  status: string
  amount: string
  currency: string
  payerEmail: string
  createTime: string
}> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal capture failed: ${error}`)
  }

  const data = await response.json()

  if (data.status !== 'COMPLETED') {
    throw new Error(`PayPal order not completed. Status: ${data.status}`)
  }

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0]

  return {
    id: data.id,
    status: data.status,
    amount: capture?.amount?.value || '0.00',
    currency: capture?.amount?.currency_code || 'USD',
    payerEmail: data.payer?.email_address || '',
    createTime: data.create_time,
  }
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.error('PAYPAL_WEBHOOK_ID is not set')
    return false
  }

  const accessToken = await getAccessToken()

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    }
  )

  if (!response.ok) {
    console.error('PayPal webhook verification request failed')
    return false
  }

  const data = await response.json()
  return data.verification_status === 'SUCCESS'
}