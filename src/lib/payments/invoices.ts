import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PlanId } from '@/types'
import { PLANS } from '@/lib/utils/constants'

interface InvoiceRecord {
  id: string
  user_id: string
  invoice_number: string
  plan_id: string
  amount: number
  currency: string
  interval: string
  status: string
  pdf_url: string | null
  paypal_order_id: string | null
  lemon_squeezy_order_id: string | null
  created_at: string
}

/**
 * Generate a sequential invoice number (INV-0001, INV-0002, etc.)
 */
export async function generateInvoiceNumber(): Promise<string> {
  const supabase = createServerSupabaseClient()

  // Get the latest invoice number
  const { data: latestInvoice } = await supabase
    .from('invoices')
    .select('invoice_number')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let nextNumber = 1

  if (latestInvoice?.invoice_number) {
    // Extract number from INV-XXXX format
    const match = latestInvoice.invoice_number.match(/INV-(\d+)/)
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }

  return `INV-${nextNumber.toString().padStart(4, '0')}`
}

/**
 * Create a new invoice in the database
 */
export async function createInvoice(
  userId: string,
  planId: PlanId,
  amount: number,
  interval: 'monthly' | 'yearly',
  options?: {
    paypalOrderId?: string
    lemonSqueezyOrderId?: string
    status?: 'paid' | 'pending' | 'failed' | 'refunded'
  }
): Promise<InvoiceRecord | null> {
  try {
    const supabase = createServerSupabaseClient()
    const invoiceNumber = await generateInvoiceNumber()

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        invoice_number: invoiceNumber,
        plan_id: planId,
        amount,
        currency: 'USD',
        interval,
        status: options?.status || 'paid',
        paypal_order_id: options?.paypalOrderId || null,
        lemon_squeezy_order_id: options?.lemonSqueezyOrderId || null,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Failed to create invoice:', error)
      return null
    }

    return data as InvoiceRecord
  } catch (error) {
    console.error('createInvoice error:', error)
    return null
  }
}

export type { InvoiceRecord }