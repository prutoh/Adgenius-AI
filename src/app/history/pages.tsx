'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { CopyButton } from '@/components/generate/copy-button'
import { getRelativeTime } from '@/lib/utils/helpers'
import { FileText, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import { PLATFORM_LABELS } from '@/types/ai'

interface Generation {
  id: string
  output_text: string
  platform: string
  input_data: { property_type: string; location: string }
  created_at: string
}

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?redirect=/history')
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    async function fetchHistory() {
      if (!isAuthenticated) return
      const { data } = await supabase.from('generations').select('*').order('created_at', { ascending: false }).limit(50)
      if (data) setGenerations(data as Generation[])
      setIsLoading(false)
    }
    if (isAuthenticated) fetchHistory()
  }, [isAuthenticated, supabase])

  const filteredGenerations = generations.filter((gen) => {
    if (!searchTerm) return true
    return gen.output_text.toLowerCase().includes(searchTerm.toLowerCase()) || gen.input_data?.location?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center pt-16"><Loader size="lg" text="Loading history..." /></div>
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-brand-600 flex items-center gap-1 mb-2"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Generation History</h1>
          </div>
        </div>

        {generations.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search by location or content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
        )}

        {filteredGenerations.length === 0 ? (
          <Card variant="bordered" padding="lg" className="text-center py-16">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">{searchTerm ? 'No matching results' : 'No generations yet'}</h3>
            {!searchTerm && <Link href="/generate"><button className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg">Create Your First Ad</button></Link>}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredGenerations.map((gen) => (
              <Card key={gen.id} variant="bordered" padding="md" className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="info">{PLATFORM_LABELS[gen.platform] || gen.platform}</Badge>
                    <span className="text-xs text-gray-400">{getRelativeTime(gen.created_at)}</span>
                  </div>
                  <CopyButton text={gen.output_text} className="flex-shrink-0" />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{gen.output_text}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}