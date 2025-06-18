import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Character, CharacterAppearance } from '@/types'
import { generateStoryWithOpenAI, generateIllustrationPrompt, generateIllustration } from '@/lib/openai'
import { uploadImageToS3 } from '@/lib/storage-cloud'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { theme, characterIds, childProfileId, storyDetails, moralLesson } = body

    // Validate input
    if (!theme || !characterIds || !Array.isArray(characterIds) || characterIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: theme and characterIds' }, { status: 400 })
    }

    if (!childProfileId) {
      return NextResponse.json({ error: 'Missing required field: childProfileId' }, { status: 400 })
    }

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
      appearances: (char.appearances as unknown as CharacterAppearance[]) || []
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
        targetLength: 'medium'
      }, characters),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Story generation timeout')), 60000) // 60 second timeout
      )
    ]) as Awaited<ReturnType<typeof generateStoryWithOpenAI>>

    console.log('Story generated, saving to database...')

    // Create story in database
    const story = await prisma.story.create({
      data: {
        title: storyData.title,
        theme,
        summary: storyData.summary,
        moralLesson,
        userId: session.user.id,
        childProfileId,
        StoryPage: {
          create: storyData.pages.map(page => ({
            pageNumber: page.pageNumber,
            content: page.content,
            characterDescriptions: page.characterDescriptions
          }))
        },
        StoryCharacter: {
          create: characterIds.map((characterId: string) => ({
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
    })

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
        pages: story.StoryPage,
        characters: story.StoryCharacter.map((sc: typeof story.StoryCharacter[0]) => ({
          ...sc.Character,
          appearances: (sc.Character.appearances as unknown as CharacterAppearance[]) || []
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
  try {
    for (const page of pages) {
      const storyPage = await prisma.storyPage.findFirst({
        where: {
          storyId,
          pageNumber: page.pageNumber
        }
      })

      if (!storyPage) continue

      // Generate illustration prompt
      const prompt = await generateIllustrationPrompt(page.content, characters, theme)
      
      // Generate illustration
      const imageUrl = await generateIllustration(prompt)
      
      // Upload to S3
      const s3Url = await uploadImageToS3(imageUrl, `stories/${storyId}`)
      
      // Save to database
      await prisma.illustration.create({
        data: {
          url: s3Url,
          prompt,
          storyId,
          storyPageId: storyPage.id
        }
      })
    }
  } catch (error) {
    console.error('Error generating illustrations:', error)
  }
}
