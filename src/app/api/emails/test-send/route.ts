import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/emails/client'
import { getWelcomeEmailTemplate } from '@/lib/emails/templates/welcome-email'
import { getInvoiceEmailTemplate } from '@/lib/emails/templates/invoice-email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    let subject = ''
    let html = ''

    if (type === 'welcome') {
      subject = 'Test: Welcome to AdGenius AI! 🚀'
      html = getWelcomeEmailTemplate('Test User', 'Pro', '9')
    } else if (type === 'invoice') {
      subject = 'Test: Your AdGenius AI Invoice'
      html = getInvoiceEmailTemplate('TEST-12345', 'Test User', 'Unlimited', '29', 'January 1, 2025')
    } else {
      return NextResponse.json({ error: 'Invalid type. Use "welcome" or "invoice".' }, { status: 400 })
    }

    const result = await sendEmail({ to: email, subject, html })

    if (result.success) {
      return NextResponse.json({ success: true, message: `Check ${email}!` })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}