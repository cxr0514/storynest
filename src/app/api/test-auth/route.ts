import { NextResponse } from 'next/server'
import { CustomPrismaAdapter } from '@/lib/custom-prisma-adapter'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const adapter = CustomPrismaAdapter(prisma)
    
    // Test creating a user like Google OAuth would
    const testUser = {
      name: "Test Google User",
      email: `test-google-${Date.now()}@gmail.com`,
      image: "https://lh3.googleusercontent.com/test",
      emailVerified: null
    }
    
    console.log('Testing createUser with:', testUser)
    
    const createdUser = await adapter.createUser!(testUser)
    console.log('User created successfully:', createdUser)
    
    // Clean up
    await prisma.user.delete({ where: { id: createdUser.id } })
    
    return NextResponse.json({
      success: true,
      message: 'Custom adapter test completed successfully',
      createdUser
    })
    
  } catch (error) {
    console.error('Custom adapter test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
