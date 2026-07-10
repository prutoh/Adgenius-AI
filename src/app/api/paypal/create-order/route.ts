import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createPayPalOrder } from '@/lib/payments/paypal'
import type { PlanId } from '@/types'

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
    const { planId, interval } = body as {
      planId: 'pro' | 'unlimited'
      interval: 'monthly' | 'yearly'
    }

    if (!planId || !['pro', 'unlimited'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan. Must be pro or unlimited.' }, { status: 400 })
    }

    if (!interval || !['monthly', 'yearly'].includes(interval)) {
      return NextResponse.json({ error: 'Invalid interval. Must be monthly or yearly.' }, { status: 400 })
    }

    // 3. Create PayPal order
    const result = await createPayPalOrder(planId, interval)

    return NextResponse.json({
      orderId: result.orderId,
      approvalUrl: result.approvalUrl,
    })
  } catch (error) {
    console.error('PayPal create-order error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create PayPal order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}