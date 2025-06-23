import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: storyId } = await context.params
    const story = await prisma.story.findFirst({
      where: {
        id: storyId,
        userId: session.user.id
      },
      include: {
        StoryPage: {
          orderBy: {
            pageNumber: 'asc'
          },
          include: {
            Illustration: true
          }
        },
        ChildProfile: true,
        StoryCharacter: {
          include: {
            Character: true
          }
        },
        Illustration: true
      }
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Transform to match frontend interface
    const transformedStory = {
      id: story.id,
      title: story.title,
      theme: story.theme,
      summary: story.summary,
      moralLesson: story.moralLesson,
      currentPage: story.currentPage,
      isCompleted: story.isCompleted,
      readingProgress: story.progressPercent, // Map progressPercent to readingProgress
      childProfileId: story.childProfileId,
      childProfile: story.ChildProfile,
      ageGroup: '3-8', // Default for now
      pages: story.StoryPage.map(page => ({
        id: page.id,
        pageNumber: page.pageNumber,
        content: page.content,
        characterDescriptions: page.characterDescriptions as Record<string, string>,
        illustration: page.Illustration ? {
          id: page.Illustration.id,
          url: page.Illustration.url,
          prompt: page.Illustration.prompt,
          createdAt: page.Illustration.createdAt
        } : null
      })),
      characters: story.StoryCharacter.map(sc => sc.Character),
      characterIds: story.StoryCharacter.map(sc => sc.characterId),
      createdAt: story.createdAt,
      updatedAt: story.updatedAt
    }

    return NextResponse.json({ story: transformedStory })
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPage, isCompleted, readingProgress } = await req.json()
    const { id: storyId } = await context.params

    const updatedStory = await prisma.story.update({
      where: {
        id: storyId,
        userId: session.user.id
      },
      data: {
        currentPage,
        isCompleted,
        progressPercent: readingProgress, // Map readingProgress to progressPercent
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ story: updatedStory })
  } catch (error) {
    console.error('Error updating story:', error)
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
  }
}
