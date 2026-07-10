'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { Link2, Unlink, CheckCircle, AlertCircle, Facebook, Instagram, Loader2, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

interface SocialAccount {
  id: string
  platform: 'facebook' | 'instagram' | 'tiktok'
  platform_user_id: string
  username: string
  display_name: string
  is_active: boolean
  token_expires_at: string | null
  last_used_at: string | null
  created_at: string
}

const PLATFORM_CONFIG = {
  facebook: {
    label: 'Facebook',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Facebook,
    description: 'Post ads directly to your Facebook Pages',
  },
  instagram: {
    label: 'Instagram',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-800',
    icon: Instagram,
    description: 'Post ads to your Instagram Business account',
  },
  tiktok: {
    label: 'TikTok',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-700',
    icon: () => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2 6.34 6.34 0 0 0 9.49 21.5a6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.3z" />
      </svg>
    ),
    description: 'Post ads to your TikTok account',
  },
} as const

function SocialAccountsContent() {
  const { isAuthenticated, isLoading: authLoading, planId } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Check for OAuth callback messages
  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')

    if (connected) {
      setMessage({ type: 'success', text: `${PLATFORM_CONFIG[connected as keyof typeof PLATFORM_CONFIG]?.label || connected} connected successfully!` })
      // Clean URL
      const url = new URL(window.location.href)
      url.searchParams.delete('connected')
      window.history.replaceState({}, '', url.toString())
    } else if (error) {
      const errorMessages: Record<string, string> = {
        access_denied: 'You cancelled the authorization.',
        token_exchange_failed: 'Failed to exchange authorization code.',
        meta_not_configured: 'Meta integration is not configured yet.',
        tiktok_not_configured: 'TikTok integration is not configured yet.',
        oauth_failed: 'OAuth flow failed. Please try again.',
        user_info_failed: 'Failed to fetch your profile info.',
        no_code: 'No authorization code received.',
        invalid_state: 'Invalid OAuth state. Please try again.',
      }
      setMessage({ type: 'error', text: errorMessages[error] || `Connection failed: ${error}` })
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/social/accounts')
      const data = await res.json()
      if (data.accounts) {
        setAccounts(data.accounts)
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/social-accounts')
      return
    }
    if (isAuthenticated) {
      fetchAccounts()
    }
  }, [isAuthenticated, authLoading, router, fetchAccounts])

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleConnect = async (platform: 'facebook' | 'instagram' | 'tiktok') => {
    setConnecting(platform)
    try {
      if (platform === 'tiktok') {
        const res = await fetch('/api/social/tiktok/connect')
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to initiate TikTok connection' })
        }
      } else {
        // Meta (Facebook/Instagram)
        const res = await fetch(`/api/social/meta/connect?platform=${platform}`)
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to initiate Meta connection' })
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection failed. Please try again.' })
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    setDisconnecting(accountId)
    try {
      const res = await fetch(`/api/social/accounts?id=${accountId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setAccounts((prev) => prev.filter((a) => a.id !== accountId))
        setMessage({ type: 'success', text: 'Account disconnected successfully' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to disconnect account' })
    } finally {
      setDisconnecting(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader size="lg" text="Loading..." />
      </div>
    )
  }

  if (planId !== 'unlimited') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12">
            <Shield className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Unlimited Plan Required</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Direct posting to social media is exclusively available on the Unlimited plan.
              Upgrade to connect your accounts and post ads directly.
            </p>
            <Link href="/pricing">
              <Button variant="primary" size="lg">Upgrade to Unlimited</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getAccountsByPlatform = (platform: string) =>
    accounts.filter((a) => a.platform === platform)

  const isTokenExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Connected Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect your social media accounts to post generated ads directly.
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            {message.type === 'success'
              ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              : <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            }
            <p className={`text-sm ${message.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Platform Cards */}
        <div className="space-y-6">
          {(Object.entries(PLATFORM_CONFIG) as [keyof typeof PLATFORM_CONFIG, typeof PLATFORM_CONFIG.facebook][]).map(
            ([key, config]) => {
              const platformAccounts = getAccountsByPlatform(key)
              const Icon = config.icon
              const isConnecting = connecting === key

              return (
                <Card key={key} variant="bordered" className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{config.label}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnect(key)}
                        loading={isConnecting}
                        icon={<Link2 className="h-4 w-4" />}
                      >
                        Connect
                      </Button>
                    </div>

                    {platformAccounts.length > 0 ? (
                      <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                        {platformAccounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  {account.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {account.display_name || account.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  @{account.username}
                                  {isTokenExpired(account.token_expires_at) && (
                                    <Badge variant="warning" className="ml-2">Token expired</Badge>
                                  )}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisconnect(account.id)}
                              loading={disconnecting === account.id}
                              icon={<Unlink className="h-4 w-4" />}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Disconnect
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                          No {config.label} account connected. Click &quot;Connect&quot; to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )
            }
          )}
        </div>
      </div>
    </div>
  )
}

export default function SocialAccountsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-16"><Loader size="lg" text="Loading..." /></div>}>
      <SocialAccountsContent />
    </Suspense>
  )
}