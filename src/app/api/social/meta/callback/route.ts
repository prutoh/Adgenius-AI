import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { saveSocialAccount } from '@/lib/social/lib'

/**
 * GET /api/social/meta/callback
 * Handles Meta OAuth callback, exchanges for long-lived token, fetches pages/IG account.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const errorReason = searchParams.get('error_reason')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (errorReason || !code) {
    return NextResponse.redirect(`${appUrl}/social-accounts?error=access_denied`)
  }

  let state: { platform: string; redirect: string }
  try {
    state = JSON.parse(Buffer.from(stateParam || '', 'base64url').toString())
  } catch {
    return NextResponse.redirect(`${appUrl}/social-accounts?error=invalid_state`)
  }

  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const redirectUri = `${appUrl}/api/social/meta/callback`

  if (!appId || !appSecret) {
    return NextResponse.redirect(`${appUrl}/social-accounts?error=meta_not_configured`)
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
    )
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}/social-accounts?error=token_exchange_failed`)
    }

    // Exchange for long-lived token
    const llRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`
    )
    const llData = await llRes.json()
    const longLivedToken = llData.access_token
    if (!longLivedToken) {
      return NextResponse.redirect(`${appUrl}/social-accounts?error=long_lived_token_failed`)
    }

    const expiresIn = llData.expires_in || (60 * 24 * 60)
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Fetch user profile
    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${longLivedToken}`)
    const meData = await meRes.json()

    // Get current user
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${appUrl}/login?redirect=/social-accounts`)
    }

    // Fetch pages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token&access_token=${longLivedToken}`)
    const pagesData = await pagesRes.json()
    const pages = pagesData.data || []

    // Save each Facebook page
    for (const page of pages) {
      await saveSocialAccount({
        userId: user.id,
        platform: 'facebook',
        platformUserId: page.id,
        username: page.name || `page_${page.id}`,
        displayName: page.name,
        accessToken: page.access_token || longLivedToken,
        tokenExpiresAt: expiresAt,
        facebookPageId: page.id,
      })
    }

    // If Instagram requested, find IG Business account
    if (state.platform === 'instagram') {
      for (const page of pages) {
        try {
          const igRes = await fetch(
            `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account{id,username}&access_token=${page.access_token || longLivedToken}`
          )
          const igData = await igRes.json()
          const igAccount = igData.instagram_business_account

          if (igAccount) {
            await saveSocialAccount({
              userId: user.id,
              platform: 'instagram',
              platformUserId: igAccount.id,
              username: igAccount.username || `ig_${igAccount.id}`,
              displayName: igAccount.username,
              accessToken: longLivedToken,
              tokenExpiresAt: expiresAt,
              facebookPageId: page.id,
              instagramBusinessAccountId: igAccount.id,
            })
            break
          }
        } catch {
          continue
        }
      }
    }

    // Also save the main user account as a Facebook profile
    if (pages.length === 0) {
      await saveSocialAccount({
        userId: user.id,
        platform: 'facebook',
        platformUserId: meData.id,
        username: meData.name || `user_${meData.id}`,
        displayName: meData.name,
        accessToken: longLivedToken,
        tokenExpiresAt: expiresAt,
      })
    }

    return NextResponse.redirect(`${appUrl}/social-accounts?connected=${state.platform}`)
  } catch (err) {
    console.error('Meta OAuth callback error:', err)
    return NextResponse.redirect(`${appUrl}/social-accounts?error=oauth_failed`)
  }
}