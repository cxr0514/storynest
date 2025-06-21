
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateWithWebUrl() {
  try {
    console.log('Updating carlos with web-accessible avatar...');
    const result = await prisma.childProfile.updateMany({
      where: { name: 'carlos' },
      data: { avatarUrl: 'https://httpbin.org/image/png' }
    });
    console.log('Updated:', result.count, 'profiles');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateWithWebUrl();

