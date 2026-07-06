import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, FREE_TIER_LIMIT } from '@/lib/utils/constants'
import type { UsageInfo, PlanId } from '@/types'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_id')
      .eq('id', user.id)
      .single()

        const planId = (profile?.plan_id as PlanId) || 'free'
    
    // Correctly check if the plan exists in our limits list, fallback to free if not
    const limit = planId in PLAN_LIMITS ? PLAN_LIMITS[planId] : FREE_TIER_LIMIT

    // Calculate start of current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Get usage count
    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    const used = count || 0
    
    // Correctly calculate remaining (can be null if limit is null/unlimited)
    const remaining = limit === null ? null : Math.max(0, limit - used)

    const usageInfo: UsageInfo = {
      used: used,
      limit: limit,
      remaining: remaining,
      plan: planId,
    }

    return NextResponse.json(usageInfo)
  } catch (error) {
    console.error('Usage fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    )
  }
}