import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'

/**
 * Ensures a profile row exists for the given user.
 * If missing, creates one with plan_id = 'free'.
 * Returns the profile data (existing or newly created).
 */
export async function ensureProfile(user: { id: string; email?: string }) {
  const supabase = createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile) {
    return profile
  }

  // Profile doesn't exist — create it using admin client (bypasses RLS)
  const admin = createAdminClient()
  const { data: newProfile, error } = await admin
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email || '',
      plan_id: 'free',
    })
    .select('*')
    .single()

  if (error) {
    console.error('Failed to create profile:', error)
    return null
  }

  return newProfile
}