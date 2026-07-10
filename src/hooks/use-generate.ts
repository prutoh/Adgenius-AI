'use client'

import { useState, useCallback } from 'react'
import type { PropertyInput } from '@/types'

interface UseGenerateReturn {
  output: string
  isGenerating: boolean
  error: string | null
  generate: (input: PropertyInput) => Promise<void>
  reset: () => void
}

export function useGenerate(): UseGenerateReturn {
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (input: PropertyInput) => {
    setIsGenerating(true)
    setError(null)
    setOutput('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Generation failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Failed to read response stream')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const text = decoder.decode(value, { stream: true })
        setOutput(prev => prev + text)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setOutput('')
    setError(null)
  }, [])

  return {
    output,
    isGenerating,
    error,
    generate,
    reset,
  }
}