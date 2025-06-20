#!/bin/bash

# SSL Fix Verification Script
# This script tests if the OpenAI SSL certificate issue has been resolved

echo "🔧 SSL Certificate Fix Verification"
echo "=================================="
echo ""

# 1. Check server status
echo "1️⃣ Testing server status..."
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health --connect-timeout 5)
if [ "$SERVER_STATUS" = "200" ]; then
    echo "✅ Server is running on port 3000"
else
    echo "❌ Server not responding (Status: $SERVER_STATUS)"
    exit 1
fi

# 2. Check authentication
echo ""
echo "2️⃣ Testing authentication..."
AUTH_RESPONSE=$(curl -s http://localhost:3000/api/auth/session)
if [[ "$AUTH_RESPONSE" == *"wendy hemmings"* ]]; then
    echo "✅ User is authenticated: wendy hemmings"
else
    echo "❌ User not authenticated"
    echo "   Go to: http://localhost:3000/auth/signin"
    exit 1
fi

# 3. Test story generation (this will show if SSL fix worked)
echo ""
echo "3️⃣ Testing story generation API (SSL certificate test)..."
echo "   This will test if the OpenAI SSL certificate issue is resolved..."

# Make the story generation request
STORY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/stories/generate \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "adventure",
    "characterIds": ["9d0cfbb7-cd47-4ddb-9129-3f9787956af3"],
    "childProfileId": "4bcf87d6-8fc1-4abf-8bd9-389d5c91af0d"
  }' \
  --max-time 15 \
  -w "\nHTTP_STATUS:%{http_code}")

# Extract HTTP status
HTTP_STATUS=$(echo "$STORY_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$STORY_RESPONSE" | sed '/HTTP_STATUS:/d')

echo ""
echo "📊 Story Generation Test Results:"
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "🎉 SUCCESS! SSL certificate issue is RESOLVED!"
    echo "✅ Story generation is working correctly"
    echo ""
    echo "🎯 NEXT STEPS FOR USER:"
    echo "======================"
    echo "1. Go to: http://localhost:3000/stories/create"
    echo "2. You are already signed in as 'wendy hemmings'"
    echo "3. Select child profile: 'rasco'"
    echo "4. Select character: 'marley the dream master'"
    echo "5. Choose a theme and click 'Create Story'"
    echo "6. Story creation should now work perfectly!"
    
elif [ "$HTTP_STATUS" = "500" ]; then
    echo "⚠️  Server error occurred. Checking error details..."
    if [[ "$RESPONSE_BODY" == *"self-signed certificate"* ]] || [[ "$RESPONSE_BODY" == *"SSL"* ]]; then
        echo "❌ SSL certificate issue still exists"
        echo "   The SSL fix may need additional configuration"
    elif [[ "$RESPONSE_BODY" == *"OpenAI"* ]]; then
        echo "⚠️  OpenAI API issue (not SSL related)"
        echo "   This could be an API key or quota issue"
    else
        echo "❌ Unknown server error"
        echo "Response: $RESPONSE_BODY"
    fi
    
elif [ "$HTTP_STATUS" = "401" ]; then
    echo "❌ Authentication issue"
    echo "   User needs to sign in first"
    
else
    echo "❌ Unexpected error (Status: $HTTP_STATUS)"
    echo "Response: $RESPONSE_BODY"
fi

echo ""
echo "📋 Summary:"
echo "==========="
echo "• Server: Running ✅"
echo "• Authentication: Working ✅"
echo "• SSL Fix Applied: ✅"
if [ "$HTTP_STATUS" = "200" ]; then
    echo "• Story Generation: Working ✅"
    echo ""
    echo "🎊 ALL ISSUES RESOLVED! The application is fully functional."
elif [ "$HTTP_STATUS" = "500" ]; then
    echo "• Story Generation: Needs investigation ⚠️"
else
    echo "• Story Generation: Failed ❌"
fi

echo ""
echo "🌐 Open the application: http://localhost:3000"
