import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateRealEstateAd } from '@/lib/ai/gemini'
import { PLAN_LIMITS } from '@/lib/utils/constants'
import type { PropertyInput, PlanId } from '@/types'

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

    // 2. Get User Profile & Check Limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_id')
      .eq('id', user.id)
      .single()

    const planId = (profile?.plan_id as PlanId) || 'free'
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