'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from './copy-button'
import { PostDirectlyModal } from './post-directly-modal'
import { PLATFORM_LABELS } from '@/types/ai'
import type { Platform, PlanId } from '@/types'
import { CheckCircle, AlertCircle, RotateCcw, Send } from 'lucide-react'

interface OutputDisplayProps {
  output: string
  isGenerating: boolean
  error: string | null
  platform?: Platform
  onReset: () => void
  planId?: PlanId
}

export function OutputDisplay({ output, isGenerating, error, platform, onReset, planId }: OutputDisplayProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)

  if (!output && !isGenerating && !error) {
    return null
  }

  if (error) {
    return (
      <Card variant="bordered" className="border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900 mb-1">Generation Failed</h3>
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="bordered" className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Generated Ad Copy</h3>
          {platform && (
            <Badge variant="info">
              {PLATFORM_LABELS[platform]}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {planId === 'unlimited' && output && !isGenerating && (
            <Button variant="primary" size="sm" disabled title="Coming soon">
              Post Directly
            </Button>
          )}
          <CopyButton text={output} onSuccess={() => setShowSuccess(true)} />
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">Copied to clipboard!</span>
        </div>
      )}

      {/* Output Content */}
      <div className="bg-gray-50 dark:bg-gray-950 dark:bg-gray-800 rounded-lg p-4 min-h-[200px]">
        {isGenerating ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {output}
            {isGenerating && <span className="animate-pulse">|</span>}
          </div>
        )}
      </div>

      {/* Post Directly Modal */}
      <PostDirectlyModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        content={output}
      />

      {/* Character Count */}
      {output && !isGenerating && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>{output.length} characters</span>
          {platform && (
            <span className={
              output.length > (platform === 'twitter' ? 280 : 2200)
                ? 'text-red-500'
                : 'text-green-500'
            }>
              {platform === 'twitter' ? 'Twitter limit: 280' : 'Recommended: under 2,200'}
            </span>
          )}
        </div>
      )}
    </Card>
  )
}