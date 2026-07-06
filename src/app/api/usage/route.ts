import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, FREE_TIER_LIMIT } from '@/lib/utils/constants'
import { ensureProfile } from '@/lib/utils/ensure-profile'
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

    // Get or create user profile
    const profile = await ensureProfile(user)
    let planId = (profile?.plan_id as PlanId) || 'free'

    // Validate paid plans against the subscriptions table to prevent manipulation.
    // If the user has ANY subscription records, enforce the active subscription's plan.
    // If they have NO subscriptions at all (e.g. admin-granted via SQL), trust profile.plan_id.
    if (planId !== 'free') {
      const { data: allSubs } = await supabase
        .from('subscriptions')
        .select('plan_id, status, current_period_end')
        .eq('user_id', user.id)

      if (allSubs && allSubs.length > 0) {
        // User has subscription records — validate against them
        const activeSub = allSubs.find(
          (s: any) => s.status === 'active' && (!s.current_period_end || new Date(s.current_period_end) >= new Date())
        )
        if (activeSub) {
          planId = activeSub.plan_id as PlanId
        } else {
          // Has subscriptions but none are active/valid — fall back to free
          planId = 'free'
        }
      }
      // No subscription records exist — trust profile.plan_id (admin-granted plan)
    }

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