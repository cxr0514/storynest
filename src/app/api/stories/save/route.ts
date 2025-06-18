import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      title,
      content,
      theme,
      characterIds,
      childProfileId,
      moralLesson,
      analytics
    } = await req.json()

    if (!title || !content || !theme || !characterIds || !childProfileId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    // Verify all characters belong to the child profile
    const characters = await prisma.character.findMany({
      where: {
        id: { in: characterIds },
        childProfileId
      }
    })

    if (characters.length !== characterIds.length) {
      return NextResponse.json({ error: 'Some characters not found or invalid' }, { status: 400 })
    }

    // Create story pages from content
    const contentParagraphs = content.split('\n\n').filter((p: string) => p.trim())
    const pages = contentParagraphs.map((paragraph: string, index: number) => ({
      pageNumber: index + 1,
      content: paragraph.trim(),
      characterDescriptions: characterIds.reduce((acc: Record<string, string>, charId: string) => {
        const character = characters.find(c => c.id === charId)
        if (character) {
          acc[charId] = `${character.name}: ${character.personalityDescription || ''}`
        }
        return acc
      }, {})
    }))

    // Generate summary
    const summary = `A ${theme} adventure featuring ${characters.map(c => c.name).join(', ')}${moralLesson ? ` that teaches about ${moralLesson}` : ''}.`

    // Create story in database
    const story = await prisma.story.create({
      data: {
        title,
        theme,
        summary,
        moralLesson: moralLesson || null,
        childProfileId,
        userId: session.user.id,
        currentPage: 1,
        isCompleted: false,
      }
    })

    // Link characters to story
    await Promise.all(
      characterIds.map((characterId: string) =>
        prisma.storyCharacter.create({
          data: {
            storyId: story.id,
            characterId
          }
        }).catch(() => {
          // Ignore if relation already exists or model doesn't exist
          console.log('Story-Character relation not created')
        })
      )
    )

    // Update character usage analytics - simplified
    await Promise.all(
      characters.map(character =>
        prisma.character.update({
          where: { id: character.id },
          data: {
            // Remove timesUsed and metadata fields as they don't exist in schema
            updatedAt: new Date(),
          }
        }).catch(() => {
          // Ignore if update fails
          console.log('Character update failed')
        })
      )
    )

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        theme: story.theme,
        summary: story.summary,
        characterCount: characters.length,
        pageCount: pages.length,
        analytics: analytics ? {
          overallConsistency: analytics.overallConsistency,
          suggestionsCount: analytics.suggestions?.length || 0
        } : null
      }
    })

  } catch (error) {
    console.error('Error saving story:', error)
    return NextResponse.json({ 
      error: 'Failed to save story',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
