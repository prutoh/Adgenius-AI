import { NextRequest, NextResponse } from 'next/server'
import { getVariantId, createCheckoutUrl } from '@/lib/payments/plans'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const VALID_PLANS = ['pro', 'unlimited'] as const
const VALID_INTERVALS = ['monthly', 'yearly'] as const

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, interval } = body

    if (!VALID_PLANS.includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    if (!VALID_INTERVALS.includes(interval)) {
      return NextResponse.json({ error: 'Invalid billing interval' }, { status: 400 })
    }

    const variantId = getVariantId(planId, interval)
    console.log('[Checkout] planId:', planId, 'interval:', interval, 'variantId:', variantId)
    if (!variantId) {
      console.error('[Checkout] Missing variant ID. Check env vars for plan:', planId, 'interval:', interval)
      return NextResponse.json(
        { error: 'Payment is being configured. Please try again later.' },
        { status: 503 }
      )
    }

    if (!process.env.LEMON_SQUEEZY_STORE_SLUG) {
      console.error('[Checkout] LEMON_SQUEEZY_STORE_SLUG is not set in environment')
      return NextResponse.json(
        { error: 'Payment configuration is incomplete (missing store slug). Please contact support.' },
        { status: 503 }
      )
    }

    const checkoutUrl = createCheckoutUrl(
      variantId,
      user.id,
      user.email || ''
    )

    console.log('[Checkout] Generated URL:', checkoutUrl)
    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout. Please try again.' },
      { status: 500 }
    )
  }
}