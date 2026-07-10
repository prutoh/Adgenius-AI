import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createInvoice } from '@/lib/payments/invoices'
import type { PlanId } from '@/types'

// GET: Fetch user's invoices
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch invoices error:', error)
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('GET invoices error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// POST: Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, amount, interval, paypalOrderId, lemonSqueezyOrderId, status } = body as {
      planId: PlanId
      amount: number
      interval: 'monthly' | 'yearly'
      paypalOrderId?: string
      lemonSqueezyOrderId?: string
      status?: 'paid' | 'pending' | 'failed' | 'refunded'
    }

    if (!planId || amount === undefined || !interval) {
      return NextResponse.json(
        { error: 'planId, amount, and interval are required' },
        { status: 400 }
      )
    }

    const invoice = await createInvoice(user.id, planId, amount, interval, {
      paypalOrderId,
      lemonSqueezyOrderId,
      status,
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
    }

    return NextResponse.json({ data: invoice }, { status: 201 })
  } catch (error) {
    console.error('POST invoices error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}