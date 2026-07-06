'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import type { UsageInfo, PlanId } from '@/types'
import { PLAN_LIMITS, FREE_TIER_LIMIT } from '@/lib/utils/constants'

export function useUsage() {
  const { isAuthenticated, planId } = useAuth()
  
  // 1. Force TypeScript to recognize this as a strict PlanId
  const typedPlanId = (planId || 'free') as PlanId
  
  // 2. Safely get the limit (will be null if unlimited)
  const currentLimit = typedPlanId in PLAN_LIMITS ? PLAN_LIMITS[typedPlanId] : FREE_TIER_LIMIT

  const [usage, setUsage] = useState<UsageInfo>({
    used: 0,
    limit: currentLimit,
    remaining: currentLimit === null ? null : currentLimit,
    plan: typedPlanId,
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchUsage = useCallback(async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  const incrementUsage = useCallback(() => {
    setUsage(prev => ({
      ...prev,
      used: prev.used + 1,
      remaining: prev.remaining !== null ? prev.remaining - 1 : null,
    }))
  }, [])

  const hasReachedLimit = usage.remaining !== null && usage.remaining <= 0

  return {
    usage,
    isLoading,
    fetchUsage,
    incrementUsage,
    hasReachedLimit,
  }
}