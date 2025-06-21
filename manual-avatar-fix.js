#!/usr/bin/env node

/**
 * Manual test to fix the carlos avatar with signed URL
 * This bypasses authentication and directly fixes the avatar
 */

require('dotenv').config({ path: '.env.local' });

async function manualAvatarFix() {
  console.log('🛠️ MANUAL AVATAR FIX FOR CARLOS\n');

  try {
    const { PrismaClient } = require('@prisma/client');
    const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    
    const prisma = new PrismaClient();

    // Find carlos profile
    console.log('1️⃣ Finding carlos profile...');
    const carlosProfile = await prisma.childProfile.findFirst({
      where: { name: 'carlos' },
      orderBy: { createdAt: 'desc' }
    });

    if (!carlosProfile) {
      console.log('❌ Carlos profile not found');
      await prisma.$disconnect();
      return;
    }

    console.log(`✅ Found carlos profile: ${carlosProfile.name}`);
    console.log(`Current avatar URL: ${carlosProfile.avatarUrl}`);

    if (!carlosProfile.avatarUrl || !carlosProfile.avatarUrl.includes('wasabisys.com')) {
      console.log('❌ No Wasabi avatar URL to fix');
      await prisma.$disconnect();
      return;
    }

    // Test current URL accessibility
    console.log('\n2️⃣ Testing current avatar URL...');
    try {
      const testResponse = await fetch(carlosProfile.avatarUrl, { method: 'HEAD' });
      console.log(`Current URL status: ${testResponse.status} ${testResponse.statusText}`);
      
      if (testResponse.status !== 403) {
        console.log('✅ Avatar URL is already accessible, no fix needed!');
        await prisma.$disconnect();
        return;
      }
    } catch (error) {
      console.log(`Error testing URL: ${error.message}`);
    }

    // Extract the S3 key from the URL
    console.log('\n3️⃣ Extracting S3 key...');
    const urlParts = carlosProfile.avatarUrl.split('/');
    const key = urlParts.slice(-2).join('/'); // Get "avatars/filename.png"
    console.log(`S3 key: ${key}`);

    // Create S3 client
    console.log('\n4️⃣ Creating S3 client...');
    const s3Client = new S3Client({
      region: process.env.WASABI_REGION,
      endpoint: process.env.WASABI_ENDPOINT,
      credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
        secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });

    // Generate signed URL
    console.log('\n5️⃣ Generating signed URL...');
    const command = new GetObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 31536000 // 1 year
    });

    console.log(`✅ Generated signed URL (length: ${signedUrl.length} chars)`);
    console.log(`Preview: ${signedUrl.substring(0, 100)}...`);

    // Test the signed URL
    console.log('\n6️⃣ Testing signed URL...');
    try {
      const testResponse = await fetch(signedUrl, { method: 'HEAD' });
      console.log(`Signed URL test: ${testResponse.status} ${testResponse.statusText}`);
      
      if (testResponse.ok) {
        console.log('✅ Signed URL works! Updating database...');
        
        // Update the profile with the signed URL
        console.log('\n7️⃣ Updating database...');
        await prisma.childProfile.update({
          where: { id: carlosProfile.id },
          data: { avatarUrl: signedUrl }
        });
        
        console.log('✅ Database updated successfully!');
        console.log('\n🎉 AVATAR FIX COMPLETE!');
        console.log('💡 The avatar should now display correctly in the UI');
        console.log('🌐 Test by visiting: http://localhost:3000/stories/create');
        
      } else {
        console.log(`❌ Signed URL still not accessible: ${testResponse.status}`);
        console.log('This suggests the S3 object may not exist or there are credential issues');
      }
      
    } catch (error) {
      console.log(`❌ Error testing signed URL: ${error.message}`);
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Manual fix failed:', error.message);
    console.log('\nPossible causes:');
    console.log('- S3 credentials are incorrect');
    console.log('- The avatar file was never successfully uploaded to S3');
    console.log('- Network connectivity issues');
    console.log('- S3 bucket/endpoint configuration problems');
  }
}

manualAvatarFix().catch(console.error);
