import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const characterId = params.id

    // Find the character and verify ownership
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
        userId: session.user.id
      },
      include: {
        ChildProfile: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    return NextResponse.json(character)
  } catch (error) {
    console.error('Error fetching character:', error)
    return NextResponse.json({ error: 'Failed to fetch character' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const characterId = params.id
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
      favoritePhrases
    } = body

    // Verify character ownership
    const existingCharacter = await prisma.character.findFirst({
      where: {
        id: characterId,
        userId: session.user.id
      }
    })

    if (!existingCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Update character
    const updatedCharacter = await prisma.character.update({
      where: { id: characterId },
      data: {
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
        updatedAt: new Date()
      },
      include: {
        ChildProfile: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedCharacter)
  } catch (error) {
    console.error('Error updating character:', error)
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const characterId = params.id

    // Verify character ownership
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
        userId: session.user.id
      }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Delete character
    await prisma.character.delete({
      where: { id: characterId }
    })

    return NextResponse.json({ message: 'Character deleted successfully' })
  } catch (error) {
    console.error('Error deleting character:', error)
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 })
  }
}
