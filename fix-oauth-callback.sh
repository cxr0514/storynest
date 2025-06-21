#!/bin/bash

echo "🚨 OAUTH CALLBACK ERROR FIXER 🚨"
echo ""
echo "📋 Checking current configuration..."

# Check if server is running
if curl -s http://localhost:3000/api/auth/providers > /dev/null; then
    echo "✅ Server is running on port 3000"
else
    echo "❌ Server is not running - starting now..."
    cd "/Users/CXR0514/Library/CloudStorage/OneDrive-TheHomeDepot/Documents 1/GitHub/storynest"
    PORT=3000 npm run dev &
    SERVER_PID=$!
    echo "⏱️  Waiting for server to start..."
    sleep 5
fi

echo ""
echo "🎯 MOST LIKELY CAUSE: Google Cloud Console Configuration"
echo ""
echo "URGENT: Check your Google Cloud Console settings:"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Find your OAuth 2.0 Client ID: 220199238608-kgk0ovuc7obqifai2ccoev3aqpo7epgh.apps.googleusercontent.com"
echo "3. Edit it and ensure these EXACT URLs are added:"
echo ""
echo "   📍 Authorized JavaScript origins:"
echo "      http://localhost:3000"
echo ""
echo "   📍 Authorized redirect URIs:"
echo "      http://localhost:3000/api/auth/callback/google"
echo ""
echo "4. Save the changes"
echo "5. Wait 5-10 minutes for Google to propagate the changes"
echo ""
echo "🔧 Additional checks:"

# Test if the OAuth endpoint is working
echo "   Testing OAuth providers endpoint..."
if curl -s http://localhost:3000/api/auth/providers | grep -q "google"; then
    echo "   ✅ OAuth providers endpoint working"
else
    echo "   ❌ OAuth providers endpoint failed"
fi

# Test callback URL
echo "   Testing callback endpoint..."
CALLBACK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/callback/google)
if [ "$CALLBACK_STATUS" = "302" ] || [ "$CALLBACK_STATUS" = "400" ]; then
    echo "   ✅ Callback endpoint accessible (status: $CALLBACK_STATUS)"
else
    echo "   ⚠️  Callback endpoint status: $CALLBACK_STATUS"
fi

echo ""
echo "🔄 TEMPORARY WORKAROUNDS:"
echo ""
echo "1️⃣  Try with a different Google account (personal Gmail)"
echo "2️⃣  Clear browser cookies and try incognito mode"
echo "3️⃣  Check OAuth consent screen is configured for external users"
echo ""
echo "🌐 Test URL: http://localhost:3000/api/auth/signin"
echo ""
echo "Press any key to open browser and test..."
read -n 1
open "http://localhost:3000/api/auth/signin"
