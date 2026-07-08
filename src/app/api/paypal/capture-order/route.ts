import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { capturePayPalOrder } from '@/lib/payments/paypal'
import { createInvoice } from '@/lib/payments/invoices'
import { sendEmail } from '@/lib/emails/client'
import { getSubscriptionWelcomeEmail } from '@/lib/emails/templates'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate request body
    const body = await request.json()
    const { orderId, planId, interval } = body as {
      orderId: string
      planId: 'pro' | 'unlimited'
      interval: 'monthly' | 'yearly'
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    if (!planId || !['pro', 'unlimited'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // 3. Capture the PayPal order
    const capture = await capturePayPalOrder(orderId)

    // 4. Fetch the user's current profile to determine if this is an upgrade
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('plan_id, full_name, email')
      .eq('id', user.id)
      .single()

    const previousPlan = currentProfile?.plan_id || 'free'
    const userName = currentProfile?.full_name || 'Valued Customer'
    const userEmail = currentProfile?.email || user.email || ''

    // 5. Update user profile plan
    await supabase
      .from('profiles')
      .update({ plan_id: planId, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    // 6. Create or update subscription record
    const now = new Date()
    const periodEnd = new Date(now)
    if (interval === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }

    // Check for existing active subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingSub) {
      await supabase
        .from('subscriptions')
        .update({
          plan_id: planId,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSub.id)
    } else {
      await supabase.from('subscriptions').insert({
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
    }

    // 7. Create invoice
    const invoice = await createInvoice(
      user.id,
      planId,
      parseFloat(capture.amount),
      interval
    )

    // Update invoice with PayPal order ID
    if (invoice) {
      await supabase
        .from('invoices')
        .update({ paypal_order_id: capture.id, status: 'paid' })
        .eq('id', invoice.id)
    }

    // 8. Send subscription email
    const planDisplayName = planId.charAt(0).toUpperCase() + planId.slice(1)
    const action = previousPlan === 'free' ? 'new' : 'upgrade'

    if (userEmail) {
      const subject =
        action === 'new'
          ? `Welcome to AdGenius AI ${planDisplayName}! 🚀`
          : `Upgraded to ${planDisplayName} Plan! 🎉`

      sendEmail({
        to: userEmail,
        subject,
        html: getSubscriptionWelcomeEmail({
          userName,
          planName: `${planDisplayName} Plan`,
          price: capture.amount,
          interval,
          action,
          oldPlan: previousPlan === 'free' ? 'Free' : previousPlan.charAt(0).toUpperCase() + previousPlan.slice(1),
        }),
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully activated ${planDisplayName} plan`,
      invoiceNumber: invoice?.invoice_number,
    })
  } catch (error) {
    console.error('PayPal capture-order error:', error)
    const message = error instanceof Error ? error.message : 'Failed to capture PayPal order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}