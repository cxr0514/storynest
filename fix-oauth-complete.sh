#!/bin/bash

echo "🚨 OAUTH CALLBACK ERROR - COMPREHENSIVE FIXER 🚨"
echo ""
echo "Based on your error: http://localhost:3000/api/auth/signin?error=Callback"
echo "This is a Google Cloud Console configuration issue."
echo ""

echo "🎯 STEP-BY-STEP SOLUTION:"
echo ""

echo "1️⃣  OPEN GOOGLE CLOUD CONSOLE"
echo "   • Go to: https://console.cloud.google.com/apis/credentials"
echo "   • Sign in with the same Google account used to create the project"
echo ""

echo "2️⃣  FIND YOUR OAUTH CLIENT"
echo "   • Look for OAuth 2.0 Client ID: 220199238608-kgk0ovuc7obqifai2ccoev3aqpo7epgh.apps.googleusercontent.com"
echo "   • Click the pencil (edit) icon next to it"
echo ""

echo "3️⃣  UPDATE AUTHORIZED URLs (CRITICAL)"
echo "   In the 'Authorized JavaScript origins' section, ADD:"
echo "   ┌─────────────────────────────────────┐"
echo "   │  http://localhost:3000              │"
echo "   └─────────────────────────────────────┘"
echo ""
echo "   In the 'Authorized redirect URIs' section, ADD:"
echo "   ┌─────────────────────────────────────────────────────────┐"
echo "   │  http://localhost:3000/api/auth/callback/google         │"
echo "   └─────────────────────────────────────────────────────────┘"
echo ""

echo "4️⃣  SAVE AND WAIT"
echo "   • Click 'SAVE' at the bottom"
echo "   • Wait 5-10 minutes for Google to propagate changes"
echo ""

echo "5️⃣  CHECK OAUTH CONSENT SCREEN"
echo "   • Go to: https://console.cloud.google.com/apis/credentials/consent"
echo "   • If status is 'Testing', add your email to 'Test users'"
echo "   • Or publish the app for 'External' users"
echo ""

echo "🔧 IMMEDIATE TROUBLESHOOTING:"
echo ""

# Test current configuration
echo "📊 Current Application Status:"
if curl -s http://localhost:3000/api/auth/providers > /dev/null; then
    echo "   ✅ Server running on http://localhost:3000"
    echo "   ✅ OAuth providers endpoint working"
    CALLBACK_URL=$(curl -s http://localhost:3000/api/auth/providers | jq -r '.google.callbackUrl' 2>/dev/null)
    echo "   ✅ Callback URL configured: $CALLBACK_URL"
else
    echo "   ❌ Server not responding"
    exit 1
fi

echo ""
echo "🌐 QUICK TESTS TO TRY:"
echo ""
echo "Test 1: Clear browser data"
echo "   • Open browser developer tools (F12)"
echo "   • Go to Application/Storage tab"
echo "   • Clear all data for localhost:3000"
echo ""

echo "Test 2: Try incognito mode"
echo "   • Open incognito/private browser window"
echo "   • Visit: http://localhost:3000/api/auth/signin"
echo ""

echo "Test 3: Different Google account"
echo "   • Try signing in with a personal Gmail account"
echo "   • Avoid work/organization accounts initially"
echo ""

echo "📱 COMMON CAUSES OF THIS ERROR:"
echo "   • Redirect URI mismatch in Google Cloud Console"
echo "   • OAuth consent screen not configured properly"
echo "   • App in testing mode without test user added"
echo "   • Organization blocking third-party apps"
echo ""

echo "🎯 AFTER MAKING GOOGLE CLOUD CONSOLE CHANGES:"
echo "   1. Wait 5-10 minutes"
echo "   2. Clear browser cookies"
echo "   3. Test: http://localhost:3000/api/auth/signin"
echo ""

echo "Press ENTER to open Google Cloud Console..."
read
open "https://console.cloud.google.com/apis/credentials"
echo ""
echo "Press ENTER when you've made the changes to test OAuth..."
read
open "http://localhost:3000/api/auth/signin"
