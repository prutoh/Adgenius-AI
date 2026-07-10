'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Facebook,
  Instagram,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Send,
} from 'lucide-react'

interface SocialAccount {
  id: string
  platform: 'facebook' | 'instagram' | 'tiktok'
  username: string
  display_name: string
  is_active: boolean
  token_expires_at: string | null
}

const PLATFORM_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2 6.34 6.34 0 0 0 9.49 21.5a6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.3z" />
    </svg>
  ),
}

const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

const POST_ENDPOINTS: Record<string, string> = {
  facebook: '/api/post/facebook',
  instagram: '/api/post/instagram',
  tiktok: '/api/post/tiktok',
}

interface PostDirectlyModalProps {
  isOpen: boolean
  onClose: () => void
  content: string
}

export function PostDirectlyModal({ isOpen, onClose, content }: PostDirectlyModalProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState<string | null>(null) // accountId being posted
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({})

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/social/accounts')
      const data = await res.json()
      setAccounts(data.accounts || [])
    } catch {
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchAccounts()
      setResults({})
    }
  }, [isOpen, fetchAccounts])

  const handlePost = async (account: SocialAccount) => {
    setPosting(account.id)
    try {
      const res = await fetch(POST_ENDPOINTS[account.platform], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          content,
        }),
      })
      const data = await res.json()
      setResults((prev) => ({
        ...prev,
        [account.id]: {
          success: data.success,
          message: data.message || data.error || 'Unknown error',
        },
      }))
    } catch {
      setResults((prev) => ({
        ...prev,
        [account.id]: {
          success: false,
          message: 'Network error. Please try again.',
        },
      }))
    } finally {
      setPosting(null)
    }
  }

  if (!isOpen) return null

  const hasAccounts = accounts.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
              <Send className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Post Directly</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose a connected account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
              <span className="ml-2 text-gray-500">Loading accounts...</span>
            </div>
          ) : !hasAccounts ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No social accounts connected yet.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  onClose()
                  window.location.href = '/social-accounts'
                }}
                icon={<ExternalLink className="h-4 w-4" />}
              >
                Connect Accounts
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => {
                const Icon = PLATFORM_ICONS[account.platform]
                const result = results[account.id]
                const isPosting = posting === account.id

                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {account.display_name || account.username}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">@{account.username}</p>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {PLATFORM_LABELS[account.platform]}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {result && (
                        <span className={`flex items-center gap-1 text-xs ${
                          result.success ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {result.success
                            ? <><CheckCircle className="h-3.5 w-3.5" /> Posted</>
                            : <><AlertCircle className="h-3.5 w-3.5" /> Failed</>
                          }
                        </span>
                      )}

                      <Button
                        size="sm"
                        onClick={() => handlePost(account)}
                        loading={isPosting}
                        disabled={!!result?.success}
                        icon={<Send className="h-3.5 w-3.5" />}
                      >
                        {isPosting ? 'Posting...' : result?.success ? 'Posted' : 'Post'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Error details */}
          {Object.values(results).some((r) => !r.success) && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Error details:</p>
              {Object.entries(results)
                .filter(([, r]) => !r.success)
                .map(([id, r]) => (
                  <p key={id} className="text-xs text-red-500">{r.message}</p>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => { onClose(); window.location.href = '/social-accounts' }}>
            Manage Accounts
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}