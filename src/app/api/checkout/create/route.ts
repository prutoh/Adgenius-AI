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
    if (!variantId) {
      return NextResponse.json(
        { error: 'Payment is being configured. Please try again later.' },
        { status: 503 }
      )
    }

    const checkoutUrl = createCheckoutUrl(
      variantId,
      user.id,
      user.email || ''
    )

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout. Please try again.' },
      { status: 500 }
    )
  }
}