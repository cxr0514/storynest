#!/bin/bash

echo "🚨 OAUTH CALLBACK ERROR - DEFINITIVE FIX 🚨"
echo ""
echo "The error 'http://localhost:3000/api/auth/signin?error=Callback' means:"
echo "Google is rejecting the callback because your Google Cloud Console"
echo "doesn't have the correct redirect URI configured."
echo ""

echo "🎯 STEP-BY-STEP SOLUTION:"
echo ""

echo "1️⃣  OPEN GOOGLE CLOUD CONSOLE"
echo "   Click this link: https://console.cloud.google.com/apis/credentials"
echo ""

echo "2️⃣  FIND YOUR OAUTH CLIENT"
echo "   Look for: 220199238608-kgk0ovuc7obqifai2ccoev3aqpo7epgh.apps.googleusercontent.com"
echo "   Click the pencil (✏️) icon to edit it"
echo ""

echo "3️⃣  ADD THESE EXACT URLS"
echo ""
echo "   📍 In 'Authorized JavaScript origins', ADD:"
echo "   ┌─────────────────────────────────────┐"
echo "   │  http://localhost:3000              │"
echo "   └─────────────────────────────────────┘"
echo ""
echo "   📍 In 'Authorized redirect URIs', ADD:"
echo "   ┌─────────────────────────────────────────────────────────┐"
echo "   │  http://localhost:3000/api/auth/callback/google         │"
echo "   └─────────────────────────────────────────────────────────┘"
echo ""

echo "4️⃣  SAVE AND WAIT"
echo "   • Click 'SAVE' button"
echo "   • Wait 5-10 minutes for Google to update"
echo ""

echo "5️⃣  CHECK OAUTH CONSENT SCREEN"
echo "   • Go to: https://console.cloud.google.com/apis/credentials/consent"
echo "   • If status is 'Testing', either:"
echo "     - Add your email to 'Test users' section, OR"
echo "     - Change to 'External' and publish the app"
echo ""

echo "📊 CURRENT SYSTEM STATUS:"
if curl -s http://localhost:3000/api/auth/providers > /dev/null; then
    echo "   ✅ Server running on http://localhost:3000"
    CALLBACK_URL=$(curl -s http://localhost:3000/api/auth/providers | jq -r '.google.callbackUrl' 2>/dev/null)
    echo "   ✅ Expected callback URL: $CALLBACK_URL"
else
    echo "   ❌ Server not responding"
    exit 1
fi

echo ""
echo "🔧 ADDITIONAL TROUBLESHOOTING:"
echo ""

echo "If the problem persists after Google Cloud Console changes:"
echo ""

echo "🌐 Clear browser data:"
echo "   • Open Developer Tools (F12)"
echo "   • Go to Application > Storage"
echo "   • Click 'Clear site data' for localhost:3000"
echo ""

echo "🔄 Try different approaches:"
echo "   • Use incognito/private browsing"
echo "   • Try a different Google account (personal Gmail)"
echo "   • Disable browser extensions temporarily"
echo ""

echo "📱 Test with different account types:"
echo "   • Personal Gmail accounts work best"
echo "   • Work/organization accounts may have restrictions"
echo "   • G Suite accounts may need admin approval"
echo ""

echo "Press ENTER to open Google Cloud Console credentials page..."
read
open "https://console.cloud.google.com/apis/credentials"

echo ""
echo "Press ENTER to open OAuth consent screen page..."
read
open "https://console.cloud.google.com/apis/credentials/consent"

echo ""
echo "After making the changes, press ENTER to test OAuth..."
read

echo "🧹 Clearing any cached OAuth state..."
# Clear Next.js cache
rm -rf .next/cache 2>/dev/null || true

echo "🌐 Opening test page..."
open "http://localhost:3000/api/auth/signin"

echo ""
echo "✅ If you still get the callback error after:"
echo "   1. Adding the exact URLs to Google Cloud Console"
echo "   2. Waiting 5-10 minutes"
echo "   3. Clearing browser data"
echo "   4. Using incognito mode"
echo ""
echo "Then the issue might be:"
echo "   • Your Google project needs verification"
echo "   • Your organization blocks third-party apps"
echo "   • Try with a different Google account"
echo ""
echo "The most common fix is just adding the correct URLs to Google Cloud Console!"
