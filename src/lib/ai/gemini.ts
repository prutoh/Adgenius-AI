import { buildRealEstatePrompt } from '@/lib/ai/prompts/real-estate'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { PropertyInput } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

/**
 * Generate real estate ad copy using Gemini AI
 */
export async function generateRealEstateAd(
  input: PropertyInput
): Promise<ReadableStream<Uint8Array>> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = buildRealEstatePrompt(input)

  const result = await model.generateContentStream(prompt)

  // Convert Gemini's async generator to a ReadableStream
  const encoder = new TextEncoder()
  
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            controller.enqueue(encoder.encode(text))
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

/**
 * Build the complete prompt from user input
 */
function buildPrompt(input: PropertyInput): string {
  const systemPrompt = `You are an expert real estate copywriter specializing in social media marketing. You create high-converting ad copy that drives engagement and inquiries.

Your writing style should be:
- Attention-grabbing from the first line
- Use emojis strategically (not too many)
- Include a clear call-to-action
- Highlight the most valuable features
- Create urgency or desire
- Be authentic and avoid clickbait`

  const platformInstructions = getPlatformInstructions(input.target_platform)
  const toneInstructions = getToneInstructions(input.tone)

  const userPrompt = `${systemPrompt}

PLATFORM: ${input.target_platform.toUpperCase()}
 ${platformInstructions}

TONE: ${input.tone.toUpperCase()}
 ${toneInstructions}

PROPERTY DETAILS:
- Type: ${input.property_type}
- Location: ${input.location}
- Bedrooms: ${input.bedrooms}
- Bathrooms: ${input.bathrooms}
- Price: $${Number(input.price).toLocaleString()} ${input.price_period === 'sale' ? '(For Sale)' : `(per ${input.price_period})`}
- Key Features: ${input.key_features.join(', ')}
 ${input.additional_notes ? `- Additional Notes: ${input.additional_notes}` : ''}

Generate compelling ad copy for this property. The output should be ready to copy and paste directly into the platform.`

  return userPrompt
}

/**
 * Get platform-specific instructions
 */
function getPlatformInstructions(platform: string): string {
  const instructions: Record<string, string> = {
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

  return instructions[platform] || instructions.instagram
}

/**
 * Get tone-specific instructions
 */
function getToneInstructions(tone: string): string {
  const instructions: Record<string, string> = {
    luxurious: `Use words like: exclusive, premium, elite, sophisticated, unparalleled, bespoke, refined, prestigious. Make the reader feel this is a rare opportunity.`,

    professional: `Use clear, factual language. Focus on specifications, location benefits, and investment value. Avoid overly emotional language.`,

    friendly: `Use warm, conversational language. Speak like a helpful friend. Use phrases like "Imagine this..." and "Picture yourself..."`,

    urgent: `Create FOMO (Fear Of Missing Out). Use phrases like "Won't last long", "Just listed", "Rare find", "Act fast". Emphasize scarcity.`,

    emotional: `Tell a story. Paint a picture of the lifestyle this property offers. Focus on feelings, memories, and dreams. Make them fall in love before they see the price.`,
  }

  return instructions[tone] || instructions.professional
}