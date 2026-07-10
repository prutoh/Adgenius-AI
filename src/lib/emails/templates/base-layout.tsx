export function getBaseEmailTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AdGenius AI</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', system-ui, sans-serif; color: #1f2937; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 30px 40px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
        .header p { margin: 8px 0 0 0; color: #bae6fd; font-size: 14px; }
        .body-content { padding: 40px; }
        .footer { background: #f8fafc; padding: 20px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer a { color: #0284c7; text-decoration: none; }
        .btn { display: inline-block; background: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
        .amount { font-size: 32px; font-weight: 800; color: #111827; }
        .plan-name { font-size: 16px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AdGenius AI</h1>
          <p>AI Real Estate Copy Generator</p>
        </div>
        <div class="body-content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} AdGenius AI. All rights reserved.</p>
          <p>Made with ❤️ in Kenya</p>
        </div>
      </div>
    </body>
    </html>
  `
}