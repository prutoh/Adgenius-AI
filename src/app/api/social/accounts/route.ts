import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSocialAccounts, deleteSocialAccount } from '@/lib/social/lib'

/**
 * GET /api/social/accounts — List connected accounts
 * DELETE /api/social/accounts?id=xxx — Disconnect an account
 */
export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const accounts = await getSocialAccounts(user.id)
  return NextResponse.json({ accounts })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('id')

  if (!accountId) {
    return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await deleteSocialAccount(user.id, accountId)
  return NextResponse.json({ success: true })
}