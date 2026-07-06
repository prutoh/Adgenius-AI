import { APP_NAME } from '@/lib/utils/constants'

export const metadata = {
  title: 'Terms of Service',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6">
          <p>These Terms of Service (&quot;Terms&quot;) govern your access to and use of {APP_NAME} (&quot;the Service&quot;), operated by us. By accessing or using the Service, you agree to be bound by these Terms.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">1. Acceptance of Terms</h2>
          <p>By creating an account or using the Service, you confirm that you are at least 18 years old and agree to comply with these Terms. If you do not agree, you may not use the Service.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">2. Description of Service</h2>
          <p>{APP_NAME} is an AI-powered tool designed to assist real estate professionals in generating marketing copy for social media platforms based on user-provided property details.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">4. Subscriptions and Payments</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Certain features of the Service require a paid subscription. Prices are listed on our pricing page.</li>
            <li>Billing is handled by Lemon Squeezy, our Merchant of Record. By subscribing, you agree to Lemon Squeezy&apos;s Terms of Service.</li>
            <li>Subscriptions automatically renew unless cancelled before the end of the current billing period.</li>
            <li>We reserve the right to change our pricing with 30 days&apos; notice.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">5. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Generate content that is illegal, harmful, threatening, abusive, or defamatory.</li>
            <li>Advertise illegal real estate listings or engage in fraudulent activities.</li>
            <li>Attempt to reverse engineer, hack, or disrupt the Service or its underlying AI models.</li>
            <li>Resell access to the Service without explicit written permission.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">6. Intellectual Property & AI Output</h2>
          <p>You retain ownership of the inputs you provide (e.g., property details). {APP_NAME} grants you a worldwide, non-exclusive license to use the AI-generated ad copy for your marketing purposes. We do not claim ownership over the output generated for you.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">7. AI Disclaimer</h2>
          <p>The Service relies on artificial intelligence. AI-generated content may contain inaccuracies, hallucinations, or errors. <strong>You are solely responsible for reviewing, editing, and fact-checking all generated copy before publishing it.</strong> We are not liable for any consequences arising from the publication of unedited AI output.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">8. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, {APP_NAME} and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">9. Changes to Terms</h2>
          <p>We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">10. Contact Us</h2>
          <p>If you have questions about these Terms, please contact us at support@adgenius.ai.</p>
        </div>
      </div>
    </div>
  )
}