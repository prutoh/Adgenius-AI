import { APP_NAME } from '@/lib/utils/constants'

export const metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6">
          <p>At {APP_NAME} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">1. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>Account Data:</strong> When you sign up, we collect your name and email address via Supabase (our authentication provider). You may also link a Google account.</li>
            <li><strong>Usage Data:</strong> We collect the property details you input to generate ads, as well as the AI-generated output text, which is saved to your history.</li>
            <li><strong>Payment Data:</strong> We do not store your credit card information. All payments are processed securely by Lemon Squeezy, our Merchant of Record.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Provide, maintain, and improve the {APP_NAME} service.</li>
            <li>Process your transactions and send related information (via Lemon Squeezy).</li>
            <li>Respond to your comments, questions, and requests.</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our service.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">3. Sharing Your Information</h2>
          <p>We may share your information only in the following situations:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>Service Providers:</strong> We share data with Supabase (database/auth), Google AI (to process your prompts), Lemon Squeezy (payment processing), and Vercel (hosting).</li>
            <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">4. Data Retention</h2>
          <p>We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">5. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal data at any time. You can do this by logging into your account and navigating to the dashboard, or by contacting us directly to request account deletion.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">6. Security</h2>
          <p>We implement appropriate technical and organizational security measures to protect your personal data. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@adgenius.ai.</p>
        </div>
      </div>
    </div>
  )
}