import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { saveSocialAccount } from '@/lib/social/lib'

/**
 * GET /api/social/tiktok/callback
 * Handles TikTok OAuth callback.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!code) {
    return NextResponse.redirect(`${appUrl}/social-accounts?error=no_code`)
  }

  try {
    JSON.parse(Buffer.from(stateParam || '', 'base64url').toString())
  } catch {
    return NextResponse.redirect(`${appUrl}/social-accounts?error=invalid_state`)
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET
  const redirectUri = `${appUrl}/api/social/tiktok/callback`

  if (!clientKey || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/social-accounts?error=tiktok_not_configured`)
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_key=${clientKey}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}`,
    })
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      console.error('TikTok token error:', tokenData)
      return NextResponse.redirect(`${appUrl}/social-accounts?error=token_exchange_failed`)
    }

    const expiresIn = tokenData.expires_in || 86400
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Fetch user info
    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({ fields: ['open_id', 'display_name', 'username'] }),
    })
    const userData = await userRes.json()
    const userInfo = userData.data?.user

    if (!userInfo) {
      return NextResponse.redirect(`${appUrl}/social-accounts?error=user_info_failed`)
    }

    // Save to DB
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${appUrl}/login?redirect=/social-accounts`)
    }

    await saveSocialAccount({
      userId: user.id,
      platform: 'tiktok',
      platformUserId: userInfo.open_id,
      username: userInfo.username || `tiktok_${userInfo.open_id}`,
      displayName: userInfo.display_name || userInfo.username,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: expiresAt,
    })

    return NextResponse.redirect(`${appUrl}/social-accounts?connected=tiktok`)
  } catch (err) {
    console.error('TikTok OAuth callback error:', err)
    return NextResponse.redirect(`${appUrl}/social-accounts?error=oauth_failed`)
  }
}