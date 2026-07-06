import { getBaseEmailTemplate } from './base-layout'

export function getInvoiceEmailTemplate(invoiceId: string, name: string, plan: string, price: string, date: string) {
  const content = `
        <h2 style="color: #111827; margin-bottom: 20px;">Receipt & Invoice</h2>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 5px 0; color: #0369a1; font-size: 14px; font-weight: 600;">INVOICE</p>
          <p style="margin: 0 0 5px 0; color: #64748b; font-size: 14px;"><strong>Invoice #${invoiceId}</strong></p>
          <p style="margin: 0 0 5px 0; color: #64748b; font-size: 14px;">Date: ${date}</p>
        </div>

        <p style="color: #4b5563; margin-bottom: 20px;">
          <strong>Bill To:</strong><br />
          ${name}
        </p>

        <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 15px 0; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #64748b;">Plan</span>
            <span style="font-weight: 600; color: #111827;">${plan} Plan</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #64748b;">Billing Cycle</span>
            <span style="font-weight: 600; color: #111827;">Monthly</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Amount</span>
            <span style="font-size: 20px; font-weight: 800; color: #111827;">$${price}.00</span>
          </div>
        </div>

        <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
          If you have any questions about your subscription or need a refund, please reply directly to this email.
        </p>
      `
  
  return getBaseEmailTemplate(content)
}