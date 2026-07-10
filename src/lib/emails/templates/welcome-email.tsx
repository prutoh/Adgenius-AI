import { getBaseEmailTemplate } from './base-layout'

export function getWelcomeEmailTemplate(name: string, plan: string, price: string) {
  const content = `
        <h2 style="color: #111827; margin-bottom: 10px;">Welcome to AdGenius AI, ${name}! 🎉</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Your account has been successfully created. You are currently on the <strong>${plan} Plan</strong> ($${price}/month).
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          Head over to your dashboard to start generating high-converting real estate ads in seconds.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/generate" class="btn">Start Generating Now</a>
        </div>
      `
  
  return getBaseEmailTemplate(content)
}