'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/utils/helpers'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
  onSuccess?: () => void
  className?: string
}

export function CopyButton({ text, onSuccess, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      onSuccess?.()
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={className}
      icon={copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    >
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  )
}