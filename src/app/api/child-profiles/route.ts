import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { getSignedImageUrl } from '@/lib/storage-cloud'

// Helper function to fix broken avatar URLs by generating signed URLs
async function fixBrokenAvatarUrls(profiles: { id: string; name: string; avatarUrl: string | null; [key: string]: unknown }[]) {
  const fixedProfiles = []
  
  for (const profile of profiles) {
    const fixedProfile = { ...profile }
    
    // Check if avatar URL exists and is a Wasabi URL
    if (profile.avatarUrl && profile.avatarUrl.includes('wasabisys.com')) {
      try {
        // Test if the URL is accessible
        const testResponse = await fetch(profile.avatarUrl, { method: 'HEAD' })
        
        if (testResponse.status === 403) {
          console.log(`🔧 Fixing avatar URL for ${profile.name} (403 error)`)
          
          // Extract the S3 key from the URL
          const urlParts = profile.avatarUrl.split('/')
          const key = urlParts.slice(-2).join('/') // Get "avatars/filename.png"
          
          // Generate a signed URL
          const signedUrl = await getSignedImageUrl(key)
          
          // Update the profile in the database
          await prisma.childProfile.update({
            where: { id: profile.id },
            data: { avatarUrl: signedUrl }
          })
          
          fixedProfile.avatarUrl = signedUrl
          console.log(`✅ Fixed avatar URL for ${profile.name}`)
        }
      } catch (error) {
        console.error(`❌ Failed to fix avatar for ${profile.name}:`, error)
        // Keep the original URL if we can't fix it
      }
    }
    
    fixedProfiles.push(fixedProfile)
  }
  
  return fixedProfiles
}

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

    // Fix any broken avatar URLs
    const fixedProfiles = await fixBrokenAvatarUrls(childProfiles)

    return NextResponse.json(fixedProfiles)
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
