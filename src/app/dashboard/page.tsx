'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useUsage } from '@/hooks/use-usage'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { Input } from '@/components/ui/input'
import { CopyButton } from '@/components/generate/copy-button'
import { getRelativeTime } from '@/lib/utils/helpers'
import { BarChart3, FileText, CreditCard, Sparkles, ArrowRight, ExternalLink, Key } from 'lucide-react'
import Link from 'next/link'

interface Generation {
  id: string
  output_text: string
  platform: string
  created_at: string
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading, profile } = useAuth()
  const { usage } = useUsage()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [newName, setNewName] = useState('')
  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (profile?.full_name) {
      setNewName(profile.full_name)
    }
  }, [profile])

  async function handleUpdateName() {
    if (!newName.trim()) return
    setIsUpdatingName(true)
    setNameSuccess(false)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: newName.trim() })
      .eq('id', profile?.id)

    if (!error) {
      setNameSuccess(true)
      router.refresh() 
      setTimeout(() => setNameSuccess(false), 3000)
    }
    setIsUpdatingName(false)
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return
    setIsDeleting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })

      if (response.ok) {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
      } else {
        alert('Failed to delete account. Please try again.')
        setIsDeleting(false)
      }
    } catch (error) {
      alert('An error occurred.')
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    async function fetchHistory() {
      if (!isAuthenticated) return
      const { data } = await supabase
        .from('generations')
        .select('id, output_text, platform, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      if (data) setGenerations(data)
      setIsLoadingHistory(false)
    }
    if (isAuthenticated) fetchHistory()
  }, [isAuthenticated, supabase])

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center pt-16"><Loader size="lg" text="Loading..." /></div>
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {profile?.full_name || profile?.email?.split('@')[0]}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-100 rounded-xl"><Sparkles className="h-6 w-6 text-brand-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Generations Used</p>
                <p className="text-2xl font-bold text-gray-900">{usage.used} / {usage.limit === null ? '∞' : usage.limit}</p>
              </div>
            </div>
          </Card>
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl"><CreditCard className="h-6 w-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900 capitalize">{usage.plan}</p>
                  {usage.plan === 'free' && <Link href="/pricing"><Badge variant="info" className="cursor-pointer">Upgrade</Badge></Link>}
                </div>
              </div>
            </div>
          </Card>
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl"><FileText className="h-6 w-6 text-purple-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Generated</p>
                <p className="text-2xl font-bold text-gray-900">{generations.length}+</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card variant="bordered" padding="md">
                            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/generate">
                  <Button className="w-full justify-start" variant="outline"><Sparkles className="h-4 w-4" />New Generation</Button>
                </Link>
                <Link href="/api-dashboard/api-keys">
                  <Button className="w-full justify-start" variant="outline"><Key className="h-4 w-4" />API Access</Button>
                </Link>
                {(usage.plan || 'free').toLowerCase() === 'free' && <Link href="/pricing"><Button className="w-full justify-start" variant="outline"><CreditCard className="h-4 w-4" />Upgrade Plan</Button></Link>}
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card variant="bordered" padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Recent Generations</h2>
              </div>
              {isLoadingHistory ? (
                <div className="py-8"><Loader size="sm" text="Loading history..." /></div>
              ) : generations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No generations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generations.map((gen) => (
                    <div key={gen.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{gen.platform}</Badge>
                          <span className="text-xs text-gray-400">{getRelativeTime(gen.created_at)}</span>
                        </div>
                        <CopyButton text={gen.output_text} className="flex-shrink-0" />
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">{gen.output_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* --- ACCOUNT SETTINGS & PRIVACY SECTION --- */}
        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings & Privacy</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="bordered" padding="md">
              <h3 className="font-semibold text-gray-900 mb-4">Update Profile Name</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Your full name" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={handleUpdateName} 
                  loading={isUpdatingName}
                >
                  Save
                </Button>
              </div>
              {nameSuccess && (
                <p className="text-sm text-green-600 mt-2 animate-fade-in">Name updated successfully!</p>
              )}
            </Card>

            <Card variant="bordered" padding="md" className="border-red-200">
              <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data (generated ads, usage history, subscriptions). This action cannot be undone.
              </p>
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete My Account
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* --- DELETE ACCOUNT MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-red-600 mb-2">Confirm Account Deletion</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently erase your account, all your generated ads, and your subscription. Type <strong>DELETE</strong> below to confirm.
            </p>
            <Input 
              placeholder='Type "DELETE" here' 
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                loading={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}