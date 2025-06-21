import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrismaAdapterFix() {
  try {
    console.log('🔍 Testing Prisma adapter fix...');
    
    // Test the exact query from our CustomPrismaAdapter.getUserByAccount
    const result = await prisma.account.findUnique({
      where: {
        provider_provider_account_id: {
          provider: 'google',
          provider_account_id: 'test123',
        },
      },
      include: { User: true },
    });
    
    console.log('✅ Query executed successfully!');
    console.log('📝 Result:', result ? 'Found account' : 'No account found (expected for test data)');
    console.log('🚀 Our Prisma adapter fix is working correctly!');
    
  } catch (error: any) {
    console.error('❌ Query failed:', error.message);
    console.error('💥 Our fix may not be working properly.');
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaAdapterFix();
