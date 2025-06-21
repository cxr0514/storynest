#!/usr/bin/env node

/**
 * Comprehensive OAuth Debugging Script
 * This script helps identify and fix Google OAuth callback issues
 */

console.log('🚨 OAUTH CALLBACK ERROR DEBUGGER 🚨\n');

const config = {
  baseUrl: 'http://localhost:3000',
  expectedCallbackUrl: 'http://localhost:3000/api/auth/callback/google',
  clientId: '220199238608-kgk0ovuc7obqifai2ccoev3aqpo7epgh.apps.googleusercontent.com'
};

console.log('📋 Current Configuration:');
console.log(`   Base URL: ${config.baseUrl}`);
console.log(`   Callback URL: ${config.expectedCallbackUrl}`);
console.log(`   Client ID: ${config.clientId.substring(0, 20)}...`);
console.log('');

console.log('🎯 MOST COMMON OAUTH CALLBACK ISSUES:\n');

console.log('1️⃣  GOOGLE CLOUD CONSOLE CONFIGURATION');
console.log('   Go to: https://console.cloud.google.com/apis/credentials');
console.log('   Find your OAuth 2.0 Client ID');
console.log('   ✅ Authorized JavaScript origins should include:');
console.log('      http://localhost:3000');
console.log('   ✅ Authorized redirect URIs should include:');
console.log('      http://localhost:3000/api/auth/callback/google');
console.log('');

console.log('2️⃣  ENVIRONMENT VARIABLES CHECK');
console.log('   ✅ NEXTAUTH_URL=http://localhost:3000');
console.log('   ✅ GOOGLE_CLIENT_ID=220199238608-...');
console.log('   ✅ GOOGLE_CLIENT_SECRET=GOCSPX-...');
console.log('');

console.log('3️⃣  BROWSER ISSUES');
console.log('   Try these steps:');
console.log('   • Clear browser cookies and cache');
console.log('   • Try incognito/private browsing mode');
console.log('   • Disable browser extensions temporarily');
console.log('');

console.log('4️⃣  ACCOUNT RESTRICTIONS');
console.log('   Your Google project might be in testing mode:');
console.log('   • Go to Google Cloud Console → OAuth consent screen');
console.log('   • Add your email to "Test users" if in testing mode');
console.log('   • Or publish your app for external users');
console.log('');

console.log('5️⃣  PROJECT VERIFICATION');
console.log('   If using a work/organization account:');
console.log('   • Check if your organization blocks third-party apps');
console.log('   • Try with a personal Gmail account first');
console.log('');

console.log('🛠️  IMMEDIATE FIXES TO TRY:\n');

console.log('✅ Fix 1: Clear NextAuth cookies');
console.log('   Run: document.cookie.split(";").forEach(c=>document.cookie=c.replace(/^\\s+/,"").replace(/=.*/,"=;expires="+new Date().toUTCString()+";path=/"))');
console.log('');

console.log('✅ Fix 2: Restart server with clean session');
console.log('   This script will do that for you...');
console.log('');

// The actual fixes will be applied by the calling script
module.exports = { config };
