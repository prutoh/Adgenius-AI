import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateRealEstateAd } from '@/lib/ai/gemini'
import { PLAN_LIMITS } from '@/lib/utils/constants'
import { ensureProfile } from '@/lib/utils/ensure-profile'
import type { PropertyInput, PlanId, Platform } from '@/types'

/**
 * Platforms available per plan.
 * Free users are restricted to Instagram & TikTok only.
 */
const PLAN_PLATFORMS: Record<PlanId, Platform[]> = {
  free: ['instagram', 'tiktok'],
  pro: ['instagram', 'tiktok', 'facebook', 'twitter', 'linkedin'],
  unlimited: ['instagram', 'tiktok', 'facebook', 'twitter', 'linkedin'],
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate User
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to generate ads.' },
        { status: 401 }
      )
    }

    // 2. Get or Create User Profile & Validate Plan
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
        const activeSub = allSubs.find(
          (s: any) => s.status === 'active' && (!s.current_period_end || new Date(s.current_period_end) >= new Date())
        )
        if (activeSub) {
          planId = activeSub.plan_id as PlanId
        } else {
          planId = 'free'
        }
      }
    }

    const limit = PLAN_LIMITS[planId]

    if (limit !== null) {
      // Calculate start of current month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())

      if ((count || 0) >= limit) {
        return NextResponse.json(
          { error: 'Usage limit reached. Please upgrade your plan to continue generating.' },
          { status: 403 }
        )
      }
    }

    // 3. Parse Request Body
    const body: PropertyInput = await request.json()

    if (!body.location || !body.price || !body.property_type) {
      return NextResponse.json(
        { error: 'Missing required fields: location, price, property_type' },
        { status: 400 }
      )
    }

    // 3b. Server-side platform restriction based on plan
    const allowedPlatforms = PLAN_PLATFORMS[planId]
    if (allowedPlatforms && !allowedPlatforms.includes(body.target_platform)) {
      return NextResponse.json(
        { error: `Platform "${body.target_platform}" is not available on your current plan. Upgrade to Pro or Unlimited to access all platforms.` },
        { status: 403 }
      )
    }

    // 4. Log Usage (Do this before streaming to prevent race conditions)
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      generation_type: 'real_estate_ad',
    })

    // 5. Generate AI Stream
    const stream = await generateRealEstateAd(body)

    // 6. Save generation to history asynchronously (fire and forget)
    // We buffer the stream to save the final text to the database
    const encoder = new TextEncoder()
    let fullText = ''

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        fullText += text
        controller.enqueue(chunk)
      },
      async flush() {
        // Save to generations table after stream ends
        if (fullText) {
          await supabase.from('generations').insert({
            user_id: user.id,
            input_data: body as unknown as Record<string, unknown>,
            output_text: fullText,
            platform: body.target_platform,
          })
        }
      }
    })

    const finalStream = stream.pipeThrough(transformStream)

    // 7. Return SSE Response
    return new NextResponse(finalStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during generation.' },
      { status: 500 }
    )
  }
}