import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/utils/constants'
import { Sparkles, ArrowRight, Play } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTEydjRoMTJ6TTI0IDI0aDEydi0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
          <Sparkles className="h-4 w-4 text-brand-300" />
          <span className="text-sm text-brand-100">
            Powered by Google Gemini AI
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Turn Property Details Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">
            High-Converting Ads
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-brand-200 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop struggling with AI prompts. {APP_NAME} transforms your real estate listings 
          into scroll-stopping social media copy in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Start Free - No Card Required
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/#how-it-works">
            <Button variant="ghost" size="lg" className="text-brand-200 hover:text-white hover:bg-white/10">
              <Play className="h-5 w-5" />
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-brand-300">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">10,000+</p>
            <p className="text-sm">Ads Generated</p>
          </div>
          <div className="w-px h-12 bg-brand-700 hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-white">500+</p>
            <p className="text-sm">Real Estate Agents</p>
          </div>
          <div className="w-px h-12 bg-brand-700 hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-white">4.9/5</p>
            <p className="text-sm">User Rating</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  )
}