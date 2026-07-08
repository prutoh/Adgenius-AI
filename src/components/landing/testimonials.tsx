import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Real Estate Agent, Nairobi',
    content: 'This tool saved me hours of copywriting every week. My engagement on Instagram has tripled since I started using AdGenius AI.',
    rating: 5,
  },
  {
    name: 'James K.',
    role: 'Property Developer, Mombasa',
    content: 'I used to hire a copywriter for $200/month. Now I get better results for a fraction of the cost. The TikTok scripts are especially good.',
    rating: 5,
  },
  {
    name: 'Amina O.',
    role: 'Real Estate Agency Owner',
    content: 'My entire team uses this now. We went from posting once a week to daily, and our leads have increased by 5x.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Loved by Real Estate Professionals
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} variant="default" padding="lg">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center">
                  <span className="text-brand-600 font-semibold">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}