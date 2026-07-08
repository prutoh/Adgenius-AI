// ============================================
// AUTH TYPES
// ============================================
export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan_id: PlanId
  created_at: string
}

export type PlanId = 'free' | 'pro' | 'unlimited'

// ============================================
// GENERATION TYPES
// ============================================
export interface PropertyInput {
  property_type: PropertyType
  location: string
  bedrooms: number
  bathrooms: number
  price: string
  price_period: PricePeriod
  land_size?: string          // <-- ADD THIS
  land_size_unit?: LandSizeUnit // <-- ADD THIS
  key_features: string[]
  target_platform: Platform
  tone: Tone
  additional_notes?: string
}

export type PropertyType = 
  | 'apartment'
  | 'house'
  | 'villa'
  | 'penthouse'
  | 'townhouse'
  | 'condo'
  | 'land'
  | 'commercial'

export type PricePeriod = 'month' | 'year' | 'sale'

export type Platform = 
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'twitter'
  | 'linkedin'

export type Tone = 
  | 'luxurious'
  | 'professional'
  | 'friendly'
  | 'urgent'
  | 'emotional'

  export type LandSizeUnit = 
  | 'sqft' 
  | 'sqm' 
  | 'acres' 
  | 'hectares' 
  | 'marla' 
  | 'kanal' 
  | 'gunta' 
  | 'sq_yards'

export interface GenerationResult {
  id: string
  input_data: PropertyInput
  output_text: string
  platform: Platform
  created_at: string
}

// ============================================
// USAGE TYPES
// ============================================
// ============================================
// USAGE TYPES
// ============================================
export interface UsageInfo {
  used: number
  limit: number | null
  remaining: number | null
  plan: PlanId
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================
export interface Subscription {
  id: string
  user_id: string
  plan_id: PlanId
  status: 'active' | 'cancelled' | 'past_due' | 'expired'
  current_period_start: string | null
  current_period_end: string | null
  lemon_squeezy_subscription_id: string | null
  created_at: string
}

// ============================================
// API KEYS (Unlimited Plan Feature)
// ============================================
export interface ApiKey {
  id: string
  user_id: string
  name: string
  key_hash: string
  created_at: string
  expires_at: string
  last_used_at: string | null
}

// ============================================
// PLAN TYPES
// ============================================
export interface Plan {
  id: PlanId
  name: string
  price: number
  priceYearly: number
  generations: number | null // null = unlimited
  features: string[]
  highlighted?: boolean
}

// ============================================
// INVOICE TYPES
// ============================================
export interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  plan_id: PlanId
  amount: number
  currency: string
  interval: 'monthly' | 'yearly'
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  pdf_url: string | null
  paypal_order_id: string | null
  lemon_squeezy_order_id: string | null
  created_at: string
}

// ============================================
// API TYPES
// ============================================
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}