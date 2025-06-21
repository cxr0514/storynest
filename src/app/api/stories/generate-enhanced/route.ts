import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { randomUUID } from 'crypto'
import { smartImageUpload } from '@/lib/storage-smart'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// Enhanced logging for debugging
function log(level: 'info' | 'error' | 'warn', message: string, data?: unknown) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [STORY-GEN-V2] [${level.toUpperCase()}] ${message}`
  
  if (level === 'error') {
    console.error(logMessage, data || '')
  } else if (level === 'warn') {
    console.warn(logMessage, data || '')
  } else {
    console.log(logMessage, data || '')
  }
}

// Type definitions
interface StoryRequest {
  childProfileId: string
  theme: string
  characterIds: string[]
  language?: string
  storyType?: string
  writingStyle?: string
  readerAge?: string
  pageCount?: number
  includeImages?: boolean
  ideaChat?: { role: 'user' | 'assistant'; content: string }[]
  customPrompt?: string
}

interface Character {
  id: string
  name: string
  personalityDescription: string
  physicalFeatures: string
  clothingAccessories?: string | null
  personalityTraits: string[]
  speakingStyle?: string | null
}

interface GeneratedStory {
  title: string
  summary: string
  moral?: string
  pages: { number: number; text: string; illustrationPrompt: string }[]
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let storyId: string | null = null
  
  try {
    log('info', 'Enhanced story generation request received')
    
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      log('error', 'Unauthorized request')
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required. Please sign in to generate stories.',
        errorCode: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    log('info', `Authenticated user: ${session.user.email}`)

    // Parse and validate request
    const body = await req.json() as StoryRequest
    const {
      childProfileId,
      theme,
      characterIds,
      language = 'English',
      storyType = 'BedtimeStory',
      writingStyle = 'Imaginative',
      readerAge = '5 – 7 years',
      pageCount = 5,
      includeImages = true,
      ideaChat = [],
      customPrompt = ''
    } = body

    // Enhanced validation
    const validation = validateStoryRequest(body)
    if (!validation.isValid) {
      log('error', 'Request validation failed', validation.errors)
      return NextResponse.json({
        success: false,
        error: validation.errors.join(', '),
        errorCode: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    log('info', `Request validated: theme="${theme}", characters=${characterIds.length}, pages=${pageCount}`)

    // Verify child profile access
    const childProfile = await prisma.childProfile.findFirst({
      where: {
        id: childProfileId,
        userId: session.user.id
      }
    })

    if (!childProfile) {
      log('error', `Child profile not found: ${childProfileId}`)
      return NextResponse.json({ 
        success: false,
        error: 'Child profile not found or access denied.',
        errorCode: 'CHILD_PROFILE_NOT_FOUND'
      }, { status: 404 })
    }

    log('info', `Child profile verified: ${childProfile.name}`)

    // Fetch and validate characters
    const characters = await prisma.character.findMany({
      where: { 
        id: { in: characterIds },
        userId: session.user.id
      },
      select: { 
        id: true,
        name: true, 
        personalityDescription: true, 
        physicalFeatures: true,
        clothingAccessories: true,
        personalityTraits: true,
        speakingStyle: true
      },
    }) as Character[]

    if (characters.length === 0) {
      log('error', 'No valid characters found')
      return NextResponse.json({ 
        success: false,
        error: 'No valid characters found. Please ensure you own the selected characters.',
        errorCode: 'NO_VALID_CHARACTERS'
      }, { status: 400 })
    }

    log('info', `Characters loaded: ${characters.map(c => c.name).join(', ')}`)

    // Generate story with AI
    const storyJSON = await generateStoryWithAI({
      language,
      storyType,
      writingStyle,
      readerAge,
      pageCount,
      characters,
      theme,
      ideaChat,
      customPrompt
    })

    log('info', `Story generated: "${storyJSON.title}" with ${storyJSON.pages.length} pages`)

    // Generate images if requested
    let imageResults: { successCount: number; failureCount: number; images: { pageNumber: number; url: string; prompt: string }[] } = { successCount: 0, failureCount: 0, images: [] }
    if (includeImages) {
      imageResults = await generateStoryImages(storyJSON, characters)
      log('info', `Image generation: ${imageResults.successCount} success, ${imageResults.failureCount} failures`)
    }

    // Save to database
    storyId = await saveStoryToDatabase({
      storyJSON,
      theme,
      language,
      storyType,
      writingStyle,
      readerAge,
      characters,
      characterIds,
      childProfileId,
      userId: session.user.id,
      imageResults
    })

    const duration = Date.now() - startTime
    log('info', `Story generation completed in ${duration}ms`)

    return NextResponse.json({ 
      success: true,
      story: {
        id: storyId,
        title: storyJSON.title,
        summary: storyJSON.summary,
        theme,
        moralLesson: storyJSON.moral,
        language,
        category: storyType,
        writingStyle,
        readerAge,
        pageCount: storyJSON.pages.length,
        hasImages: includeImages && imageResults.successCount > 0
      },
      metadata: {
        generationTime: duration,
        imagesGenerated: imageResults.successCount,
        imagesFailed: imageResults.failureCount,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    log('error', `Story generation failed after ${duration}ms`, error)
    
    // Clean up partial story if it was created
    if (storyId) {
      try {
        await prisma.story.delete({ where: { id: storyId } })
        log('info', 'Cleaned up partial story after error')
      } catch (cleanupError) {
        log('error', 'Failed to clean up partial story', cleanupError)
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Story generation encountered an unexpected error.',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// Helper functions
function validateStoryRequest(request: StoryRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!request.childProfileId || typeof request.childProfileId !== 'string') {
    errors.push('Valid child profile ID is required')
  }

  if (!request.theme || typeof request.theme !== 'string' || request.theme.trim().length === 0) {
    errors.push('Story theme is required and cannot be empty')
  }

  if (!request.characterIds || !Array.isArray(request.characterIds) || request.characterIds.length === 0) {
    errors.push('At least one character must be selected')
  }

  if (request.pageCount && (request.pageCount < 3 || request.pageCount > 10)) {
    errors.push('Page count must be between 3 and 10')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

async function generateStoryWithAI(opts: {
  language: string
  storyType: string
  writingStyle: string
  readerAge: string
  pageCount: number
  characters: Character[]
  theme: string
  ideaChat: { role: 'user' | 'assistant'; content: string }[]
  customPrompt: string
}): Promise<GeneratedStory> {
  const prompt = buildEnhancedStoryPrompt(opts)
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional children\'s story generator that creates engaging, age-appropriate stories with consistent characters and positive messages. Always output valid JSON with the exact structure requested.' 
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 2500,
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      throw new Error('No content returned from AI')
    }

    const storyJSON = JSON.parse(rawContent) as GeneratedStory
    
    // Validate story structure
    if (!storyJSON.title || !storyJSON.pages || !Array.isArray(storyJSON.pages) || storyJSON.pages.length === 0) {
      throw new Error('AI generated invalid story structure')
    }

    return storyJSON
  } catch (error) {
    log('error', 'AI story generation failed', error)
    throw new Error('Failed to generate story with AI')
  }
}

async function generateStoryImages(storyJSON: GeneratedStory, characters: Character[]): Promise<{ successCount: number; failureCount: number; images: { pageNumber: number; url: string; prompt: string }[] }> {
  const results: { successCount: number; failureCount: number; images: { pageNumber: number; url: string; prompt: string }[] } = { successCount: 0, failureCount: 0, images: [] }
  
  for (const page of storyJSON.pages) {
    try {
      log('info', `Generating image for page ${page.number}`)
      
      const enhancedPrompt = enhanceIllustrationPrompt(page.illustrationPrompt, characters)
      
      const image = await openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      })
      
      const dalleUrl = image.data?.[0]?.url
      if (!dalleUrl) {
        throw new Error('No image URL returned from DALL-E')
      }

      // Upload to storage
      let finalUrl = dalleUrl
      try {
        const uploadResult = await smartImageUpload(dalleUrl, 'story-illustrations')
        finalUrl = uploadResult.url
        log('info', `Image uploaded to ${uploadResult.storage} for page ${page.number}`)
      } catch (uploadError) {
        log('warn', `Image upload failed for page ${page.number}, using original URL`, uploadError)
      }

      results.images.push({
        pageNumber: page.number,
        url: finalUrl,
        prompt: enhancedPrompt
      })
      
      results.successCount++
      
    } catch (error) {
      log('error', `Image generation failed for page ${page.number}`, error)
      results.failureCount++
    }
  }
  
  return results
}

async function saveStoryToDatabase(opts: {
  storyJSON: GeneratedStory
  theme: string
  language: string
  storyType: string
  writingStyle: string
  readerAge: string
  characters: Character[]
  characterIds: string[]
  childProfileId: string
  userId: string
  imageResults: { successCount: number; failureCount: number; images: { pageNumber: number; url: string; prompt: string }[] }
}): Promise<string> {
  const storyId = randomUUID()
  
  try {
    // Create story
    await prisma.story.create({
      data: {
        id: storyId,
        title: opts.storyJSON.title,
        theme: opts.theme,
        summary: opts.storyJSON.summary,
        moralLesson: opts.storyJSON.moral || null,
        userId: opts.userId,
        childProfileId: opts.childProfileId,
        updatedAt: new Date(),
      }
    })

    // Create pages
    for (const page of opts.storyJSON.pages) {
      const pageId = randomUUID()
      
      const characterDescriptions: Record<string, string> = {}
      opts.characters.forEach(char => {
        characterDescriptions[char.id] = `${char.name} appears ${char.physicalFeatures}. ${char.clothingAccessories || ''}`
      })

      await prisma.storyPage.create({
        data: {
          id: pageId,
          pageNumber: page.number,
          content: page.text,
          characterDescriptions: characterDescriptions,
          storyId: storyId,
          updatedAt: new Date(),
        }
      })

      // Add illustration if available
      const pageImage = opts.imageResults.images.find((img: { pageNumber: number; url: string; prompt: string }) => img.pageNumber === page.number)
      if (pageImage) {
        await prisma.illustration.create({
          data: {
            id: randomUUID(),
            url: pageImage.url,
            prompt: pageImage.prompt,
            storyId: storyId,
            storyPageId: pageId,
            updatedAt: new Date(),
          }
        })
      }
    }

    // Create character relations
    for (const characterId of opts.characterIds) {
      await prisma.storyCharacter.create({
        data: {
          id: randomUUID(),
          characterId,
          storyId: storyId,
        }
      })
    }

    return storyId
  } catch (error) {
    log('error', 'Database save failed', error)
    throw new Error('Failed to save story to database')
  }
}

function buildEnhancedStoryPrompt(opts: {
  language: string
  storyType: string
  writingStyle: string
  readerAge: string
  pageCount: number
  characters: Character[]
  theme: string
  ideaChat: { role: 'user' | 'assistant'; content: string }[]
  customPrompt: string
}): string {
  const characterDescriptions = opts.characters
    .map((c) => {
      const traits = c.personalityTraits.join(', ')
      const clothing = c.clothingAccessories ? ` Clothing: ${c.clothingAccessories}.` : ''
      const speaking = c.speakingStyle ? ` Speaking style: ${c.speakingStyle}.` : ''
      return `${c.name}: ${c.personalityDescription} (Traits: ${traits}). Appearance: ${c.physicalFeatures}.${clothing}${speaking}`
    })
    .join('\n')

  const ideaContext = opts.ideaChat.length > 0 ? 
    `\nStory brainstorming context: ${opts.ideaChat.map(m => `${m.role}: ${m.content}`).join(' | ')}` : ''

  const customContext = opts.customPrompt ? `\nAdditional requirements: ${opts.customPrompt}` : ''

  return `Create an engaging ${opts.storyType.toLowerCase()} in ${opts.language} for children aged ${opts.readerAge}.

