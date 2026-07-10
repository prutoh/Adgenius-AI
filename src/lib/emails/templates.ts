import { getBaseEmailTemplate } from './templates/base-layout'

interface SubscriptionEmailParams {
  userName: string
  planName: string
  price: string
  interval: 'monthly' | 'yearly'
  action: 'new' | 'upgrade'
  oldPlan: string
}

/**
 * Welcome/Upgrade subscription email template
 */
export function getSubscriptionWelcomeEmail(params: SubscriptionEmailParams): string {
  const { userName, planName, price, interval, action, oldPlan } = params

  const billingCycle = interval === 'monthly' ? 'month' : 'year'

  if (action === 'new') {
    const content = `
      <h2 style="color: #111827; margin-bottom: 10px;">Welcome to AdGenius AI, ${userName}! 🎉</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        Thank you for subscribing to the <strong>${planName}</strong>! Your payment of
        <strong>$${price}</strong> has been received successfully.
      </p>
      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #15803d; font-weight: 600; font-size: 14px;">Subscription Active</p>
        <p style="margin: 0; color: #166534; font-size: 14px;">
          ${planName} &middot; $${price}/${billingCycle} &middot; Billed ${interval}
        </p>
      </div>
      <p style="color: #4b5563; line-height: 1.6;">
        You now have access to all the features included in your plan. Head over to your dashboard
        to start generating high-converting real estate ad copy in seconds.
      </p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/generate" class="btn">Start Generating Now</a>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 24px;">
        You can manage your subscription and view invoices from your
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" style="color: #0284c7;">billing dashboard</a>.
        If you have any questions, reply directly to this email.
      </p>
    `
    return getBaseEmailTemplate(content)
  }

  // Upgrade email
  const content = `
    <h2 style="color: #111827; margin-bottom: 10px;">You've Been Upgraded! 🚀</h2>
    <p style="color: #4b5563; line-height: 1.6;">
      Great news, ${userName}! You've been successfully upgraded from
      <strong>${oldPlan}</strong> to the <strong>${planName}</strong>.
    </p>
    <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #854d0e; font-weight: 600; font-size: 14px;">Upgrade Summary</p>
      <p style="margin: 0; color: #713f12; font-size: 14px;">
        ${oldPlan} → ${planName} &middot; $${price}/${billingCycle}
      </p>
    </div>
    <p style="color: #4b5563; line-height: 1.6;">
      Your new plan is active immediately. Enjoy the additional features and higher generation limits
      that come with the ${planName}!
    </p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/generate" class="btn">Start Generating Now</a>
    </div>
    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 24px;">
      You can manage your subscription and view invoices from your
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" style="color: #0284c7;">billing dashboard</a>.
    </p>
  `
  return getBaseEmailTemplate(content)
}