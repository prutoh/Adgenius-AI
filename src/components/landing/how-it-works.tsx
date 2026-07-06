import { Home, FileText, Sparkles, Share2 } from 'lucide-react'

const steps = [
  {
    icon: Home,
    step: '01',
    title: 'Enter Property Details',
    description: 'Fill in the property type, location, price, bedrooms, and key features.',
  },
  {
    icon: FileText,
    step: '02',
    title: 'Choose Your Style',
    description: 'Select your target platform (Instagram, TikTok, etc.) and preferred tone.',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'AI Generates Copy',
    description: 'Our AI creates platform-optimized, high-converting ad copy instantly.',
  },
  {
    icon: Share2,
    step: '04',
    title: 'Copy & Post',
    description: 'One-click copy your ad and paste it directly into your social media.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
            From Listing to Ad in 4 Simple Steps
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            No learning curve. No prompt engineering. Just fill in the details and get your ad.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-brand-200" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex">
                  <div className="w-24 h-24 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <step.icon className="h-10 w-10 text-brand-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}