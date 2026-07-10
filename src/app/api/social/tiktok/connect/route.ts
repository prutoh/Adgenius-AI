import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/social/tiktok/connect
 * Initiates TikTok OAuth flow.
 */
export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  if (!clientKey) {
    return NextResponse.json({ error: 'TikTok Client Key not configured' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/social/tiktok/callback`
  const scope = 'user.info.basic,video.publish'

  const state = Buffer.from(JSON.stringify({ redirect: '/social-accounts' })).toString('base64url')
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${encodeURIComponent(scope)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  return NextResponse.json({ url: authUrl })
}