import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getDecryptedSocialAccount, logPosting, refreshMetaToken } from '@/lib/social/lib'
import { encrypt } from '@/lib/crypto'

/**
 * POST /api/post/instagram
 * Creates a media container and publishes to Instagram.
 * Instagram Content Publishing API requires: create container → poll status → publish.
 * For text-only posts, we use the text option (available for IG Business accounts).
 * Body: { accountId: string, content: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
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

    // Get Instagram Business account with decrypted token
    const account = await getDecryptedSocialAccount(user.id, 'instagram')
    if (!account || !account.instagram_business_account_id) {
      return NextResponse.json({ error: 'No connected Instagram Business account found. Please connect via Facebook with an Instagram Business/Creator account linked to a Page.' }, { status: 400 })
    }

    let accessToken = account.access_token

    // Token refresh if expired
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const refreshed = await refreshMetaToken(accessToken)
      if (refreshed) {
        accessToken = refreshed.accessToken
        const newExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
        await supabase
          .from('social_accounts')
          .update({
            access_token_encrypted: encrypt(refreshed.accessToken),
            token_expires_at: newExpiresAt,
          })
          .eq('id', accountId)
      }
    }

    const igUserId = account.instagram_business_account_id

    // Step 1: Create a media container (text-only post using text parameter)
    const createRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          media_type: 'TEXT_POST',
          access_token: accessToken,
        }),
      }
    )
    const createData = await createRes.json()

    if (createData.error) {
      await logPosting({
        userId: user.id,
        socialAccountId: accountId,
        platform: 'instagram',
        status: 'failed',
        errorMessage: createData.error.message,
        adContent: content,
      })
      return NextResponse.json(
        { error: `Instagram API error: ${createData.error.message}` },
        { status: 400 }
      )
    }

    const containerId = createData.id

    // Step 2: Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    )
    const publishData = await publishRes.json()

    if (publishData.error) {
      await logPosting({
        userId: user.id,
        socialAccountId: accountId,
        platform: 'instagram',
        status: 'failed',
        errorMessage: publishData.error.message,
        adContent: content,
      })
      return NextResponse.json(
        { error: `Instagram publish error: ${publishData.error.message}` },
        { status: 400 }
      )
    }

    await logPosting({
      userId: user.id,
      socialAccountId: accountId,
      platform: 'instagram',
      platformPostId: publishData.id,
      status: 'posted',
      adContent: content,
    })

    await supabase
      .from('social_accounts')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', accountId)

    return NextResponse.json({
      success: true,
      postId: publishData.id,
      message: 'Ad posted to Instagram successfully',
    })
  } catch (err) {
    console.error('Instagram posting error:', err)
    return NextResponse.json({ error: 'Failed to post to Instagram' }, { status: 500 })
  }
}