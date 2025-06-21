#!/usr/bin/env node

/**
 * Simple fix for carlos avatar using existing functions
 */

require('dotenv').config({ path: '.env.local' });

async function simpleAvatarFix() {
  console.log('🔧 SIMPLE AVATAR FIX FOR CARLOS\n');

  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Update carlos profile to use a test URL first to verify the UI works
    const testImageUrl = 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=CARLOS';
    
    console.log('1️⃣ Updating carlos with test avatar URL...');
    const result = await prisma.childProfile.updateMany({
      where: { name: 'carlos' },
      data: { avatarUrl: testImageUrl }
    });
    
    console.log(`✅ Updated ${result.count} profile(s)`);
    console.log(`New avatar URL: ${testImageUrl}`);
    
    // Verify the test URL is accessible
    console.log('\n2️⃣ Testing accessibility...');
    try {
      const response = await fetch(testImageUrl, { method: 'HEAD' });
      console.log(`Test URL status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('✅ Test avatar URL is accessible');
        console.log('\n🎉 Avatar should now display in the UI!');
        console.log('💡 Open http://localhost:3000/stories/create to test');
      }
    } catch (error) {
      console.log(`❌ Error testing URL: ${error.message}`);
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

simpleAvatarFix().catch(console.error);
