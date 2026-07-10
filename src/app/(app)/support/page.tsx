'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { AlertTriangle, Headphones, Send, Check, ArrowLeft, Mail, Clock, Shield } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface SupportTicket {
  id: string
  subject: string
  message: string
  status: string
  created_at: string
}

export default function SupportPage() {
  const { isAuthenticated, isLoading: authLoading, planId } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/support')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    async function fetchTickets() {
      const { data } = await supabase
        .from('support_tickets')
        .select('id, subject, message, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setTickets(data as SupportTicket[])
      setIsLoadingTickets(false)
    }
    if (isAuthenticated) fetchTickets()
  }, [isAuthenticated, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return

    setIsSubmitting(true)
    setSubmitSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('support_tickets').insert({
      user_id: user?.id,
      subject: subject.trim(),
      message: message.trim(),
      status: 'open',
    })

    if (!error) {
      setSubject('')
      setMessage('')
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)

      // Refresh tickets
      const { data } = await supabase
        .from('support_tickets')
        .select('id, subject, message, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setTickets(data as SupportTicket[])
    }
    setIsSubmitting(false)
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center pt-16"><Loader size="lg" text="Loading..." /></div>
  }

  if (!isAuthenticated) return null

  const isPaid = planId === 'pro' || planId === 'unlimited'
  if (!isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <Card variant="bordered" padding="lg" className="max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Paid Feature</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Priority support is available on Pro and Unlimited plans. Get faster response times and direct access to our team.
          </p>
          <Button onClick={() => router.push('/pricing')}>View Pricing</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl">
              <Headphones className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Priority Support</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-0.5">Get help from our team. Priority responses for paid plans.</p>
            </div>
          </div>
        </div>

        {/* Priority Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card variant="bordered" padding="sm" className="text-center">
            <Clock className="h-5 w-5 text-brand-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Fast Response</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Within 24 hours</p>
          </Card>
          <Card variant="bordered" padding="sm" className="text-center">
            <Shield className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Priority Queue</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your tickets come first</p>
          </Card>
          <Card variant="bordered" padding="sm" className="text-center">
            <Mail className="h-5 w-5 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Direct Email</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">support@adgenius.ai</p>
          </Card>
        </div>

        {/* Submit Ticket Form */}
        <Card variant="bordered" padding="md" className="mb-8">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Submit a Support Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
              <textarea
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-y"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              {submitSuccess && (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1 animate-fade-in">
                  <Check className="h-4 w-4" /> Ticket submitted!
                </span>
              )}
              <Button type="submit" loading={isSubmitting} icon={<Send className="h-4 w-4" />} size="sm">
                Submit Ticket
              </Button>
            </div>
          </form>
        </Card>

        {/* Past Tickets */}
        <Card variant="bordered" padding="md">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Tickets</h2>
          {isLoadingTickets ? (
            <div className="py-6"><Loader size="sm" text="Loading tickets..." /></div>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No support tickets yet.</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{ticket.subject}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      ticket.status === 'open'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : ticket.status === 'resolved'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{ticket.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}