import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendEmail({ 
  to, 
  subject, 
  html 
}: { 
  to: string | string[]
  subject: string
  html: string 
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AdGenius AI <billing@adgenius.ai>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' }
  }
}