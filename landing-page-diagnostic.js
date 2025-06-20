#!/usr/bin/env node

/**
 * Landing Page Loading Diagnostic
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Landing Page Loading Diagnostic');
console.log('==================================');

// Check if key files exist
const filesToCheck = [
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'next.config.ts',
  'package.json',
  '.env.local'
];

console.log('\n📁 Checking critical files...');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check environment variables
console.log('\n🔧 Environment variables...');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'OPENAI_API_KEY'
];

// Load .env.local
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  requiredEnvVars.forEach(varName => {
    const hasVar = envContent.includes(varName + '=');
    console.log(`${hasVar ? '✅' : '❌'} ${varName}`);
  });
} else {
  console.log('❌ .env.local file not found');
}

// Check node_modules
console.log('\n📦 Dependencies...');
const nodeModulesExists = fs.existsSync('node_modules');
console.log(`${nodeModulesExists ? '✅' : '❌'} node_modules directory`);

if (nodeModulesExists) {
  const nextExists = fs.existsSync('node_modules/next');
  console.log(`${nextExists ? '✅' : '❌'} Next.js installed`);
}

// Check for any .next directory
console.log('\n🗂️  Build cache...');
const nextDirExists = fs.existsSync('.next');
console.log(`${nextDirExists ? '⚠️ ' : '✅'} .next directory ${nextDirExists ? '(exists - might need clearing)' : '(clean)'}`);

console.log('\n📋 Recommendations:');
if (!nodeModulesExists) {
  console.log('1. Run: npm install');
}
if (nextDirExists) {
  console.log('2. Clear cache: rm -rf .next');
}
console.log('3. Start server: npm run dev');
console.log('4. Check http://localhost:3000');
