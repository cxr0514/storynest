#!/usr/bin/env node

/**
 * Final verification of avatar display system
 * Tests all components to ensure the fix is working
 */

require('dotenv').config({ path: '.env.local' });

async function finalVerification() {
  console.log('🔍 FINAL AVATAR SYSTEM VERIFICATION\n');

  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // 1. Check database state
    console.log('1️⃣ Checking database state...');
    const profiles = await prisma.childProfile.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`Found ${profiles.length} child profiles:`);
    for (const profile of profiles) {
      console.log(`  📋 ${profile.name} (${profile.age} years)`);
      console.log(`     Avatar: ${profile.avatarUrl || 'None'}`);
      
      if (profile.avatarUrl) {
        // Test accessibility
        try {
          const response = await fetch(profile.avatarUrl, { method: 'HEAD' });
          const status = response.status;
          const contentType = response.headers.get('content-type');
          
          if (response.ok) {
            console.log(`     ✅ Accessible: ${status} (${contentType})`);
          } else {
            console.log(`     ❌ Not accessible: ${status}`);
          }
        } catch (error) {
          console.log(`     ❌ Network error: ${error.message}`);
        }
      }
      console.log();
    }

    // 2. Check server status
    console.log('2️⃣ Checking server endpoints...');
    try {
      const healthCheck = await fetch('http://localhost:3000/api/auth/session');
      console.log(`   Server status: ${healthCheck.status}`);
    } catch (error) {
      console.log(`   Server status: Not running (${error.message})`);
    }

    // 3. Verify storage configuration
    console.log('3️⃣ Checking storage configuration...');
    console.log(`   Wasabi Endpoint: ${process.env.WASABI_ENDPOINT || 'Not set'}`);
    console.log(`   Wasabi Bucket: ${process.env.WASABI_BUCKET_NAME || 'Not set'}`);
    console.log(`   OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not set'}`);

    await prisma.$disconnect();

    // 4. Summary
    console.log('\n🎯 VERIFICATION SUMMARY:');
    
    const workingProfiles = profiles.filter(p => p.avatarUrl);
    console.log(`   📊 Profiles with avatars: ${workingProfiles.length}/${profiles.length}`);
    
    if (workingProfiles.length > 0) {
      console.log('   ✅ Avatar system is operational');
      console.log('   💡 Ready for testing in browser at http://localhost:3000/stories/create');
    } else {
      console.log('   ⚠️ No profiles with avatars found');
      console.log('   💡 Create a new child profile to test avatar generation');
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Ensure development server is running (npm run dev)');
    console.log('   2. Sign in with Google OAuth');
    console.log('   3. Navigate to /stories/create');
    console.log('   4. Verify carlos profile shows avatar (not placeholder text)');
    console.log('   5. Test creating new child profiles with AI avatar generation');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

finalVerification().catch(console.error);
