import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { getDecryptedSocialAccount, logPosting, refreshMetaToken } from '@/lib/social/lib'
import { encrypt } from '@/lib/crypto'

/**
 * POST /api/post/facebook
 * Posts ad text to a connected Facebook Page.
 * Body: { accountId: string, content: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify Unlimited plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_id')
      .eq('id', user.id)
      .single()

    if (profile?.plan_id !== 'unlimited') {
      return NextResponse.json({ error: 'Direct posting requires the Unlimited plan' }, { status: 403 })
    }

    const { accountId, content } = await request.json()
    if (!accountId || !content) {
      return NextResponse.json({ error: 'Account ID and content are required' }, { status: 400 })
    }

    // Get account with decrypted token
    const account = await getDecryptedSocialAccount(user.id, 'facebook')
    if (!account) {
      return NextResponse.json({ error: 'No connected Facebook account found. Please connect your Facebook account first.' }, { status: 400 })
    }

    let accessToken = account.access_token

    // Token refresh if expired
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const refreshed = await refreshMetaToken(accessToken)
      if (refreshed) {
        accessToken = refreshed.accessToken
        const newExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
        // Update stored token
        await admin
          .from('social_accounts')
          .update({
            access_token_encrypted: encrypt(refreshed.accessToken),
            token_expires_at: newExpiresAt,
          })
          .eq('id', accountId)
      }
    }

    // Post to Facebook Page
    const pageId = account.facebook_page_id || account.platform_user_id
    const postRes = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, access_token: accessToken }),
      }
    )

    const postData = await postRes.json()

    if (postData.error) {
      await logPosting({
        userId: user.id,
        socialAccountId: accountId,
        platform: 'facebook',
        status: 'failed',
        errorMessage: postData.error.message,
        adContent: content,
      })
      return NextResponse.json(
        { error: `Facebook API error: ${postData.error.message}` },
        { status: 400 }
      )
    }

    await logPosting({
      userId: user.id,
      socialAccountId: accountId,
      platform: 'facebook',
      platformPostId: postData.id,
      status: 'posted',
      adContent: content,
    })

    // Update last_used_at
    await admin
      .from('social_accounts')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', accountId)

    return NextResponse.json({
      success: true,
      postId: postData.id,
      message: 'Ad posted to Facebook successfully',
    })
  } catch (err) {
    console.error('Facebook posting error:', err)
    return NextResponse.json({ error: 'Failed to post to Facebook' }, { status: 500 })
  }
}