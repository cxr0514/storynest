#!/usr/bin/env node

/**
 * Final System Verification
 * Quick health check for the complete StoryNest character avatar system
 */

require('dotenv').config({ path: '.env.local' });

async function finalVerification() {
  console.log('🔍 STORYNEST FINAL SYSTEM VERIFICATION');
  console.log('====================================');
  console.log();

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };

  function check(name, condition, isWarning = false) {
    if (condition) {
      console.log(`✅ ${name}`);
      results.passed++;
    } else {
      if (isWarning) {
        console.log(`⚠️  ${name}`);
        results.warnings++;
      } else {
        console.log(`❌ ${name}`);
        results.failed++;
      }
    }
  }

  // 1. Environment Variables
  console.log('1️⃣ Environment Configuration:');
  check('OpenAI API Key', !!process.env.OPENAI_API_KEY);
  check('Wasabi Access Key', !!process.env.WASABI_ACCESS_KEY_ID);
  check('Wasabi Secret Key', !!process.env.WASABI_SECRET_ACCESS_KEY);
  check('Google OAuth Client ID', !!process.env.GOOGLE_CLIENT_ID);
  check('Google OAuth Client Secret', !!process.env.GOOGLE_CLIENT_SECRET);
  check('NextAuth URL', !!process.env.NEXTAUTH_URL);
  check('NextAuth Secret', !!process.env.NEXTAUTH_SECRET);

  // 2. File Structure
  console.log('\n2️⃣ File Structure:');
  const fs = require('fs');
  const path = require('path');
  
  check('Avatar library', fs.existsSync('./src/lib/avatar.ts'));
  check('Style mapping', fs.existsSync('./src/lib/styleMap.ts'));
  check('Character creation page', fs.existsSync('./src/app/characters/create/page.tsx'));
  check('Character API route', fs.existsSync('./src/app/api/characters/route.ts'));
  check('Auth API route', fs.existsSync('./src/app/api/auth/[...nextauth]/route.ts'));

  // 3. Style Assets
  console.log('\n3️⃣ Style Assets:');
  const styleAssets = [
    'storybook_soft.svg',
    'sora_cinema.svg', 
    'pixel_quest.svg',
    'comic_bold.svg'
  ];
  
  styleAssets.forEach(asset => {
    check(`Style asset: ${asset}`, fs.existsSync(`./public/style-samples/${asset}`));
  });

  // 4. Dependencies
  console.log('\n4️⃣ Dependencies:');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  check('AWS SDK', !!allDeps['aws-sdk']);
  check('OpenAI', !!allDeps['openai']);
  check('Prisma Client', !!allDeps['@prisma/client']);
  check('NextAuth', !!allDeps['next-auth']);

  // 5. Server Health
  console.log('\n5️⃣ Server Health:');
  try {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/providers',
      timeout: 5000
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        check('Server responsive', res.statusCode === 200);
        resolve();
      });
      req.on('error', () => {
        check('Server responsive', false);
        resolve();
      });
      req.on('timeout', () => {
        check('Server responsive', false);
        resolve();
      });
      req.end();
    });
  } catch (error) {
    check('Server responsive', false);
  }

  // 6. Database Connection
  console.log('\n6️⃣ Database Connection:');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    check('Database connection', true);
    await prisma.$disconnect();
  } catch (error) {
    check('Database connection', false);
  }

  // Results Summary
  console.log('\n📊 VERIFICATION RESULTS:');
  console.log('========================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log();

  if (results.failed === 0) {
    console.log('🎉 ALL SYSTEMS GO! StoryNest is ready for production!');
    console.log();
    console.log('🚀 Next Steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Sign in with Google OAuth');
    console.log('3. Create characters with different art styles');
    console.log('4. Verify avatar generation and display');
    console.log('5. Test the complete user workflow');
  } else {
    console.log('⚠️  Some issues detected. Please review the failed checks above.');
    process.exit(1);
  }
}

if (require.main === module) {
  finalVerification().catch(console.error);
}
