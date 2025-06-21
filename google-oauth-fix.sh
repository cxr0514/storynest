#!/bin/bash

echo "🚀 Google OAuth Fix Implementation"
echo "=================================="
echo ""

# Step 1: Kill existing dev server
echo "1. Stopping existing dev server..."
pkill -f "next dev" 2>/dev/null || echo "No existing server to stop"

# Step 2: Clear browser cookies (instructions)
echo ""
echo "2. 🍪 CLEAR BROWSER COOKIES:"
echo "   - Open Chrome/Safari Developer Tools (F12)"
echo "   - Go to Application/Storage tab"
echo "   - Clear all cookies for localhost:3000"
echo "   - Or use Incognito/Private mode"

# Step 3: Restart server
echo ""
echo "3. 🚀 Starting server with corrected OAuth configuration..."
npm run dev &

# Step 4: Wait for server to start
sleep 10

# Step 5: Test endpoints
echo ""
echo "4. 🧪 Testing OAuth configuration..."
echo ""

echo "NextAuth Providers:"
curl -s http://localhost:3000/api/auth/providers | jq . 2>/dev/null || echo "Server starting..."

echo ""
echo "Health Check:"
curl -s http://localhost:3000/api/health | jq '{status, timestamp}' 2>/dev/null || echo "Server starting..."

echo ""
echo "=================================="
echo "✅ Google OAuth Fix Complete!"
echo ""
echo "🌐 Test URLs:"
echo "  • Home: http://localhost:3000"
echo "  • Sign In: http://localhost:3000/api/auth/signin"
echo "  • Providers: http://localhost:3000/api/auth/providers"
echo ""
echo "📋 Google Cloud Console Settings:"
echo "  • Authorized origins: http://localhost:3000"
echo "  • Redirect URIs: http://localhost:3000/api/auth/callback/google"
echo ""
echo "🔧 Next Steps:"
echo "  1. Clear browser cookies for localhost:3000"
echo "  2. Try signing in with Google"
echo "  3. Check that the banner is gone after login"
echo ""
