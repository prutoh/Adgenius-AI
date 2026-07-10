import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * GET /api/social/meta/connect
 * Initiates Meta (Facebook) OAuth flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform') || 'facebook'

  const appId = process.env.META_APP_ID
  if (!appId) {
    return NextResponse.json({ error: 'Meta App ID not configured' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/social/meta/callback`

  const scope = [
    'public_profile',
    'email',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_content_publish',
  ].join(',')

  const state = Buffer.from(JSON.stringify({ platform, redirect: '/social-accounts' })).toString('base64url')
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`

  return NextResponse.json({ url: authUrl })
}