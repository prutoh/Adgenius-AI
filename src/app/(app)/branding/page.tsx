'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { AlertTriangle, Palette, Save, Eye, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

interface BrandingSettings {
  brand_name: string
  brand_tagline: string
  brand_website: string
  brand_cta: string
  brand_voice: string
  include_branding: boolean
}

const DEFAULT_BRANDING: BrandingSettings = {
  brand_name: '',
  brand_tagline: '',
  brand_website: '',
  brand_cta: 'Contact us today',
  brand_voice: 'professional',
  include_branding: true,
}

const VOICE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly & Warm' },
  { value: 'luxurious', label: 'Luxurious & Elite' },
  { value: 'bold', label: 'Bold & Confident' },
  { value: 'trustworthy', label: 'Trustworthy & Reliable' },
]

export default function BrandingPage() {
  const { isAuthenticated, isLoading: authLoading, profile, planId } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/branding')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    async function fetchBranding() {
      if (!isAuthenticated || !profile?.id) return
      const { data } = await supabase
        .from('branding')
        .select('*')
        .eq('user_id', profile.id)
        .single()

      if (data) {
        setBranding({
          brand_name: data.brand_name || '',
          brand_tagline: data.brand_tagline || '',
          brand_website: data.brand_website || '',
          brand_cta: data.brand_cta || 'Contact us today',
          brand_voice: data.brand_voice || 'professional',
          include_branding: data.include_branding !== false,
        })
      }
      setIsLoading(false)
    }
    if (isAuthenticated && profile?.id) fetchBranding()
  }, [isAuthenticated, profile?.id, supabase])

  async function handleSave() {
    if (!profile?.id) return
    setIsSaving(true)
    setSaveSuccess(false)

    const payload = {
      user_id: profile.id,
      ...branding,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('branding')
      .upsert(payload, { onConflict: 'user_id' })

    if (!error) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    setIsSaving(false)
  }

  function updateField(key: keyof BrandingSettings, value: string | boolean) {
    setBranding(prev => ({ ...prev, [key]: value }))
  }

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center pt-16"><Loader size="lg" text="Loading..." /></div>
  }

  if (!isAuthenticated) return null

  if (planId !== 'unlimited') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <Card variant="bordered" padding="lg" className="max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Unlimited Feature</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Custom branding is exclusively available on the Unlimited plan. Personalize your ad copies with your brand identity.
          </p>
          <Button onClick={() => router.push('/pricing')}>View Pricing</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Custom Branding</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-0.5">Personalize your generated ad copies with your brand identity.</p>
            </div>
          </div>
        </div>

        {/* Enable/Disable Toggle */}
        <Card variant="bordered" padding="md" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Include Branding in Ads</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                When enabled, your brand info will be woven into generated ad copy automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateField('include_branding', !branding.include_branding)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                branding.include_branding ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-900 transition-transform shadow-sm ${
                  branding.include_branding ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>

        {branding.include_branding && (
          <div className="space-y-6">
            <Card variant="bordered" padding="md">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Brand Identity</h2>
              <div className="space-y-4">
                <Input
                  label="Brand / Company Name"
                  placeholder="e.g., Prestige Homes Kenya"
                  value={branding.brand_name}
                  onChange={(e) => updateField('brand_name', e.target.value)}
                />
                <Input
                  label="Tagline or Slogan"
                  placeholder="e.g., Your Gateway to Luxury Living"
                  value={branding.brand_tagline}
                  onChange={(e) => updateField('brand_tagline', e.target.value)}
                />
                <Input
                  label="Website URL"
                  placeholder="e.g., https://www.prestigehomes.co.ke"
                  value={branding.brand_website}
                  onChange={(e) => updateField('brand_website', e.target.value)}
                  hint="Included in ad copy as the call-to-action destination."
                />
              </div>
            </Card>

            <Card variant="bordered" padding="md">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Ad Preferences</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Call-to-Action</label>
                  <input
                    type="text"
                    placeholder="e.g., DM us for details or Visit our website"
                    value={branding.brand_cta}
                    onChange={(e) => updateField('brand_cta', e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-900 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500">This CTA replaces the default one in your generated ads.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand Voice</label>
                  <div className="flex flex-wrap gap-2">
                    {VOICE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField('brand_voice', option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                          branding.brand_voice === option.value
                            ? 'bg-brand-100 text-brand-700 border-brand-300 dark:bg-brand-900/30 dark:border-brand-700'
                            : 'bg-gray-50 text-gray-600 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Preview */}
            {branding.brand_name && (
              <Card variant="bordered" padding="md" className="bg-purple-50/50 border-purple-200">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-600" /> Branding Preview
                </h3>
                <div className="bg-white dark:bg-gray-900 dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your ads will include: <strong>{branding.brand_name}</strong>
                    {branding.brand_tagline && <span> &mdash; <em>&quot;{branding.brand_tagline}&quot;</em></span>}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Voice: <span className="font-medium capitalize">{branding.brand_voice}</span>
                    {branding.brand_cta && <span> &bull; CTA: &quot;{branding.brand_cta}&quot;</span>}
                  </p>
                  {branding.brand_website && (
                    <p className="text-xs text-gray-400 mt-1">Website link will be included in ad copy.</p>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex items-center justify-end gap-3">
          {saveSuccess && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1 animate-fade-in">
              <Check className="h-4 w-4" /> Branding saved!
            </span>
          )}
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={!branding.include_branding}
            icon={<Save className="h-4 w-4" />}
            size="lg"
          >
            Save Branding
          </Button>
        </div>
      </div>
    </div>
  )
}