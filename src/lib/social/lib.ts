import { createServerSupabaseClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto'

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok'

export interface StoredSocialAccount {
  id: string
  platform: SocialPlatform
  platform_user_id: string
  username: string
  display_name: string
  is_active: boolean
  token_expires_at: string | null
  instagram_business_account_id: string | null
  facebook_page_id: string | null
  last_used_at: string | null
  created_at: string
}

/**
 * Save an OAuth account to the database (tokens encrypted).
 */
export async function saveSocialAccount(params: {
  userId: string
  platform: SocialPlatform
  platformUserId: string
  username: string
  displayName?: string
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: string
  instagramBusinessAccountId?: string
  facebookPageId?: string
}): Promise<StoredSocialAccount> {
  const supabase = createServerSupabaseClient()

  const row = {
    user_id: params.userId,
    platform: params.platform,
    platform_user_id: params.platformUserId,
    username: params.username,
    display_name: params.displayName || '',
    access_token_encrypted: encrypt(params.accessToken),
    refresh_token_encrypted: params.refreshToken ? encrypt(params.refreshToken) : null,
    token_expires_at: params.tokenExpiresAt || null,
    instagram_business_account_id: params.instagramBusinessAccountId || null,
    facebook_page_id: params.facebookPageId || null,
  }

  const { data, error } = await supabase
    .from('social_accounts')
    .upsert(row, { onConflict: 'user_id,platform,platform_user_id' })
    .select()
    .single()

  if (error) throw new Error(`Failed to save social account: ${error.message}`)
  return mapToStored(data)
}

/**
 * Get all social accounts for a user (tokens NOT decrypted — for listing).
 */
export async function getSocialAccounts(userId: string): Promise<StoredSocialAccount[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('social_accounts')
    .select()
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch social accounts: ${error.message}`)
  return (data || []).map(mapToStored)
}

/**
 * Get a social account with decrypted tokens.
 */
export async function getDecryptedSocialAccount(
  userId: string,
  platform: SocialPlatform,
  platformUserId?: string
) {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('social_accounts')
    .select()
    .eq('user_id', userId)
    .eq('platform', platform)
    .eq('is_active', true)

  if (platformUserId) {
    query = query.eq('platform_user_id', platformUserId)
  }

  const { data, error } = await query.single()
  if (error || !data) return null

  return {
    ...mapToStored(data),
    access_token: decrypt(data.access_token_encrypted),
    refresh_token: data.refresh_token_encrypted ? decrypt(data.refresh_token_encrypted) : null,
  }
}

/**
 * Delete a social account.
 */
export async function deleteSocialAccount(userId: string, accountId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('social_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to delete social account: ${error.message}`)
}

/**
 * Log a posting attempt for auditing.
 */
export async function logPosting(params: {
  userId: string
  socialAccountId: string
  platform: SocialPlatform
  platformPostId?: string
  status: 'posted' | 'failed'
  errorMessage?: string
  adContent: string
}) {
  const supabase = createServerSupabaseClient()
  await supabase.from('posting_logs').insert({
    user_id: params.userId,
    social_account_id: params.socialAccountId,
    platform: params.platform,
    platform_post_id: params.platformPostId || null,
    status: params.status,
    error_message: params.errorMessage || null,
    ad_content: params.adContent,
  })
}

/**
 * Refresh a Meta long-lived token.
 */
export async function refreshMetaToken(longLivedToken: string): Promise<{
  accessToken: string
  expiresIn: number
} | null> {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  if (!appId || !appSecret) return null

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${longLivedToken}`
    )
    const data = await res.json()
    if (data.access_token) {
      return { accessToken: data.access_token, expiresIn: data.expires_in }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Refresh a TikTok access token.
 */
export async function refreshTikTokToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
  refreshExpiresIn: number
} | null> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET
  if (!clientKey || !clientSecret) return null

  try {
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_key=${clientKey}&client_secret=${clientSecret}&grant_type=refresh_token&refresh_token=${refreshToken}`,
    })
    const data = await res.json()
    if (data.access_token) {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        refreshExpiresIn: data.refresh_expires_in,
      }
    }
    return null
  } catch {
    return null
  }
}

function mapToStored(row: Record<string, unknown>): StoredSocialAccount {
  return {
    id: row.id as string,
    platform: row.platform as SocialPlatform,
    platform_user_id: row.platform_user_id as string,
    username: row.username as string,
    display_name: (row.display_name as string) || '',
    is_active: row.is_active as boolean,
    token_expires_at: row.token_expires_at as string | null,
    instagram_business_account_id: row.instagram_business_account_id as string | null,
    facebook_page_id: row.facebook_page_id as string | null,
    last_used_at: row.last_used_at as string | null,
    created_at: row.created_at as string,
  }
}