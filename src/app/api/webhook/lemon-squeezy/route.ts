import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyWebhookSignature, mapSubscriptionStatus, mapVariantToPlan } from '@/lib/payments/lemon-squeezy' // Note: Fixed your typo 'lemon-schurey' -> 'lemon-squeezy'
import type { LemonSqueezyEvent } from '@/lib/payments/lemon-squeezy'
import { sendEmail } from '@/lib/emails/client'
import { getWelcomeEmailTemplate } from '@/lib/emails/templates/welcome-email'
import { getInvoiceEmailTemplate } from '@/lib/emails/templates/invoice-email'

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature') || ''

    // 2. Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 3. Parse event
    const event: LemonSqueezyEvent = JSON.parse(rawBody)
    const { meta, data } = event

    // We only care about subscription events
    if (!meta.custom_data?.user_id) {
      return NextResponse.json({ received: true })
    }

    const userId = meta.custom_data.user_id
    const supabase = createServerSupabaseClient()

    // Handle different events
    switch (meta.event_name) {
      case 'subscription_created':
      case 'subscription_updated': {
        const planId = mapVariantToPlan(data.attributes.variant_id)
        const status = mapSubscriptionStatus(data.attributes.status)
        const isRenewal = meta.event_name === 'subscription_updated'
        
        if (planId) {
            // 1. Upsert subscription
            await supabase.from('subscriptions').upsert({
              user_id: userId,
              plan_id: planId,
              status: status,
              current_period_start: data.attributes.created_at,
              current_period_end: data.attributes.renews_at,
              lemon_squeezy_subscription_id: data.id.toString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'lemon_squeezy_subscription_id' })

            // 2. Update user profile plan (ONLY if active)
            if (status === 'active') {
              await supabase
                .from('profiles')
                .update({ plan_id: planId })
                .eq('id', userId)

              // 3. Fetch user name OUTSIDE the if-statement
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .single()
              
              const userName = profile?.full_name || 'Valued Customer'

              // 4. Send Welcome Email (ONLY on first purchase, not renewals)
              if (!isRenewal) {
                // FIX: Use fallback values in case Lemon Squeezy doesn't provide the price
                const price = data.attributes.renewal_price?.toString() || (planId === 'pro' ? '9' : '29')
                sendEmail({
                  to: data.attributes.user_email,
                  subject: 'Welcome to AdGenius AI! 🚀',
                  html: getWelcomeEmailTemplate(userName, `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`, price)
                })
              }

              // 5. Generate Invoice ID and Send Invoice Email
              const invoiceId = `INV-${Date.now().toString(36).toUpperCase()}`
              const price = data.attributes.renewal_price?.toString() || (planId === 'pro' ? '9' : '29')
              const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              
              sendEmail({
                to: data.attributes.user_email,
                subject: `Your AdGenius AI Invoice #${invoiceId}`,
                html: getInvoiceEmailTemplate(invoiceId, userName, `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`, price, date)
              })
            }
          }
          break
        }

        case 'subscription_cancelled':
        case 'optional_subscription_expired':
        case 'subscription_expired': {
          const status = mapSubscriptionStatus(data.attributes.status)
        
        await supabase
          .from('subscriptions')
          .update({ status: status, updated_at: new Date().toISOString() })
          .eq('lemon-squeezy_subscription_id', data.id.toString())

        if (status === 'expired' || status === 'cancelled') {
          await supabase
            .from('profiles')
            .update({ plan_id: 'free' })
            .eq('id', userId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}