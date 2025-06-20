import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const childProfiles = await prisma.childProfile.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(childProfiles)
  } catch (error) {
    console.error('Error fetching child profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch child profiles' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, age, interests } = body

    // Validate required fields
    if (!name || !age) {
      return NextResponse.json({ error: 'Name and age are required' }, { status: 400 })
    }

    // Validate age is a number
    const ageNumber = parseInt(age)
    if (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 18) {
      return NextResponse.json({ error: 'Age must be a number between 0 and 18' }, { status: 400 })
    }

    // Create child profile
    const childProfile = await prisma.childProfile.create({
      data: {
        id: uuidv4(),
        name: name.trim(),
        age: ageNumber,
        interests: Array.isArray(interests) ? interests : [],
        userId: session.user.id
      }
    })

    return NextResponse.json(childProfile)
  } catch (error) {
    console.error('Error creating child profile:', error)
    return NextResponse.json({ error: 'Failed to create child profile' }, { status: 500 })
  }
}
