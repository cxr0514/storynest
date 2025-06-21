const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  
  try {
    const profiles = await prisma.childProfile.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Child Profiles:', JSON.stringify(profiles, null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
})();
