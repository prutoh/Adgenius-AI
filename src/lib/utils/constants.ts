import { Plan, PlanId } from '@/types'

/**
 * App name from environment
 */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'AdGenius AI'

/**
 * App URL from environment
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Free tier generation limit
 */
export const FREE_TIER_LIMIT = 3

/**
 * Plan generation limits
 */
export const PLAN_LIMITS: Record<PlanId, number | null> = {
  free: FREE_TIER_LIMIT,
  pro: 50,
  unlimited: null, // null = unlimited
}

/**
 * Plan definitions
 */
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceYearly: 0,
    generations: FREE_TIER_LIMIT,
    features: [
      `${FREE_TIER_LIMIT} generations per month`,
      'Instagram & TikTok only',
      'Basic templates',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    priceYearly: 79,
    generations: 50,
    features: [
      '50 generations per month',
      'All platforms',
      'All tones & templates',
      'Generation history',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 29,
    priceYearly: 249,
    generations: null,
    features: [
      'Unlimited generations',
      'All platforms',
      'All tones & templates',
      'Generation history',
      'Priority support',
      'API access (coming soon)',
      'Custom branding (coming soon)',
    ],
  },
]

/**
 * Common feature list for property types
 */
export const COMMON_FEATURES = [
  // Outdoor & Landscaping
  'Swimming Pool',
  'Landscaped Garden',
  'Rooftop Terrace',
  'Balcony',
  'Patio/Deck',
  'Ocean View',
  'Mountain View',
  'Lake View',
  // Interior & Finishes
  'Hardwood Floors',
  'High Ceilings',
  'Open Floor Plan',
  'Walk-in Closet',
  'Built-in Wardrobes',
  'Smart Home Features',
  'Fireplace',
  'Large Windows',
  // Amenities & Facilities
  'Gym/Fitness Center',
  '24/7 Security',
  'Gated Community',
  'Elevator/Lift',
  'Underground Parking',
  'EV Charging Station',
  'Backup Generator',
  'Solar Panels',
  'High Speed Internet',
  'Air Conditioning',
  'Central Heating',
  // Utility & Extras
  'Pet Friendly',
  'Furnished',
  'Serviced Apartment',
  'Maid Quarter',
  'Guest House',
  'Home Office',
  'Utility Room',
  'Boat Dock',
] as const

/**
 * Platform character limits
 */
export const PLATFORM_LIMITS: Record<string, number> = {
  instagram: 2200,
  tiktok: 2200,
  facebook: 63206,
  twitter: 280,
  linkedin: 3000,
}