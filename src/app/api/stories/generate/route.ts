import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Character, STORY_CATEGORY_MAP, STORY_WRITING_STYLE_MAP, type StoryCategoryLabel, type StoryWritingStyleLabel } from '@/types'
import { generateStoryWithOpenAI, generateIllustrationPrompt, generateIllustration } from '@/lib/openai'
import { smartImageUpload } from '@/lib/storage-smart'
import { randomUUID } from 'crypto'

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

// Type for story with includes
type StoryWithRelations = {
  id: string
  title: string
  theme: string
  summary: string
  language?: string
  category?: string
  writingStyle?: string
  readerAge?: string
  StoryPage: Array<{
    id: string
    pageNumber: number
    content: string
    characterDescriptions: Record<string, unknown>
  }>
  StoryCharacter: Array<{
    Character: {
      id: string
      name: string
      species: string
      age: string
      physicalFeatures: string
      clothingAccessories: string
      personalityTraits: string[]
      personalityDescription: string
      specialAbilities: string
      favoriteThings: string
      speakingStyle: string
      favoritePhrases: string[]
      userId: string
      childProfileId: string
      createdAt: Date
      updatedAt: Date
      imageUrl?: string | null
      appearances: unknown[]
    }
  }>
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      theme, 
      characterIds, 
      childProfileId, 
      storyDetails, 
      moralLesson, 
      pageCount = 5,
      language = 'English',
      storyType = 'Bedtime Story: A classic.',
      writingStyle = 'Imaginative: Creative, whimsical, fantastical elements.',
      readerAge = '5 – 7 years'
    } = body

    // Validate input
    if (!theme || !characterIds || !Array.isArray(characterIds) || characterIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: theme and characterIds' }, { status: 400 })
    }

    if (!childProfileId) {
      return NextResponse.json({ error: 'Missing required field: childProfileId' }, { status: 400 })
    }

    // Convert UI labels to enum values
    const categoryValue = STORY_CATEGORY_MAP[storyType as StoryCategoryLabel] || 'BedtimeStory'
    const writingStyleValue = STORY_WRITING_STYLE_MAP[writingStyle as StoryWritingStyleLabel] || 'Imaginative'

    // Get characters from database
    const prismaCharacters = await prisma.character.findMany({
      where: {
        id: { in: characterIds },
        userId: session.user.id
      }
    })

    if (prismaCharacters.length === 0) {
      return NextResponse.json({ error: 'No characters found' }, { status: 400 })
    }

    // Verify child profile belongs to user
    const childProfile = await prisma.childProfile.findFirst({
      where: {
        id: childProfileId,
        userId: session.user.id
      }
    })

    if (!childProfile) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    // Convert Prisma characters to Character type
    const characters: Character[] = prismaCharacters.map((char: typeof prismaCharacters[0]) => ({
      ...char,
      appearances: (char.appearances as unknown as Record<string, unknown>[]) || []
    }))

    console.log('Generating story with OpenAI...')

    // Generate story with OpenAI (with timeout protection)
    const storyData = await Promise.race([
      generateStoryWithOpenAI({
        theme,
        characterIds,
        childProfileId,
        customPrompt: storyDetails,
        moralLesson,
        targetLength: 'medium',
        pageCount
      }, characters),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Story generation timeout')), 60000) // 60 second timeout
      )
    ]) as Awaited<ReturnType<typeof generateStoryWithOpenAI>>

    console.log('Story generated, saving to database...')

    // Generate unique ID for the story
    const storyId = randomUUID()

    // Create story in database
    const story = await prisma.story.create({
      data: {
        id: storyId,
        title: storyData.title,
        theme,
        summary: storyData.summary,
        moralLesson,
        language: language as string,
        category: categoryValue as string,
        writingStyle: writingStyleValue as string,
        readerAge,
        userId: session.user.id,
        childProfileId,
        updatedAt: new Date(),
        StoryPage: {
          create: storyData.pages.map(page => ({
            id: randomUUID(),
            pageNumber: page.pageNumber,
            content: page.content,
            characterDescriptions: page.characterDescriptions,
            updatedAt: new Date()
          }))
        },
        StoryCharacter: {
          create: characterIds.map((characterId: string) => ({
            id: randomUUID(),
            characterId
          }))
        }
      },
      include: {
        StoryPage: true,
        StoryCharacter: {
          include: {
            Character: true
          }
        }
      }
    }) as StoryWithRelations

    console.log('Story saved to database with ID:', story.id)

    // Generate illustrations for each page (in background - don't await)
    setTimeout(() => {
      generateIllustrationsForStory(story.id, storyData.pages, characters, theme)
        .catch(error => console.error('Background illustration generation failed:', error))
    }, 100)

    console.log('Returning story response...')

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        theme: story.theme,
        summary: story.summary,
        language: story.language,
        category: story.category,
        writingStyle: story.writingStyle,
        readerAge: story.readerAge,
        pages: story.StoryPage,
        characters: story.StoryCharacter.map((sc) => ({
          ...sc.Character,
          appearances: (sc.Character.appearances as Record<string, unknown>[]) || []
        }))
      }
    })

  } catch (error) {
    console.error('Error generating story:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Story generation timed out. Please try again.' },
          { status: 408 }
        )
      }
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error. Please try again later.' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate story. Please try again.' },
      { status: 500 }
    )
  }
}

async function generateIllustrationsForStory(
  storyId: string,
  pages: Array<{ pageNumber: number; content: string; characterDescriptions: Record<string, string> }>,
  characters: Character[],
  theme: string
) {
  let successCount = 0
  let failureCount = 0
  
  for (const page of pages) {
    try {
      const storyPage = await prisma.storyPage.findFirst({
        where: {
          storyId,
          pageNumber: page.pageNumber
        }
      })

      if (!storyPage) {
        console.warn(`Story page not found for page ${page.pageNumber}`)
        continue
      }

      console.log(`Generating illustration for page ${page.pageNumber}`)
      
      // Generate illustration prompt
      const prompt = await generateIllustrationPrompt(page.content, characters, theme)
      
      // Generate illustration
      const imageUrl = await generateIllustration(prompt)
      
      let finalUrl = imageUrl // Default to the original generated URL
      
      try {
        // Try to upload to S3
        console.log(`Uploading illustration for page ${page.pageNumber} to S3...`)
        const uploadResult = await smartImageUpload(imageUrl, `stories/${storyId}`)
        finalUrl = uploadResult.url
        console.log(`Successfully uploaded illustration for page ${page.pageNumber} using ${uploadResult.storage} storage`)
      } catch (uploadError) {
        console.error(`Failed to upload illustration for page ${page.pageNumber} to S3:`, uploadError)
        console.log(`Using fallback URL for page ${page.pageNumber}: ${imageUrl}`)
        // Continue with the original image URL as fallback
      }
      
      // Save to database (with either S3 URL or fallback URL)
      await prisma.illustration.create({
        data: {
          id: randomUUID(),
          url: finalUrl,
          prompt,
          storyId,
          storyPageId: storyPage.id,
          updatedAt: new Date()
        }
      })
      
      successCount++
      console.log(`Successfully processed illustration for page ${page.pageNumber}`)
      
    } catch (error) {
      failureCount++
      console.error(`Failed to process illustration for page ${page.pageNumber}:`, error)
      // Continue to next page instead of failing completely
    }
  }
  
  console.log(`Illustration generation complete: ${successCount} successful, ${failureCount} failed`)
  
  if (failureCount > 0 && successCount === 0) {
    throw new Error('Failed to generate any illustrations')
  }
}
