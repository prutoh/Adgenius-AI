'use client'

import { useAuth as useAuthContext } from '@/context/auth-context'

export function useAuth() {
  const { user, profile, session, isLoading, refreshProfile } = useAuthContext()

  return {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    isPro: profile?.plan_id === 'pro' || profile?.plan_id === 'unlimited',
    isUnlimited: profile?.plan_id === 'unlimited',
    planId: profile?.plan_id || 'free',
    refreshProfile,
  }
}