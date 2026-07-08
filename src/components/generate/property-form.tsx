'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { PropertyInput, LandSizeUnit } from '@/types'
import { PROPERTY_TYPE_LABELS, PLATFORM_LABELS, TONE_LABELS, PRICE_PERIOD_LABELS, LAND_SIZE_UNIT_LABELS } from '@/types/ai'
import { COMMON_FEATURES } from '@/lib/utils/constants'
import { Sparkles, Plus } from 'lucide-react'

export function PropertyForm({ planId = 'free' }: { planId?: string }) {
  const [formData, setFormData] = useState<Partial<PropertyInput>>({
    property_type: 'apartment',
    location: '',
    bedrooms: 1,
    bathrooms: 1,
    price: '',
    price_period: 'month',
    land_size: '',
    land_size_unit: 'sqm',
    key_features: [],
    target_platform: 'instagram',
    tone: 'luxurious',
    additional_notes: '',
  })

  const [customFeature, setCustomFeature] = useState('')
  const [draftFeatures, setDraftFeatures] = useState<string[]>([])
  const [savedNotes, setSavedNotes] = useState('')
  const [showFeatureSuccess, setShowFeatureSuccess] = useState(false)
  const [showNotesSuccess, setShowNotesSuccess] = useState(false)

  const propertyTypeOptions = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label }))
  const platformOptions = Object.entries(PLATFORM_LABELS).map(([value, label]) => ({ value, label }))
  const toneOptions = Object.entries(TONE_LABELS).map(([value, label]) => ({ value, label }))
  const pricePeriodOptions = Object.entries(PRICE_PERIOD_LABELS).map(([value, label]) => ({ value, label }))
  const landSizeUnitOptions = Object.entries(LAND_SIZE_UNIT_LABELS).map(([value, label]) => ({ value, label }))

  function updateField(key: string, value: any) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  function toggleFeature(feature: string) {
    const features = formData.key_features || []
    if (features.includes(feature)) {
      updateField('key_features', features.filter(f => f !== feature))
    } else {
      updateField('key_features', [...features, feature])
    }
  }

  function addCustomFeature() {
    if (customFeature.trim()) {
      const currentFeatures = formData.key_features || []
      if (!currentFeatures.includes(customFeature.trim())) {
        setFormData(prev => ({ ...prev, key_features: [...currentFeatures, customFeature.trim()] }))
      }
      setCustomFeature('')
    }
  }

  // --- NEW STAGING FUNCTIONS ---
  function handleSaveFeature() {
    if (customFeature.trim()) {
      if (!draftFeatures.includes(customFeature.trim())) {
        setDraftFeatures(prev => [...prev, customFeature.trim()])
      }
      setCustomFeature('')
      setShowFeatureSuccess(true)
      setTimeout(() => setShowFeatureSuccess(false), 2000)
    }
  }

  function removeDraftFeature(feature: string) {
    setDraftFeatures(prev => prev.filter(f => f !== feature))
  }

  function handleSaveNotes() {
    setSavedNotes(formData.additional_notes || '')
    setShowNotesSuccess(true)
    setTimeout(() => setShowNotesSuccess(false), 2000)
  }

  // Watch for locked platform changes
  useEffect(() => {
    const currentPlatform = formData.target_platform || ''
    const isLocked = (planId || 'free').toLowerCase() === 'free' && !['instagram', 'tiktok'].includes(currentPlatform)
    
    if (isLocked) {
      window.dispatchEvent(new CustomEvent('show-paywall'))
      updateField('target_platform', 'instagram')
    }
  }, [formData.target_platform, planId])

  function handleFormSubmit() {
    if (!formData.location || !formData.price) return
    
    // Merge the standard selected features with the saved custom drafts
    const finalFeatures = [
      ...(formData.key_features || []),
      ...draftFeatures
    ]

    const finalData = {
      ...formData,
      key_features: finalFeatures,
      additional_notes: savedNotes || formData.additional_notes
    }

    window.dispatchEvent(new CustomEvent('start-generation', { 
      detail: finalData as PropertyInput 
    }))
  }

  const isValid = formData.location && formData.price && (formData.key_features?.length || 0) > 0

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit() }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Property Type" options={propertyTypeOptions} value={formData.property_type} onChange={(e) => updateField('property_type', e.target.value)} />
        <Input label="Location" placeholder="e.g., Westlands, Nairobi" value={formData.location || ''} onChange={(e) => updateField('location', e.target.value)} required />
      </div>

      {/* Land Size Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input 
            label="Land / Plot Size (Optional)" 
            type="number" 
            min="0"
            placeholder="e.g., 0.5 or 1200" 
            value={formData.land_size || ''} 
            onChange={(e) => updateField('land_size', e.target.value)} 
            hint="Leave blank if not applicable (e.g., for apartments)"
          />
        </div>
        <Select 
          label="Size Unit" 
          options={landSizeUnitOptions} 
          value={formData.land_size_unit || 'sqm'} 
          onChange={(e) => updateField('land_size_unit', e.target.value as LandSizeUnit)} 
        />
      </div>

      {/* Bedrooms, Bathrooms, Price Period - STRICT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bedrooms</label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => updateField('bedrooms', Math.max(0, (formData.bedrooms || 0) - 1))} className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-gray-300">-</button>
            <span className="w-12 text-center font-medium dark:text-gray-100">{formData.bedrooms || 0}</span>
            <button type="button" onClick={() => updateField('bedrooms', (formData.bedrooms || 0) + 1)} className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-gray-300">+</button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bathrooms</label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => updateField('bathrooms', Math.max(0, (formData.bathrooms || 0) - 1))} className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-gray-300">-</button>
            <span className="w-12 text-center font-medium dark:text-gray-100">{formData.bathrooms || 0}</span>
            <button type="button" onClick={() => updateField('bathrooms', (formData.bathrooms || 0) + 1)} className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-gray-300">+</button>
          </div>
        </div>

        <Select label="Price Period" options={pricePeriodOptions} value={formData.price_period} onChange={(e) => updateField('price_period', e.target.value)} />
      </div>

      <Input label="Price (USD)" type="number" min="0" placeholder="e.g., 50000" value={formData.price || ''} onChange={(e) => updateField('price', Math.max(0, Number(e.target.value)).toString())} required hint="Enter price in USD" />

      {/* Key Features & Custom Features Staging Area */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Key Features <span className="text-gray-400 dark:text-gray-500">(select at least one)</span></label>
        <div className="flex flex-wrap gap-2">
          {COMMON_FEATURES.map((feature) => (
            <button key={feature} type="button" onClick={() => toggleFeature(feature)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${(formData.key_features || []).includes(feature) ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border border-brand-300 dark:border-brand-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {feature}
            </button>
          ))}
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a custom feature (e.g., Mini-split ACs)"
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter') { 
                  e.preventDefault(); 
                  handleSaveFeature() 
                } 
              }}
              className="flex-1 flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <button type="button" onClick={addCustomFeature} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 h-10 text-sm font-medium hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-800 transition-all">
              Quick Add
            </button>
            <button type="button" onClick={handleSaveFeature} className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-brand-600 text-brand-600 dark:text-brand-400 px-3 h-10 text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all">
              Save to List
            </button>
          </div>
          {showFeatureSuccess && <p className="text-xs text-green-600 font-medium">✓ Feature saved to list!</p>}
          
          {draftFeatures.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-950 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Saved Custom Features:</p>
              {draftFeatures.map((feat) => (
                <div key={feat} className="flex items-center justify-between bg-white dark:bg-gray-900 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-800 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                  <span>{feat}</span>
                  <button type="button" onClick={() => removeDraftFeature(feat)} className="text-gray-400 hover:text-red-500 text-xs">✕ Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Target Platform" options={platformOptions} value={formData.target_platform} onChange={(e) => updateField('target_platform', e.target.value)} />
        <Select label="Tone" options={toneOptions} value={formData.tone} onChange={(e) => updateField('tone', e.target.value)} />
      </div>

      {/* Additional Notes with Save Button */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes (Optional)</label>
        <textarea
          placeholder="Write any special details here, then click 'Save Notes' below..."
          value={formData.additional_notes || ''}
          onChange={(e) => updateField('additional_notes', e.target.value)}
          rows={3}
          className="flex min-h-[100px] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-y"
        />
        <div className="flex items-center justify-between">
          <div>
            {showNotesSuccess && <span className="text-xs text-green-600 font-medium">✓ Notes saved successfully!</span>}
          </div>
          <button
            type="button"
            onClick={handleSaveNotes}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 underline"
          >
            Save Notes
          </button>
        </div>
        
        {savedNotes && (
          <div className="bg-gray-50 dark:bg-gray-950 dark:bg-gray-800 rounded-lg p-3 border border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Saved Notes Preview:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{savedNotes}</p>
          </div>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={!isValid} icon={<Sparkles className="h-5 w-5" />}>
        Generate Ad Copy
      </Button>
    </form>
  )
}