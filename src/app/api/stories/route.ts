import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !('id' in session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const childProfileId = searchParams.get('childProfileId')

    const whereCondition: { userId: string; childProfileId?: string } = {
      userId: (session.user as { id: string }).id
    }

    if (childProfileId) {
      whereCondition.childProfileId = childProfileId
    }

    const stories = await prisma.story.findMany({
      where: whereCondition,
      include: {
        StoryPage: {
          orderBy: {
            pageNumber: 'asc'
          }
        },
        ChildProfile: true,
        StoryCharacter: {
          include: {
            Character: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}
