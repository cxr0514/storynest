import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { smartImageUpload } from '@/lib/storage-smart'
import { v4 as uuidv4 } from 'uuid'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🎨 Starting AI child profile creation...')
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await req.json()
    const { name, age, visualDescription, interests } = body as {
      name: string
      age: string | number
      visualDescription: string
      interests: string | string[]
    }

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!age) {
      return NextResponse.json({ error: 'Age is required' }, { status: 400 })
    }

    if (!visualDescription?.trim()) {
      return NextResponse.json({ error: 'Visual description is required for AI avatar generation' }, { status: 400 })
    }

    // Validate age
    const ageNumber = typeof age === 'string' ? parseInt(age, 10) : age
    if (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 18) {
      return NextResponse.json({ error: 'Age must be a number between 0 and 18' }, { status: 400 })
    }

    console.log(`👤 Creating profile for: ${name}, Age: ${ageNumber}`)
    console.log(`🎨 Visual description: ${visualDescription}`)

    // 1️⃣ Generate avatar with DALL-E
    console.log('🤖 Generating avatar with DALL-E...')
    const dallePrompt = `Create a cute, child-friendly avatar portrait in Pixar animation style. ${visualDescription}. The character should look friendly and approachable, with soft lighting, centered composition, and highly detailed features suitable for a children's storybook application.`
    
    const imageGenStart = Date.now()
    const image = await openai.images.generate({ 
      model: 'dall-e-3', 
      prompt: dallePrompt, 
      n: 1, 
      size: '1024x1024',
      quality: 'standard' // Use standard quality for faster generation
    })
    const imageGenTime = Date.now() - imageGenStart
    console.log(`✅ Avatar generated in ${imageGenTime}ms`)

    if (!image.data || !image.data[0]?.url) {
      throw new Error('Failed to generate avatar image')
    }

    // 2️⃣ Upload to S3/Wasabi with smart fallback
    console.log('☁️ Uploading avatar to storage...')
    const uploadStart = Date.now()
    const uploadResult = await smartImageUpload(image.data[0].url, 'avatars')
    const uploadTime = Date.now() - uploadStart
    console.log(`✅ Avatar uploaded to ${uploadResult.storage} in ${uploadTime}ms: ${uploadResult.url}`)

    // 3️⃣ Process interests
    let processedInterests: string[] = []
    if (interests) {
      if (typeof interests === 'string') {
        processedInterests = interests.split(',').map((s) => s.trim()).filter(Boolean)
      } else if (Array.isArray(interests)) {
        processedInterests = interests.filter(Boolean)
      }
    }

    // 4️⃣ Create child profile in database
    console.log('💾 Saving profile to database...')
    const dbStart = Date.now()
    const newProfile = await prisma.childProfile.create({
      data: {
        id: uuidv4(),
        name: name.trim(),
        age: ageNumber,
        interests: processedInterests,
        avatarUrl: uploadResult.url,
        userId: session.user.id
      },
    })
    const dbTime = Date.now() - dbStart
    console.log(`✅ Profile saved to database in ${dbTime}ms`)

    const totalTime = Date.now() - startTime
    console.log(`🎉 AI child profile creation completed in ${totalTime}ms`)

    return NextResponse.json({ 
      success: true,
      id: newProfile.id, // Return the ID for easy access
      profile: {
        id: newProfile.id,
        name: newProfile.name,
        age: newProfile.age,
        interests: newProfile.interests,
        avatarUrl: uploadResult.url // Use the upload result directly
      },
      metadata: {
        imageGenerationTime: imageGenTime,
        uploadTime: uploadTime,
        databaseTime: dbTime,
        totalTime: totalTime
      }
    })

  } catch (error) {
    const errorTime = Date.now() - startTime
    console.error(`❌ AI child profile creation failed after ${errorTime}ms:`, error)
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: 'AI service configuration error',
          details: 'OpenAI API key not configured properly'
        }, { status: 500 })
      }
      
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json({ 
          error: 'AI service temporarily unavailable',
          details: 'Please try again in a few minutes'
        }, { status: 429 })
      }
      
      if (error.message.includes('Wasabi') || error.message.includes('S3')) {
        return NextResponse.json({ 
          error: 'Image storage error',
          details: 'Failed to save avatar image'
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      error: 'AI profile creation failed',
      details: 'An unexpected error occurred while creating the profile'
    }, { status: 500 })
  }
}
