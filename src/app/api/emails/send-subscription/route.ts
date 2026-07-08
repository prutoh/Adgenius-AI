import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/emails/client'
import { getSubscriptionWelcomeEmail } from '@/lib/emails/templates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      to,
      action,
      userName,
      planName,
      price,
      interval,
      oldPlan,
    } = body as {
      to: string
      action: 'new' | 'upgrade'
      userName: string
      planName: string
      price: string
      interval: 'monthly' | 'yearly'
      oldPlan?: string
    }

    if (!to) {
      return NextResponse.json({ error: 'Email address (to) is required' }, { status: 400 })
    }

    if (!planName || !price) {
      return NextResponse.json({ error: 'planName and price are required' }, { status: 400 })
    }

    const subject =
      action === 'new'
        ? `Welcome to AdGenius AI ${planName}! 🚀`
        : `Upgraded to ${planName}! 🎉`

    const html = getSubscriptionWelcomeEmail({
      userName: userName || 'Valued Customer',
      planName,
      price,
      interval: interval || 'monthly',
      action: action || 'new',
      oldPlan: oldPlan || 'Free',
    })

    const result = await sendEmail({ to, subject, html })

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email sent' })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('send-subscription error:', error)
    return NextResponse.json({ error: 'Failed to send subscription email' }, { status: 500 })
  }
}