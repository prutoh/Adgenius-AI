'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { ArrowLeft, FileText, Download, Receipt, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Invoice {
  id: string
  invoice_number: string
  plan_id: string
  amount: number
  currency: string
  interval: string
  status: string
  pdf_url: string | null
  created_at: string
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  paid: { label: 'Paid', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  failed: { label: 'Failed', variant: 'danger' },
  refunded: { label: 'Refunded', variant: 'default' },
}

export default function BillingPage() {
  const { isAuthenticated, isLoading: authLoading, planId } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/billing')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    async function fetchInvoices() {
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setInvoices(data as Invoice[])
      setIsLoadingInvoices(false)
    }

    if (isAuthenticated) fetchInvoices()
  }, [isAuthenticated, supabase])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader size="lg" text="Loading..." />
      </div>
    )
  }

  if (!isAuthenticated) return null

  const isPaid = planId === 'pro' || planId === 'unlimited'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-brand-600 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-100 rounded-xl">
              <Receipt className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Billing & Invoices</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-0.5">View your payment history and download invoices.</p>
            </div>
          </div>
        </div>

        {/* Current Plan Summary */}
        <Card variant="bordered" padding="md" className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Plan</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                {planId === 'free' ? 'Free' : planId} Plan
              </p>
            </div>
            {planId === 'free' ? (
              <Button onClick={() => router.push('/pricing')}>Upgrade Plan</Button>
            ) : (
              <Link href="/pricing">
                <Button variant="outline">Change Plan</Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Invoices List */}
        <Card variant="bordered" padding="md">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Invoice History</h2>

          {isLoadingInvoices ? (
            <div className="py-8">
              <Loader size="sm" text="Loading invoices..." />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-1">No invoices yet</p>
              {isPaid ? (
                <p className="text-gray-400 text-xs">Invoices will appear here after your first payment.</p>
              ) : (
                <div className="mt-4">
                  <Button size="sm" onClick={() => router.push('/pricing')}>
                    Upgrade to get started
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                        Invoice
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                        Date
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                        Plan
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                        Amount
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                        Status
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                        &nbsp;
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((invoice) => {
                      const status = statusConfig[invoice.status] || statusConfig.pending
                      return (
                        <tr key={invoice.id} className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                          <td className="py-3.5 pr-4">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {invoice.invoice_number}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(invoice.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {invoice.plan_id}{' '}
                              <span className="text-gray-400 text-xs">
                                ({invoice.interval})
                              </span>
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              ${invoice.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                          <td className="py-3.5 text-right">
                            <Button variant="ghost" size="sm" icon={<Download className="h-3.5 w-3.5" />}>
                              PDF
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3 max-h-96 overflow-y-auto">
                {invoices.map((invoice) => {
                  const status = statusConfig[invoice.status] || statusConfig.pending
                  return (
                    <div
                      key={invoice.id}
                      className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {invoice.invoice_number}
                        </span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">
                            {new Date(invoice.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {invoice.plan_id} &middot; {invoice.interval}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ${invoice.amount.toFixed(2)}
                          </p>
                          <Button variant="ghost" size="sm" icon={<Download className="h-3 w-3" />}>
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}