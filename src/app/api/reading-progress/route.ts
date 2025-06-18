import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SegmentAnalytics } from '@/lib/segment-analytics'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      storyId, 
      childProfileId, 
      currentPageNumber, 
      totalPages, 
      timeSpent = 0,
      deviceType,
      sessionId 
    } = await req.json()

    if (!storyId || !childProfileId || !currentPageNumber) {
      return NextResponse.json({ 
        error: 'Missing required fields: storyId, childProfileId, currentPageNumber' 
      }, { status: 400 })
    }

    const progressPercent = Math.round((currentPageNumber / totalPages) * 100)
    const isCompleted = currentPageNumber >= totalPages

    // Upsert reading progress
    const readingProgress = await prisma.readingProgress.upsert({
      where: {
        userId_childProfileId_storyId: {
          userId: session.user.id,
          childProfileId,
          storyId
        }
      },
      update: {
        currentPageNumber,
        totalPages,
        progressPercent,
        timeSpent: {
          increment: timeSpent
        },
        isCompleted,
        lastReadAt: new Date(),
        completedAt: isCompleted ? new Date() : null,
        deviceType,
        sessionId,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        childProfileId,
        storyId,
        currentPageNumber,
        totalPages,
        progressPercent,
        timeSpent,
        isCompleted,
        deviceType,
        sessionId,
        completedAt: isCompleted ? new Date() : null
      }
    })

    // Also update the Story model for backward compatibility
    await prisma.story.update({
      where: {
        id: storyId,
        userId: session.user.id
      },
      data: {
        currentPage: currentPageNumber,
        readingProgress: progressPercent,
        isCompleted,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      readingProgress,
      analytics: {
        timeSpent: readingProgress.timeSpent,
        progressPercent: readingProgress.progressPercent,
        isCompleted: readingProgress.isCompleted,
        sessionData: {
          deviceType: readingProgress.deviceType,
          sessionId: readingProgress.sessionId
        }
      }
    })
  } catch (error) {
    console.error('Error updating reading progress:', error)
    return NextResponse.json({ error: 'Failed to update reading progress' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const childProfileId = searchParams.get('childProfileId')
    const storyId = searchParams.get('storyId')

    // If specific story requested, return individual progress
    if (storyId && childProfileId) {
      const readingProgress = await prisma.readingProgress.findUnique({
        where: {
          userId_childProfileId_storyId: {
            userId: session.user.id,
            childProfileId,
            storyId
          }
        },
        include: {
          Story: {
            select: {
              title: true,
              theme: true
            }
          },
          ChildProfile: {
            select: {
              name: true,
              age: true
            }
          }
        }
      })

      if (!readingProgress) {
        return NextResponse.json({ error: 'Reading progress not found' }, { status: 404 })
      }

      return NextResponse.json({ readingProgress })
    }

    // Otherwise return dashboard data with summary
    const whereClause: any = {
      userId: session.user.id
    }

    if (childProfileId) {
      whereClause.childProfileId = childProfileId
    }

    // Get reading progress data with story and child profile information
    const progressData = await prisma.readingProgress.findMany({
      where: whereClause,
      include: {
        Story: {
          select: {
            id: true,
            title: true,
            theme: true
          }
        },
        ChildProfile: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50 // Limit to recent 50 entries
    })

    // Calculate summary statistics
    const summary = {
      totalStoriesRead: progressData.length,
      totalTimeSpent: progressData.reduce((sum, p) => sum + p.timeSpent, 0),
      averageCompletionRate: progressData.length > 0 
        ? progressData.reduce((sum, p) => sum + p.progressPercent, 0) / progressData.length 
        : 0,
      favoriteGenres: calculateFavoriteGenres(progressData),
      readingStreak: calculateReadingStreak(progressData),
      storiesInProgress: progressData.filter(p => !p.isCompleted).length,
      completedStories: progressData.filter(p => p.isCompleted).length
    }

    return NextResponse.json({
      progress: progressData,
      summary
    })

  } catch (error) {
    console.error('Error fetching reading progress:', error)
    return NextResponse.json({ error: 'Failed to fetch reading progress' }, { status: 500 })
  }
}

function calculateFavoriteGenres(progressData: any[]): string[] {
  const genreCounts: Record<string, number> = {}
  
  progressData.forEach(p => {
    if (p.Story?.theme) {
      genreCounts[p.Story.theme] = (genreCounts[p.Story.theme] || 0) + 1
    }
  })

  return Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre)
}

function calculateReadingStreak(progressData: any[]): number {
  // Simple streak calculation based on consecutive days with reading activity
  const readingDates = progressData
    .map(p => new Date(p.updatedAt).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort()

  let streak = 0
  const today = new Date().toDateString()
  
  for (let i = readingDates.length - 1; i >= 0; i--) {
    const date = new Date(readingDates[i])
    const daysDiff = Math.floor((new Date(today).getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === streak) {
      streak++
    } else {
      break
    }
  }

  return streak
}
