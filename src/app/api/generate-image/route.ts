import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { cleanForClaude } from '../../../../lib/ai-prompt-utils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// GET method for testing API endpoint
export async function GET() {
  return NextResponse.json({
    status: 'Luna Dragon Image Generation API',
    version: '1.0.0',
    endpoints: {
      POST: 'Generate image with prompt in request body'
    },
    example: {
      method: 'POST',
      body: { prompt: 'A cute purple dragon with silver belly' }
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    // Add more robust request body parsing
    let body;
    try {
      body = await req.json()
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { prompt } = body

    if (!prompt || typeof prompt !== 'string') {
      console.error('❌ Invalid prompt:', { prompt, type: typeof prompt })
      return NextResponse.json(
        { error: 'Valid prompt string is required' },
        { status: 400 }
      )
    }

    console.log('🎨 Generating image with AI prompt utilities...')
    console.log('📝 Raw prompt structure:', prompt)

    // Clean the prompt for DALL-E (remove YAML metadata)
    const cleanPrompt = cleanForClaude(prompt)
    console.log('🧹 Cleaned prompt for DALL-E:', cleanPrompt)

    // Generate image with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: cleanPrompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E')
    }

    console.log('✅ Image generated successfully:', imageUrl)

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: cleanPrompt,
      metadata: {
        model: 'dall-e-3',
        size: '1024x1024',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error generating image:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
