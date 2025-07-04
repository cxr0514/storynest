import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlanLimits } from '@/lib/plan-limits'
import { generateCharacterAvatar } from '@/lib/avatar'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const childProfileId = searchParams.get('childProfileId')

    const whereCondition: { userId: string; childProfileId?: string } = {
      userId: session.user.id
    }

    if (childProfileId) {
      whereCondition.childProfileId = childProfileId
    }

    const characters = await prisma.character.findMany({
      where: whereCondition,
      include: {
        ChildProfile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(characters)
  } catch (error) {
    console.error('Error fetching characters:', error)
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      species,
      age,
      physicalFeatures,
      clothingAccessories,
      personalityTraits,
      personalityDescription,
      specialAbilities,
      favoriteThings,
      speakingStyle,
      favoritePhrases,
      childProfileId,
      styleName,
      ageGroups,
      appearances
    } = body

    // Validate required fields
    if (!name || !species || !age || !physicalFeatures || !personalityDescription || !childProfileId) {
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

    // Check subscription limits for character creation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        Subscription: {
          select: {
            plan: true,
            status: true
          }
        }
      }
    })

    const currentPlan = user?.Subscription?.plan || user?.plan || 'free'
    const planLimits = getPlanLimits(currentPlan)
    
    // Count existing characters for this user
    const existingCharactersCount = await prisma.character.count({
      where: {
        userId: session.user.id
      }
    })
    
    // Check if user has reached character limit
    if (planLimits.charactersLimit !== -1 && existingCharactersCount >= planLimits.charactersLimit) {
      return NextResponse.json({ 
        error: 'Character limit reached', 
        message: `You have reached your character limit of ${planLimits.charactersLimit} for the ${currentPlan} plan. Please upgrade to create more characters.`,
        currentCount: existingCharactersCount,
        limit: planLimits.charactersLimit
      }, { status: 403 })
    }

    // Create character
    const character = await prisma.character.create({
      data: {
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        species,
        age,
        physicalFeatures,
        clothingAccessories: clothingAccessories || '',
        personalityTraits: Array.isArray(personalityTraits) ? personalityTraits : [],
        personalityDescription,
        specialAbilities: specialAbilities || '',
        favoriteThings: favoriteThings || '',
        speakingStyle: speakingStyle || '',
        favoritePhrases: Array.isArray(favoritePhrases) ? favoritePhrases : [],
        ageGroups: Array.isArray(ageGroups) ? ageGroups : ['3-6', '7-10'],
        appearances: Array.isArray(appearances) ? appearances : [],
        styleName: styleName || 'storybook_soft',
        userId: session.user.id,
        childProfileId,
        updatedAt: new Date()
      },
      include: {
        ChildProfile: true
      }
    })

    // Generate avatar in the background (don't block response)
    if (character.id) {
      generateCharacterAvatar({
        id: character.id,
        name: character.name,
        species: character.species,
        physicalFeatures: character.physicalFeatures,
        styleName: character.styleName
      }).then(avatarUrl => {
        if (avatarUrl) {
          // Update character with avatar URL
          prisma.character.update({
            where: { id: character.id },
            data: { avatarUrl }
          }).catch(error => {
            console.error('Error updating character with avatar URL:', error)
          })
        }
      }).catch(error => {
        console.error('Error generating character avatar:', error)
      })
    }

    return NextResponse.json(character)
  } catch (error) {
    console.error('Error creating character:', error)
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 })
  }
}
