// Test child profile creation with CommonJS
const { PrismaClient } = require('@prisma/client');

async function testChildProfileCreation() {
  const prisma = new PrismaClient({
    log: ['query', 'error'],
  });

  try {
    console.log('🔍 Testing child profile creation...');

    // Check current users
    const users = await prisma.user.findMany();
    console.log(`📊 Found ${users.length} users in database`);

    if (users.length === 0) {
      console.log('⚠️ No users found. This test requires at least one user.');
      return;
    }

    const testUserId = users[0].id;
    console.log(`👤 Using user ID: ${testUserId}`);

    // Test child profile creation
    console.log('🎯 Creating test child profile...');
    const childProfile = await prisma.childProfile.create({
      data: {
        name: 'Test Child',
        age: 8,
        interests: ['Adventure', 'Magic', 'Science'],
        userId: testUserId
      }
    });

    console.log('✅ Child profile created successfully!');
    console.log('📝 Profile details:', {
      id: childProfile.id,
      name: childProfile.name,
      age: childProfile.age,
      interests: childProfile.interests,
      createdAt: childProfile.createdAt
    });

    // Clean up
    await prisma.childProfile.delete({
      where: { id: childProfile.id }
    });
    console.log('🧹 Test profile cleaned up');

    console.log('🎉 Test completed successfully! Child profile creation is working.');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    if (error.code) {
      console.error('🔍 Prisma error code:', error.code);
    }
    if (error.meta) {
      console.error('🔍 Prisma error meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testChildProfileCreation();
