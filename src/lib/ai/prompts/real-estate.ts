import type { Platform, Tone } from '@/types'

/**
 * Base System Prompt for Real Estate Niche
 */
export const REAL_ESTATE_SYSTEM_PROMPT = `You are an expert real estate copywriter specializing in social media marketing. You create high-converting ad copy that drives engagement and inquiries.

Your writing style should be:
- Attention-grabbing from the first line
- Use emojis strategically (not too many)
- Include a clear call-to-action
- Highlight the most valuable features
- Create urgency or desire
- Be authentic and avoid clickbait`

/**
 * Platform-Specific Instructions
 */
export const PLATFORM_INSTRUCTIONS: Record<Platform, string> = {
  instagram: `Instagram Guidelines:
- Use 3-5 line breaks between sections for readability
- Include 20-25 relevant hashtags at the end
- Start with a hook in the first line
- Ideal length: 150-300 words before hashtags
- Use line breaks as paragraphs, not bullet points`,

  tiktok: `TikTok Guidelines:
- Keep it punchy and energetic
- Use short sentences
- Include 3-5 hashtags maximum
- Create FOMO or curiosity
- Ideal length: 100-200 words
- Make it sound like you're talking to a friend`,

  facebook: `Facebook Guidelines:
- Can be slightly longer and more detailed
- Use emojis but keep it professional
- Include a question to encourage comments
- 5-10 relevant hashtags
- Ideal length: 200-400 words`,

  twitter: `Twitter/X Guidelines:
- MUST be under 280 characters
- Get straight to the point
- Use 1-2 hashtags max
- Include a link placeholder [LINK]
- Every word must count`,

  linkedin: `LinkedIn Guidelines:
- Professional but engaging tone
- Can be longer and more detailed
- Focus on investment value and location benefits
- Use 3-5 hashtags
- Ideal length: 150-300 words
- End with a professional question`,
}

/**
 * Tone-Specific Instructions
 */
export const TONE_INSTRUCTIONS: Record<Tone, string> = {
  luxurious: `Use words like: exclusive, premium, elite, sophisticated, unparalleled, bespoke, refined, prestigious. Make the reader feel this is a rare opportunity.`,

  professional: `Use clear, factual language. Focus on specifications, location benefits, and investment value. Avoid overly emotional language.`,

  friendly: `Use warm, conversational language. Speak like a helpful friend. Use phrases like "Imagine this..." and "Picture yourself..."`,

  urgent: `Create FOMO (Fear Of Missing Out). Use phrases like "Won't last long", "Just listed", "Rare find", "Act fast". Emphasize scarcity.`,

  emotional: `Tell a story. Paint a picture of the lifestyle this property offers. Focus on feelings, memories, and dreams. Make them fall in love before they see the price.`,
}

/**
 * Constructs the final prompt payload for the AI model
 */
export function buildRealEstatePrompt(input: {
  property_type: string
  location: string
  bedrooms: number
  bathrooms: number
  price: string
  price_period: string
  key_features: string[]
  target_platform: Platform
  tone: Tone
  additional_notes?: string
  land_size?: string
  land_size_unit?: string
  branding?: {
    brand_name: string
    brand_tagline?: string
    brand_website?: string
    brand_cta?: string
    brand_voice?: string
  } | null
}): string {
  const platformInstruction = PLATFORM_INSTRUCTIONS[input.target_platform] || PLATFORM_INSTRUCTIONS.instagram
  const toneInstruction = TONE_INSTRUCTIONS[input.tone] || TONE_INSTRUCTIONS.professional

  let brandingBlock = ''
  if (input.branding && input.branding.brand_name) {
    brandingBlock = `
BRAND IDENTITY (incorporate naturally into the ad copy):
- Brand Name: ${input.branding.brand_name}
${input.branding.brand_tagline ? `- Tagline: "${input.branding.brand_tagline}"` : ''}
${input.branding.brand_website ? `- Website: ${input.branding.brand_website}` : ''}
${input.branding.brand_cta ? `- Call-to-Action: "${input.branding.brand_cta}"` : ''}
${input.branding.brand_voice ? `- Brand Voice: ${input.branding.brand_voice}` : ''}

IMPORTANT: Weave the brand name and identity naturally into the ad. Use the custom CTA instead of a generic one. The ad should feel like it comes from this brand.`
  }

  return `${REAL_ESTATE_SYSTEM_PROMPT}

PLATFORM: ${input.target_platform.toUpperCase()}
 ${platformInstruction}

TONE: ${input.tone.toUpperCase()}
 ${toneInstruction}
${brandingBlock}

PROPERTY DETAILS:
- Type: ${input.property_type}
- Location: ${input.location}
- Bedrooms: ${input.bedrooms}
- Bathrooms: ${input.bathrooms}
- Price: $${Number(input.price).toLocaleString()} ${input.price_period === 'sale' ? '(For Sale)' : `(per ${input.price_period})`}
 ${input.land_size ? `- Land/Plot Size: ${input.land_size} ${input.land_size_unit || ''}` : ''}
- Key Features: ${input.key_features.join(', ')}
 ${input.additional_notes ? `- Additional Notes: ${input.additional_notes}` : ''}

Generate compelling ad copy for this property. The output should be ready to copy and paste directly into the platform.`
}