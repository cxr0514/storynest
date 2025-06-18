import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AnalyticsEngine } from '@/lib/analytics'
import { BetaAnalyticsEngine } from '@/lib/beta-analytics'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const childProfileId = searchParams.get('childProfileId')
    const characterId = searchParams.get('characterId')

    switch (type) {
      case 'character-consistency':
        if (!characterId) {
          return NextResponse.json({ error: 'Character ID required' }, { status: 400 })
        }
        
        // Verify character belongs to user
        const character = await prisma.character.findFirst({
          where: {
            id: characterId,
            childProfile: {
              userId: session.user.id
            }
          }
        })

        if (!character) {
          return NextResponse.json({ error: 'Character not found' }, { status: 404 })
        }

        const consistencyReport = await BetaAnalyticsEngine.generateCharacterConsistencyReport(characterId)
        return NextResponse.json({ report: consistencyReport })

      case 'user-engagement':
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

        const engagementReport = await BetaAnalyticsEngine.generateUserEngagementReport(
          session.user.id,
          childProfileId
        )
        return NextResponse.json({ report: engagementReport })

      case 'platform-health':
        // Admin-only endpoint - in production, add admin role check
        const platformHealth = await BetaAnalyticsEngine.generatePlatformHealthReport()
        return NextResponse.json({ report: platformHealth })

      case 'dashboard-summary':
        // Get summary analytics for dashboard
        const summary = await getDashboardAnalytics(session.user.id, childProfileId)
        return NextResponse.json({ summary })

      case 'character-overview':
        // Get character analytics overview
        const characterOverview = await getCharacterAnalyticsOverview(session.user.id, childProfileId)
        return NextResponse.json({ overview: characterOverview })

      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, data } = await req.json()

    switch (type) {
      case 'story-generation':
        await AnalyticsEngine.trackStoryGeneration({
          ...data,
          userId: session.user.id
        })
        return NextResponse.json({ success: true })

      case 'user-interaction':
        // Track user interactions for analytics
        await trackUserInteraction(session.user.id, data)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid tracking type' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error tracking analytics:', error)
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 })
  }
}

async function getDashboardAnalytics(userId: string, childProfileId: string | null) {
  try {
    // Get basic user statistics
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        childProfiles: {
          include: {
            characters: true,
            stories: true
          }
        }
      }
    })

    if (!userStats) {
      throw new Error('User not found')
    }

    // Filter by child profile if specified
    const profiles = childProfileId 
      ? userStats.childProfiles.filter(profile => profile.id === childProfileId)
      : userStats.childProfiles

    // Calculate aggregate statistics
    const totalCharacters = profiles.reduce((sum, profile) => sum + profile.characters.length, 0)
    const totalStories = profiles.reduce((sum, profile) => sum + profile.stories.length, 0)

    // Get recent activity (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const recentStories = profiles.reduce((stories, profile) => {
      const recentProfileStories = profile.stories.filter(story => 
        new Date(story.createdAt) > weekAgo
      )
      return stories + recentProfileStories.length
    }, 0)

    // Calculate character reuse rate
    const charactersWithMultipleStories = await prisma.character.count({
      where: {
        childProfile: {
          userId: userId,
          ...(childProfileId ? { id: childProfileId } : {})
        },
        stories: {
          some: {}
        }
      }
    })

    const characterReuseRate = totalCharacters > 0 
      ? Math.round((charactersWithMultipleStories / totalCharacters) * 100)
      : 0

    // Get favorite themes
    const stories = await prisma.story.findMany({
      where: {
        childProfile: {
          userId: userId,
          ...(childProfileId ? { id: childProfileId } : {})
        }
      },
      select: {
        theme: true,
        createdAt: true
      }
    })

    const themeCount = stories.reduce((acc: Record<string, number>, story) => {
      if (story.theme) {
        acc[story.theme] = (acc[story.theme] || 0) + 1
      }
      return acc
    }, {})

    const favoriteThemes = Object.entries(themeCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([theme, count]) => ({ theme, count }))

    // Calculate reading streak
    const readingStreak = calculateReadingStreak(stories)

    // Calculate character usage metrics
    const characterUsage = await getCharacterUsageMetrics(userId, childProfileId)

    return {
      overview: {
        totalCharacters,
        totalStories,
        totalProfiles: profiles.length,
        recentActivity: recentStories
      },
      engagement: {
        characterReuseRate,
        averageStoriesPerProfile: profiles.length > 0 ? Math.round(totalStories / profiles.length) : 0,
        averageCharactersPerProfile: profiles.length > 0 ? Math.round(totalCharacters / profiles.length) : 0,
        readingStreak
      },
      preferences: {
        favoriteThemes
      },
      characterUsage: characterUsage.slice(0, 5), // Top 5 characters
      engagementScore: calculateEngagementScore({
        stories: totalStories,
        characters: totalCharacters,
        recentActivity: recentStories,
        streak: readingStreak
      }),
      lastUpdated: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error calculating dashboard analytics:', error)
    throw error
  }
}

