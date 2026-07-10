import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { getDecryptedSocialAccount, logPosting, refreshTikTokToken } from '@/lib/social/lib'
import { encrypt } from '@/lib/crypto'

/**
 * POST /api/post/tiktok
 * Posts text content to TikTok.
 * Uses the TikTok Content Posting API (direct post).
 * Note: TikTok primarily supports video posts. For text-only, we create a
 * text-based post using the video.publish scope.
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

    // Get TikTok account with decrypted token
    const account = await getDecryptedSocialAccount(user.id, 'tiktok')
    if (!account) {
      return NextResponse.json({ error: 'No connected TikTok account found. Please connect your TikTok account first.' }, { status: 400 })
    }

    let accessToken = account.access_token

    // Token refresh if expired
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      if (account.refresh_token) {
        const refreshed = await refreshTikTokToken(account.refresh_token)
        if (refreshed) {
          accessToken = refreshed.accessToken
          const newExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
          await admin
            .from('social_accounts')
            .update({
              access_token_encrypted: encrypt(refreshed.accessToken),
              refresh_token_encrypted: encrypt(refreshed.refreshToken),
              token_expires_at: newExpiresAt,
            })
            .eq('id', accountId)
        }
      }
    }

    // TikTok Content Posting API - Direct Post (text post)
    // Using the /v2/post/publish/content/init/ endpoint
    const postRes = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        post_info: {
          title: content.substring(0, 150),
          description: content,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: '', // Text-only posts may need a placeholder or image
        },
        post_mode: 'DIRECT_POST',
        media_type: 'VIDEO',
      }),
    })

    const postData = await postRes.json()

    // TikTok may return publish_id on success
    if (postData.error) {
      await logPosting({
        userId: user.id,
        socialAccountId: accountId,
        platform: 'tiktok',
        status: 'failed',
        errorMessage: postData.error?.message || JSON.stringify(postData.error),
        adContent: content,
      })
      return NextResponse.json(
        { error: `TikTok API error: ${postData.error?.message || 'Unknown error'}` },
        { status: 400 }
      )
    }

    await logPosting({
      userId: user.id,
      socialAccountId: accountId,
      platform: 'tiktok',
      platformPostId: postData.data?.publish_id || null,
      status: 'posted',
      adContent: content,
    })

    await admin
      .from('social_accounts')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', accountId)

    return NextResponse.json({
      success: true,
      postId: postData.data?.publish_id,
      message: 'Ad posted to TikTok successfully',
    })
  } catch (err) {
    console.error('TikTok posting error:', err)
    return NextResponse.json({ error: 'Failed to post to TikTok' }, { status: 500 })
  }
}