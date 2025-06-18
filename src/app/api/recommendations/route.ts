import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RecommendationEngine, RecommendationContext, CharacterPreference } from '@/lib/recommendations'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const childProfileId = searchParams.get('childProfileId')
    const characterIds = searchParams.get('characterIds')?.split(',') || []
    const context = searchParams.get('context')
    const enhanced = searchParams.get('enhanced') === 'true'
    const quick = searchParams.get('quick') === 'true'

    if (!childProfileId) {
      return NextResponse.json({ error: 'Child profile ID required' }, { status: 400 })
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

    // Build recommendation context
    const recommendationContext = await buildRecommendationContext(childProfileId, session.user.id)
    
    // Add Beta Phase enhancements
    if (enhanced) {
      recommendationContext.characterIds = characterIds
      recommendationContext.currentStoryContext = context || undefined
      recommendationContext.enhanced = true
    }
    
    // Generate recommendations
    const recommendations = enhanced
      ? await RecommendationEngine.generateEnhancedRecommendations(recommendationContext)
      : quick 
        ? await RecommendationEngine.getQuickRecommendations(recommendationContext)
        : await RecommendationEngine.generateRecommendations(recommendationContext)

    return NextResponse.json({ recommendations })

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recommendationId, action, childProfileId, context } = await req.json()

    if (!recommendationId || !action || !childProfileId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Track the interaction
    await RecommendationEngine.trackRecommendationInteraction(
      recommendationId,
      action,
      context
    )

    // Store interaction in database for analytics
    try {
      // Check if userInteraction model exists
      if ('userInteraction' in prisma) {
        const extendedPrisma = prisma as typeof prisma & {
          userInteraction: {
            create: (args: { data: { userId: string; type: string; data: unknown } }) => Promise<unknown>
          }
        }
        await extendedPrisma.userInteraction.create({
          data: {
            userId: session.user.id,
            type: 'recommendation',
            data: {
              recommendationId,
              context,
              action,
              childProfileId
            }
          }
        })
      }
    } catch (error) {
      // UserInteraction model may not exist yet, ignore error
      console.log('UserInteraction not created:', error)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error tracking recommendation interaction:', error)
    return NextResponse.json({ error: 'Failed to track interaction' }, { status: 500 })
  }
}

async function buildRecommendationContext(childProfileId: string, userId: string): Promise<RecommendationContext> {
  // Get child profile
  const childProfile = await prisma.childProfile.findUnique({
    where: { 
      id: childProfileId,
      userId: userId // Ensure the child belongs to the user
    }
  })

  if (!childProfile) {
    throw new Error('Child profile not found')
  }

  // Get child's characters and their usage
  const characters = await prisma.character.findMany({
    where: { childProfileId },
    include: {
      StoryCharacter: {
        include: {
          Story: {
            select: {
              createdAt: true,
              theme: true
            }
          }
        }
      }
    }
  })

  // Get reading history
  const stories = await prisma.story.findMany({
    where: { childProfileId },
    select: {
      id: true,
      theme: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 20 // Last 20 stories for analysis
  })

  // Build character preferences
  const favoriteCharacters: CharacterPreference[] = characters.map(character => {
    const timesUsed = character.StoryCharacter.length
    const themes = character.StoryCharacter.map(s => s.Story.theme).filter(Boolean)
    const lastUsed = character.StoryCharacter.length > 0 
      ? new Date(Math.max(...character.StoryCharacter.map(s => new Date(s.Story.createdAt).getTime())))
      : new Date()

    return {
      characterId: character.id,
      characterName: character.name,
      timesUsed,
      favoriteThemes: Array.from(new Set(themes)),
      lastUsed,
      userRating: undefined // Could be added later
    }
  })

  // Analyze favorite themes from reading history
  const themeCount = stories.reduce((acc, story) => {
    if (story.theme) {
      acc[story.theme] = (acc[story.theme] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const favoriteThemes = Object.entries(themeCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([theme]) => theme)

  // Determine reading level based on age and story count
  const readingLevel = determineReadingLevel(childProfile.age, stories.length)

  return {
    childProfileId,
    childAge: childProfile.age,
    readingHistory: stories.map(s => s.id),
    favoriteCharacters: favoriteCharacters.sort((a, b) => b.timesUsed - a.timesUsed),
    favoriteThemes,
    readingLevel,
    lastSessionTime: stories.length > 0 ? stories[0].createdAt : undefined
  }
}

function determineReadingLevel(age: number, storyCount: number): 'beginner' | 'intermediate' | 'advanced' {
  if (age <= 4 || storyCount < 5) return 'beginner'
  if (age <= 8 || storyCount < 20) return 'intermediate'
  return 'advanced'
}
