// ============================================
// AI RESPONSE TYPES
// ============================================

export interface GeminiResponse {
  text: string
  finishReason: string
}

export interface StreamChunk {
  text: string
  done: boolean
}

// ============================================
// PROMPT TEMPLATES
// ============================================

export interface PromptTemplate {
  system: string
  user: string
  variables: string[]
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  villa: 'Villa',
  penthouse: 'Penthouse',
  townhouse: 'Townhouse',
  condo: 'Condo',
  land: 'Land',
  commercial: 'Commercial Property',
}

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
}

export const TONE_LABELS: Record<string, string> = {
  luxurious: 'Luxurious & Premium',
  professional: 'Professional',
  friendly: 'Friendly & Warm',
  urgent: 'Urgent & FOMO',
  emotional: 'Emotional & Storytelling',
}

export const PRICE_PERIOD_LABELS: Record<string, string> = {
  month: 'per month',
  year: 'per year',
  sale: 'for sale',
}

export const LAND_SIZE_UNIT_LABELS: Record<string, string> = {
  sqft: 'Square Feet (sq ft)',
  sqm: 'Square Meters (m²)',
  acres: 'Acres',
  hectares: 'Hectares',
  marla: 'Marla',
  kanal: 'Kanal',
  gunta: 'Gunta',
  sq_yards: 'Square Yards (sq yd)',
}