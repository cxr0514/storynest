const { PrismaClient } = require('@prisma/client')

async function testPrismaAdapter() {
  console.log('🔍 Testing Prisma Adapter Fix...')
  
  const prisma = new PrismaClient()
  
  try {
    // Test the exact query that was failing
    console.log('Testing getUserByAccount query...')
    
    const result = await prisma.account.findUnique({
      where: {
        provider_provider_account_id: {
          provider: 'google',
          provider_account_id: 'test123',
        },
      },
      include: { User: true },
    })
    
    console.log('✅ Query executed successfully!')
    console.log('Result:', result || 'No account found (expected)')
    
  } catch (error) {
    console.error('❌ Query failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPrismaAdapter()
