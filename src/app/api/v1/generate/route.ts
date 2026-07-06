import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  // 1. Validate API Key Format (Must start with "sk-")
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('sk-')) {
    return NextResponse.json({ 
      error: 'Unauthorized: Invalid API key format. Must start with "sk-"' 
    }, { status: 401 })
  }

  const apiKey = authHeader.replace('Bearer ', '')

  // 2. Verify API Key in Database
  const supabase = createServerSupabaseClient()
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('id, user_id, expires_at')
    .eq('key_hash', createHash('sha256').update(apiKey).digest('hex'))
    .single()

  if (keyError || !keyData) {
    return NextResponse.json({ error: 'Invalid API key or key not found.' }, { status: 401 })
  }

  // 3. Check if API key has expired
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return NextResponse.json({ error: 'API key has expired.' }, { status: 401 })
  }

  // 4. Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id)

  // 5. Parse the developer's prompt
  let body: { prompt?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!body.prompt) {
    return NextResponse.json({ error: 'Missing "prompt" in request body.' }, { status: 400 })
  }

  // 6. Call Google AI
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const result = await model.generateContent(body.prompt)
    const response = await result.response
    const fullText = response.text()

    return new NextResponse(fullText, {
      headers: {
        'Content-Type': 'text/plain',
        'X-API-Key-Usage': '1',
      },
    })
  } catch (error) {
    console.error('API Generation Error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate text. Check your prompt formatting.' 
    }, { status: 500 })
  }
}