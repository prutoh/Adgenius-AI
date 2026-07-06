import { Card } from '@/components/ui/card'
import {
  Sparkles,
  Zap,
  Globe,
  Palette,
  Copy,
  TrendingUp,
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Copy',
    description: 'Uses Google Gemini AI to generate human-like, engaging ad copy that converts.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get professional copy in seconds, not hours. No more staring at blank screens.',
  },
  {
    icon: Globe,
    title: 'Multi-Platform',
    description: 'Optimized formatting for Instagram, TikTok, Facebook, Twitter, and LinkedIn.',
  },
  {
    icon: Palette,
    title: 'Custom Tones',
    description: 'Choose from luxurious, professional, friendly, urgent, or emotional styles.',
  },
  {
    icon: Copy,
    title: 'One-Click Copy',
    description: 'Copy your generated ad instantly and paste it directly into your platform.',
  },
  {
    icon: TrendingUp,
    title: 'Conversion Focused',
    description: 'Every output is crafted to drive engagement, inquiries, and sales.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
            Everything You Need to Create Winning Ads
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Stop wasting time on copywriting. Let AI handle the heavy lifting while you focus on closing deals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} variant="default" padding="lg" className="group hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-200 transition-colors">
                <feature.icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}