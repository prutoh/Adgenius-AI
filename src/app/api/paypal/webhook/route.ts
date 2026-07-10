import { NextRequest, NextResponse } from 'next/server'
import { verifyPayPalWebhook } from '@/lib/payments/paypal'
import { createAdminClient } from '@/lib/supabase/server'

interface PayPalWebhookEvent {
  event_type: string
  resource: {
    id: string
    state?: string
    amount?: { currency_code: string; value: string }
    custom_id?: string
    create_time?: string
    supplemental_data?: {
      common?: {
        cart_id?: string
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    // 1. Verify webhook signature
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      if (key.startsWith('paypal-')) {
        headers[key] = value
      }
    })

    const isValid = await verifyPayPalWebhook(headers, rawBody)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const event: PayPalWebhookEvent = JSON.parse(rawBody)
    const { event_type, resource } = event

    // 2. Handle payment capture completed
    if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const admin = createAdminClient()
      const paypalOrderId = resource.id

      // Find the invoice by PayPal order ID
      const { data: invoice } = await admin
        .from('invoices')
        .select('id, user_id, plan_id')
        .eq('paypal_order_id', paypalOrderId)
        .single()

      if (invoice) {
        // Update invoice status to paid
        await admin
          .from('invoices')
          .update({ status: 'paid' })
          .eq('id', invoice.id)

        // Update subscription status
        await admin
          .from('subscriptions')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('user_id', invoice.user_id)
          .eq('status', 'past_due')
      }
    }

    // 3. Handle payment capture denied/refunded
    if (event_type === 'PAYMENT.CAPTURE.DENIED' || event_type === 'PAYMENT.CAPTURE.REFUNDED') {
      const admin = createAdminClient()
      const paypalOrderId = resource.id

      const { data: invoice } = await admin
        .from('invoices')
        .select('id, user_id')
        .eq('paypal_order_id', paypalOrderId)
        .single()

      if (invoice) {
        const newStatus = event_type === 'PAYMENT.CAPTURE.DENIED' ? 'failed' : 'refunded'
        await admin
          .from('invoices')
          .update({ status: newStatus })
          .eq('id', invoice.id)

        // If denied, downgrade the user
        if (newStatus === 'failed') {
          await admin
            .from('profiles')
            .update({ plan_id: 'free' })
            .eq('id', invoice.user_id)

          await admin
            .from('subscriptions')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('user_id', invoice.user_id)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}