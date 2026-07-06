'use client'

import { useUsage } from '@/hooks/use-usage'
import { Badge } from '@/components/ui/badge'
import { BarChart3 } from 'lucide-react'

export function UsageCounter() {
  const { usage, isLoading } = useUsage()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <BarChart3 className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    )
  }

  const isFree = usage.plan === 'free'
  const percentage = usage.limit ? (usage.used / usage.limit) * 100 : 0
  const isLow = usage.remaining !== null && usage.remaining <= 1
  const colorClass = isLow ? 'text-red-600' : 'text-gray-600'

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <BarChart3 className={`h-4 w-4 ${colorClass}`} />
        <span className={`text-sm font-medium ${colorClass}`}>
          {usage.remaining === null ? '∞' : usage.remaining} remaining
        </span>
      </div>
      
      {isFree && (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentage >= 100 ? 'bg-red-500' : percentage >= 66 ? 'bg-yellow-500' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <Badge variant={isLow ? 'danger' : 'default'}>
            {usage.used}/{usage.limit}
          </Badge>
        </div>
      )}
    </div>
  )
}