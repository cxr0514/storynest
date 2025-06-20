import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  try {
    // Temporarily return success to prevent errors while we fix the schema
    return NextResponse.json({ 
      success: true, 
      message: "Reading progress temporarily disabled" 
    })
    
    /*
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
    */
  } catch (error) {
    console.error('Error updating reading progress:', error)
    return NextResponse.json({ error: 'Failed to update reading progress' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest) {
  try {
    // Temporarily return empty data while we fix the schema
    return NextResponse.json({ 
      progress: [], 
      summary: {
        totalStoriesRead: 0,
        totalTimeSpent: 0,
        averageCompletionRate: 0,
        favoriteGenres: [],
        readingStreak: 0,
        storiesInProgress: 0,
        completedStories: 0
      }
    })
    
    /*
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
    const whereClause: { userId: string; childProfileId?: string } = {
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
      totalTimeSpent: progressData.reduce((sum: number, p: ReadingProgressWithRelations) => sum + p.timeSpent, 0),
      averageCompletionRate: progressData.length > 0 
        ? progressData.reduce((sum: number, p: ReadingProgressWithRelations) => sum + p.progressPercent, 0) / progressData.length 
        : 0,
      favoriteGenres: calculateFavoriteGenres(progressData),
      readingStreak: calculateReadingStreak(progressData),
      storiesInProgress: progressData.filter((p: ReadingProgressWithRelations) => !p.isCompleted).length,
      completedStories: progressData.filter((p: ReadingProgressWithRelations) => p.isCompleted).length
    }

    return NextResponse.json({
      progress: progressData,
      summary
    })
    */

  } catch (error) {
    console.error('Error fetching reading progress:', error)
    return NextResponse.json({ error: 'Failed to fetch reading progress' }, { status: 500 })
  }
}