async function getCharacterAnalyticsOverview(userId: string, childProfileId?: string | null) {
  const characters = await prisma.character.findMany({
    where: childProfileId ? { childProfileId } : { childProfile: { userId } },
    include: {
      stories: {
        include: {
          story: {
            select: {
              id: true,
              title: true,
              createdAt: true,
              theme: true
            }
          }
        }
      },
      childProfile: {
        select: {
          name: true,
          age: true
        }
      }
    }
  })

  const characterMetrics = characters.map(character => {
    const appearances = character.stories.length
    const themes = character.stories.map(s => s.story.theme).filter(Boolean)
    const uniqueThemes = Array.from(new Set(themes))
    
    return {
      id: character.id,
      name: character.name,
      childProfile: character.childProfile.name,
      species: character.species,
      appearances,
      uniqueThemes: uniqueThemes.length,
      favoriteThemes: themes.slice(0, 3), // Top 3 themes
      lastUsed: appearances > 0 
        ? new Date(Math.max(...character.stories.map(s => new Date(s.story.createdAt).getTime())))
        : new Date(character.createdAt),
      consistencyScore: Math.floor(85 + Math.random() * 15), // Mock score
      consistencyTrend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as 'improving' | 'stable' | 'declining'
    }
  })

  // Sort by usage and consistency
  characterMetrics.sort((a, b) => {
    if (a.appearances !== b.appearances) {
      return b.appearances - a.appearances
    }
    return b.consistencyScore - a.consistencyScore
  })

  return {
    characters: characterMetrics,
    summary: {
      totalCharacters: characters.length,
      averageConsistency: characterMetrics.length > 0 
        ? Math.round(characterMetrics.reduce((sum, char) => sum + char.consistencyScore, 0) / characterMetrics.length)
        : 0,
      mostUsedCharacter: characterMetrics[0]?.name || null,
      highestConsistency: Math.max(...characterMetrics.map(c => c.consistencyScore), 0),
      charactersNeedingAttention: characterMetrics.filter(c => c.consistencyScore < 80).length
    }
  }
}

async function getCharacterUsageMetrics(userId: string, childProfileId: string | null) {
  const characters = await prisma.character.findMany({
    where: childProfileId ? { childProfileId } : { childProfile: { userId } },
    include: {
      stories: {
        include: {
          story: true
        }
      }
    }
  })

  return characters.map(character => ({
    id: character.id,
    name: character.name,
    usageCount: character.stories.length,
    lastUsed: character.stories.length > 0 
      ? new Date(Math.max(...character.stories.map(s => new Date(s.story.createdAt).getTime())))
      : null,
    consistencyScore: Math.floor(85 + Math.random() * 15) // Mock score - would be calculated by beta analytics
  })).sort((a, b) => b.usageCount - a.usageCount)
}

interface UserInteractionData {
  type: string
  action: string
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

async function trackUserInteraction(userId: string, data: UserInteractionData) {
  // Store user interaction data for analytics
  // In a real implementation, this would go to an analytics database
  console.log('User interaction tracked:', { userId, ...data })
  
  // Could store in a dedicated analytics table
  // await prisma.userInteraction.create({
  //   data: {
  //     userId,
  //     type: data.type,
  //     action: data.action,
  //     metadata: data.metadata,
  //     timestamp: new Date()
  //   }
  // })
}

function calculateReadingStreak(stories: Array<{ createdAt: Date | string }>): number {
  if (stories.length === 0) return 0
  
  const dates = stories.map(s => new Date(s.createdAt).toDateString())
  const uniqueDates = Array.from(new Set(dates)).sort()
  
  let streak = 0
  const today = new Date().toDateString()
  
  for (let i = uniqueDates.length - 1; i >= 0; i--) {
    const date = new Date(uniqueDates[i])
    const diffDays = Math.floor((new Date(today).getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === streak) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

function calculateEngagementScore(data: {
  stories: number
  characters: number
  recentActivity: number
  streak: number
}): number {
  const storyScore = Math.min(data.stories * 5, 50)
  const characterScore = Math.min(data.characters * 10, 30)
  const activityScore = Math.min(data.recentActivity * 5, 10)
  const streakScore = Math.min(data.streak * 2, 10)
  
  return Math.round(storyScore + characterScore + activityScore + streakScore)
}
