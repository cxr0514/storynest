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
  const logMessage = `[${timestamp}] [AI-STORY] [${level.toUpperCase()}] ${message}`
  
  if (level === 'error') {
    console.error(logMessage, data || '')
  } else if (level === 'warn') {
    console.warn(logMessage, data || '')
  } else {
    console.log(logMessage, data || '')
  }
}

// Extend the session type to include the user id
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    log('info', 'AI story generation request received')
    
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      log('error', 'Unauthorized request - no valid session')
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required. Please sign in to generate stories.',
        errorCode: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    log('info', `Authenticated user: ${session.user.email}`)

    const body = await req.json()
    const {
      childId,
      theme,
      characterIds,
      language = 'English',
      storyType = 'BedtimeStory',
      writingStyle = 'Imaginative',
      readerAge = '5 – 7 years',
      pageCount = 5,
      ideaChat = [],
    } = body as {
      childId: string
      theme: string
      characterIds: string[]
      language: string
      storyType: string
      writingStyle: string
      readerAge: string
      pageCount?: number
      ideaChat: { role: 'user' | 'assistant'; content: string }[]
    }

    // Enhanced validation
    if (!childId || typeof childId !== 'string') {
      log('error', 'Invalid childId provided')
      return NextResponse.json({
        success: false,
        error: 'Valid child profile ID is required.',
        errorCode: 'INVALID_CHILD_ID'
      }, { status: 400 })
    }

    if (!theme || typeof theme !== 'string' || theme.trim().length === 0) {
      log('error', 'Invalid theme provided')
      return NextResponse.json({
        success: false,
        error: 'Story theme is required and cannot be empty.',
        errorCode: 'INVALID_THEME'
      }, { status: 400 })
    }

    if (!characterIds || !Array.isArray(characterIds) || characterIds.length === 0) {
      log('error', 'Invalid characterIds provided')
      return NextResponse.json({
        success: false,
        error: 'At least one character must be selected.',
        errorCode: 'INVALID_CHARACTERS'
      }, { status: 400 })
    }

    // Validate page count
    if (pageCount && (pageCount < 3 || pageCount > 10)) {
      log('error', `Invalid page count: ${pageCount}`)
      return NextResponse.json({
        success: false,
        error: 'Page count must be between 3 and 10.',
        errorCode: 'INVALID_PAGE_COUNT'
      }, { status: 400 })
    }

    log('info', `Story request validated: theme="${theme}", characters=${characterIds.length}, pages=${pageCount}`)

    // Verify child profile belongs to user
    const childProfile = await prisma.childProfile.findFirst({
      where: {
        id: childId,
        userId: session.user.id
      }
    })

    if (!childProfile) {
      log('error', `Child profile not found: ${childId}`)
      return NextResponse.json({ 
        success: false,
        error: 'Child profile not found or access denied.',
        errorCode: 'CHILD_PROFILE_NOT_FOUND'
      }, { status: 404 })
    }

    log('info', `Child profile verified: ${childProfile.name}`)

    // Fetch selected characters for prompt-engineering
    const characters = await prisma.character.findMany({
      where: { 
        id: { in: characterIds },
        userId: session.user.id // Ensure user owns the characters
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
    })

    if (characters.length === 0) {
      log('error', 'No valid characters found for user')
      return NextResponse.json({ 
        success: false,
        error: 'No valid characters found. Please ensure you own the selected characters.',
        errorCode: 'NO_VALID_CHARACTERS'
      }, { status: 400 })
    }

    if (characters.length !== characterIds.length) {
      log('warn', `Some characters not found: requested ${characterIds.length}, found ${characters.length}`)
    }

    log('info', `Characters loaded: ${characters.map(c => c.name).join(', ')}`)

    log('info', `Characters loaded: ${characters.map(c => c.name).join(', ')}`)

    // Build enhanced story prompt
    const prompt = buildStoryPrompt({
      language,
      storyType,
      writingStyle,
      readerAge,
      characters,
      theme,
      pageCount,
      idea: ideaChat.find((m) => m.role === 'user')?.content || '',
    })

    log('info', 'Calling OpenAI for story generation')

    // Generate story with enhanced error handling
    let storyCompletion
    try {
      storyCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional children\'s story generator that outputs strict JSON with the exact structure requested. Ensure all character descriptions are consistent and detailed.' 
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 2000,
      })
    } catch (openaiError) {
      log('error', 'OpenAI story generation failed', openaiError)
      return NextResponse.json({
        success: false,
        error: 'AI story generation service temporarily unavailable. Please try again.',
        errorCode: 'AI_SERVICE_ERROR'
      }, { status: 503 })
    }

    const rawContent = storyCompletion.choices[0]?.message?.content
    if (!rawContent) {
      log('error', 'No content returned from OpenAI')
      return NextResponse.json({
        success: false,
        error: 'AI service returned empty response. Please try again.',
        errorCode: 'EMPTY_AI_RESPONSE'
      }, { status: 500 })
    }

    // Parse story JSON with error handling
    let storyJSON
    try {
      storyJSON = JSON.parse(rawContent) as {
        title: string
        summary: string
        moral?: string
        pages: { number: number; text: string; illustrationPrompt: string }[]
      }
    } catch (parseError) {
      log('error', 'Failed to parse story JSON', { rawContent, parseError })
      return NextResponse.json({
        success: false,
        error: 'AI generated invalid story format. Please try again.',
        errorCode: 'INVALID_STORY_FORMAT'
      }, { status: 500 })
    }

    // Validate story structure
    if (!storyJSON.title || !storyJSON.pages || !Array.isArray(storyJSON.pages) || storyJSON.pages.length === 0) {
      log('error', 'Invalid story structure', storyJSON)
      return NextResponse.json({
        success: false,
        error: 'AI generated incomplete story. Please try again.',
        errorCode: 'INCOMPLETE_STORY'
      }, { status: 500 })
    }

    log('info', `Story generated: "${storyJSON.title}" with ${storyJSON.pages.length} pages`)

    // Generate illustrations with Wasabi S3 integration
    const pageData = [] as { 
      pageNumber: number
      content: string 
      characterDescriptions: Record<string, string>
      imageUrl?: string 
    }[]
    
    let imageSuccessCount = 0
    let imageFailureCount = 0
    
    for (const page of storyJSON.pages) {
      try {
        log('info', `Generating illustration for page ${page.number}`)
        
        // Generate image with DALL-E
        const image = await openai.images.generate({
          model: 'dall-e-3',
          prompt: enhanceIllustrationPrompt(page.illustrationPrompt, characters),
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        })
        
        const dalleImageUrl = image.data?.[0]?.url
        if (!dalleImageUrl) {
          throw new Error('No image URL returned from DALL-E')
        }

        log('info', `DALL-E image generated for page ${page.number}`)

        // Upload to Wasabi S3 using smart upload
        let finalImageUrl = dalleImageUrl
        try {
          const uploadResult = await smartImageUpload(dalleImageUrl, 'story-illustrations')
          finalImageUrl = uploadResult.url
          log('info', `Image uploaded to ${uploadResult.storage} for page ${page.number}`)
        } catch (uploadError) {
          log('warn', `Image upload failed for page ${page.number}, using original URL`, uploadError)
          // Continue with original DALL-E URL as fallback
        }
        
        // Build character descriptions for this page
        const characterDescriptions: Record<string, string> = {}
        characters.forEach(char => {
          characterDescriptions[char.id] = `${char.name} appears ${char.physicalFeatures}. ${char.clothingAccessories || ''}`
        })
        
        pageData.push({ 
          pageNumber: page.number,
          content: page.text, 
          characterDescriptions,
          imageUrl: finalImageUrl 
        })
        
        imageSuccessCount++
        
      } catch (imageError) {
        log('error', `Image generation failed for page ${page.number}`, imageError)
        imageFailureCount++
        
        // Create page without image - story generation should continue
        const characterDescriptions: Record<string, string> = {}
        characters.forEach(char => {
          characterDescriptions[char.id] = `${char.name} appears ${char.physicalFeatures}. ${char.clothingAccessories || ''}`
        })
        
        pageData.push({ 
          pageNumber: page.number,
          content: page.text, 
          characterDescriptions
        })
      }
    }

    log('info', `Image generation complete: ${imageSuccessCount} success, ${imageFailureCount} failures`)

    // Persist story to database
    const storyId = randomUUID()
    log('info', `Creating story in database: ${storyId}`)
    
    try {
      // First create the story
      await prisma.story.create({
        data: {
          id: storyId,
          title: storyJSON.title,
          theme,
          summary: storyJSON.summary,
          moralLesson: storyJSON.moral || null,
          userId: session.user.id,
          childProfileId: childId,
        }
      })

      // Create story pages
      const createdPages = await Promise.all(
        pageData.map(async (page) => {
          return await prisma.storyPage.create({
            data: {
              id: randomUUID(),
              pageNumber: page.pageNumber,
              content: page.content,
              characterDescriptions: page.characterDescriptions,
              storyId: storyId,
            }
          })
        })
      )

      // Create story character relations
      await Promise.all(
        characterIds.map(async (characterId: string) => {
          return await prisma.storyCharacter.create({
            data: {
              id: randomUUID(),
              characterId,
              storyId: storyId,
            }
          })
        })
      )

      // Create illustrations for pages that have images
      await Promise.all(
        pageData
          .filter(page => page.imageUrl)
          .map(async (page) => {
            const storyPage = createdPages.find(p => p.pageNumber === page.pageNumber)
            if (storyPage && page.imageUrl) {
              return await prisma.illustration.create({
                data: {
                  id: randomUUID(),
                  url: page.imageUrl,
                  prompt: storyJSON.pages.find(p => p.number === page.pageNumber)?.illustrationPrompt || 'Generated illustration',
                  storyId: storyId,
                  storyPageId: storyPage.id,
                }
              })
            }
          })
      )

      // Fetch the complete story with relations
      const completeStory = await prisma.story.findUnique({
        where: { id: storyId },
        include: {
          StoryPage: {
            orderBy: { pageNumber: 'asc' },
            include: {
              Illustration: true
            }
          },
          StoryCharacter: {
            include: {
              Character: true
            }
          }
        }
      })

      if (!completeStory) {
        throw new Error('Failed to retrieve created story')
      }

      log('info', `Story created successfully: ${completeStory.title}`)

      const duration = Date.now() - startTime
      log('info', `Total story generation time: ${duration}ms`)

      return NextResponse.json({ 
        success: true,
        story: {
          id: completeStory.id,
          title: completeStory.title,
          summary: completeStory.summary,
          theme: completeStory.theme,
          moralLesson: completeStory.moralLesson,
          language,
          category: storyType,
          writingStyle,
          readerAge,
          pages: completeStory.StoryPage.map(page => ({
            id: page.id,
            pageNumber: page.pageNumber,
            content: page.content,
            characterDescriptions: page.characterDescriptions,
            imageUrl: page.Illustration?.url
          })),
          characters: completeStory.StoryCharacter.map(sc => sc.Character)
        },
        metadata: {
          generationTime: duration,
          imagesGenerated: imageSuccessCount,
          imagesFailed: imageFailureCount,
          totalPages: pageData.length,
          timestamp: new Date().toISOString()
        }
      })

    } catch (dbError) {
      log('error', 'Database error while creating story', dbError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save story. Please try again.',
        errorCode: 'DATABASE_ERROR'
      }, { status: 500 })
    }
    
  } catch (error) {
    const duration = Date.now() - startTime
    log('error', `Story generation failed after ${duration}ms`, error)
    
    return NextResponse.json({
      success: false,
      error: 'Story generation encountered an unexpected error.',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

/* ---------------------------------------------------------- */
function buildStoryPrompt(opts: {
  language: string
  storyType: string
  writingStyle: string
  readerAge: string
  pageCount: number
  characters: { 
    name: string
    personalityDescription: string
    physicalFeatures: string
    clothingAccessories?: string | null
    personalityTraits: string[]
    speakingStyle?: string | null
  }[]
  theme: string
  idea: string
}) {
  const charDesc = opts.characters
    .map((c) => {
      const traits = c.personalityTraits.join(', ')
      const clothing = c.clothingAccessories ? ` Clothing: ${c.clothingAccessories}.` : ''
      const speaking = c.speakingStyle ? ` Speaking style: ${c.speakingStyle}.` : ''
      return `${c.name}: ${c.personalityDescription} (Traits: ${traits}). Appearance: ${c.physicalFeatures}.${clothing}${speaking}`
    })
    .join('\n')

  const ideaText = opts.idea ? `Use this idea as inspiration: "${opts.idea}".` : ''

  return `Generate a ${opts.storyType.toLowerCase()} in ${opts.language} for readers aged ${opts.readerAge}.
Writing style: ${opts.writingStyle}.
Theme: ${opts.theme}.
${ideaText}

Characters (keep them visually and descriptively consistent across all pages):
${charDesc}

Requirements:
- Create exactly ${opts.pageCount} pages appropriate for the age group
- Each page should be 2-3 sentences suitable for children
- Include all characters meaningfully in the story
- Maintain character consistency in descriptions and behavior
- Create detailed illustration prompts that include character appearances
- Ensure story has a clear beginning, middle, and satisfying conclusion

Output strict JSON with exactly these keys:
{
  "title": "Story title",
  "summary": "Brief 1-2 sentence summary",
  "moral": "Optional moral lesson",
  "pages": [
    {
      "number": 1,
      "text": "Page content text (2-3 sentences)",
      "illustrationPrompt": "Detailed DALL-E prompt including character descriptions and scene"
    }
  ]
}`
}

function enhanceIllustrationPrompt(
  basePrompt: string, 
  characters: Array<{
    name: string
    physicalFeatures: string
    clothingAccessories?: string | null
  }>
): string {
  const characterDetails = characters.map(char => 
    `${char.name}: ${char.physicalFeatures}${char.clothingAccessories ? `, wearing ${char.clothingAccessories}` : ''}`
  ).join('. ')

  return `${basePrompt}. Character consistency details: ${characterDetails}. Style: Pixar-like 3D animation, warm lighting, child-friendly, vibrant colors, storybook illustration style.`
}