STORY SPECIFICATIONS:
- Writing style: ${opts.writingStyle}
- Theme: ${opts.theme}
- Length: Exactly ${opts.pageCount} pages
- Target age: ${opts.readerAge}${ideaContext}${customContext}

CHARACTERS (maintain consistency throughout):
${characterDescriptions}

REQUIREMENTS:
- Create exactly ${opts.pageCount} pages with age-appropriate content
- Each page should be 2-4 sentences suitable for the target age
- Include all characters meaningfully in the story
- Maintain character consistency in descriptions and behavior
- Create detailed illustration prompts that include character appearances
- Ensure story has clear beginning, development, and satisfying conclusion
- Include positive themes and age-appropriate lessons
- Make it engaging and fun for children

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "title": "Engaging story title",
  "summary": "Brief 1-2 sentence summary of the story",
  "moral": "Optional positive lesson or moral (if applicable)",
  "pages": [
    {
      "number": 1,
      "text": "Page content (2-4 sentences appropriate for age group)",
      "illustrationPrompt": "Detailed DALL-E prompt including character descriptions, setting, and action for this specific page"
    }
  ]
}`
}

function enhanceIllustrationPrompt(basePrompt: string, characters: Character[]): string {
  const characterDetails = characters.map(char => 
    `${char.name}: ${char.physicalFeatures}${char.clothingAccessories ? `, wearing ${char.clothingAccessories}` : ''}`
  ).join('. ')

  return `${basePrompt}. Character consistency: ${characterDetails}. Art style: Pixar-like 3D animation, warm lighting, child-friendly, vibrant colors, storybook illustration style, high quality, detailed.`
}
