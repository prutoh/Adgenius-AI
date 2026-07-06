'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/generate/copy-button'
import { Plus, Key, Trash2, Copy, AlertTriangle } from 'lucide-react'

interface ApiKeyData {
  id: string
  name: string
  created_at: string
  expires_at: string | null
  last_used_at: string | null
  raw_key: string
}

export default function ApiKeysPage() {
  const { isAuthenticated, isLoading: authLoading, profile, planId } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState('')
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/api-dashboard/api-keys')
    }
  }, [isAuthenticated, authLoading, router])

  async function fetchKeys() {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch keys:', error)
    } else if (data) {
      // Hide the raw API key from the frontend for security, only show masked version
      const safeKeys = data.map(k => ({
        id: k.id,
        name: k.name,
        created_at: k.created_at,
        expires_at: k.expires_at,
        last_used_at: k.last_used_at,
        raw_key: k.key_hash.slice(0, 12) + '...' + k.key_hash.slice(-4), // Show sk-xxxx-...xxxx
      }))
      setApiKeys(safeKeys)
    }
    setIsLoadingKeys(false)
  }

  async function handleCreateKey() {
    if (!newKeyName.trim()) return

    setIsCreatingKey(true)
    setDeleteError(null)
    
    try {
      // Generate secure random bytes
      const arrayBuffer = new Uint8Array(32)
      crypto.getRandomValues(arrayBuffer)
      const rawKey = `sk-proj-${Array.from(arrayBuffer).map(b => b.toString(16).padStart(2, '0')).join('')}`
      
      // Hash it for database storage
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawKey))
      const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

      const { error } = await supabase.from('api_keys').insert({
        user_id: profile?.id,
        name: newKeyName.trim(),
        key_hash: keyHash,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        last_used_at: null,
      })

      if (error) {
        setDeleteError('Failed to save API key. Name might already be taken.')
        setIsCreatingKey(false)
        return
      }

      // Show the raw key ONLY ONCE right after creation
      setGeneratedKey(rawKey)
      setNewKeyName('')
      setShowCreateModal(false)
      setIsCreatingKey(false)

      // Refresh keys list
      fetchKeys()
    } catch (error) {
      setDeleteError('Failed to create key.')
      setIsCreatingKey(false)
    }
  }

  async function handleDeleteKey(keyId: string) {
    if (!confirm('Are you sure you want to delete this API key? This will break any apps using it!')) return

    setDeleteError(null)
    
    try {
      await supabase.from('api_keys').delete().eq('id', keyId)
      
      setApiKeys(prev => prev.filter(k => k.id !== keyId))
      setDeleteError(null)
    } catch (error) {
      setDeleteError('Failed to delete key. It might be linked to an active app. Try deactivating instead.')
    }
  }

  const isUnlimited = planId === 'unlimited'

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center pt-16"><Loader size="lg" text="Loading..." /></div>
  }

  if (!isAuthenticated) return null

  if (!isUnlimited) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <Card variant="bordered" padding="lg" className="max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">API Access Required</h1>
          <p className="text-gray-600 text-sm mb-6">
            The API Access feature is exclusively available on the Unlimited plan.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => router.push('/pricing')}>
              View Pricing
            </Button>
          </div>
        </Card>
      </div>
    )

  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Access</h1>
            <p className="text-gray-600 mt-1">Manage your programmatic API keys.</p>
          </div>
          
          <Button 
            onClick={() => setShowCreateModal(true)} 
            icon={<Plus className="h-4 w-4" />}
            size="sm"
          >
            Create New Key
          </Button>
        </div>

        {/* Create Key Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Generate API Key</h2>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-500 text-xl">&times;</span>
                </button>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                  {deleteError}
                </div>
              )}

              {isCreatingKey ? (
                <div className="flex items-center justify-center py-10">
                  <Loader size="lg" text="Generating secure key..." />
                </div>
              ) : (
                <>
                  <Input 
                    label="Key Name (e.g., 'Production App')"
                    placeholder="My App API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="mb-4"
                    required
                  />
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">⚠️ SAVE THIS KEY! It will NOT be shown again after you leave this page.</p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm break-all whitespace-pre-wrap">{generatedKey}</div>
                  </div>

                  <Button 
                    onClick={handleCreateKey} 
                    className="w-full" 
                    size="lg"
                    disabled={!newKeyName.trim()}
                  >
                    Save API Key
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Keys List */}
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your API Keys</h2>
            <Badge variant="info">{apiKeys.length} Keys</Badge>
          </div>

          {isLoadingKeys ? (
            <div className="py-8">
              <Loader size="sm" text="Loading API keys..." />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">No API keys yet.</p>
              <p className="text-sm">Click "Create New Key" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{key.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                      {key.expires_at && <span className="text-yellow-500">• Expires: {new Date(key.expires_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={key.raw_key} />
                    <button 
                      onClick={() => handleDeleteKey(key.id)} 
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}