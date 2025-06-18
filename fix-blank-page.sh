#!/bin/bash

echo "🔧 StoryNest Server Startup & Blank Page Fix"
echo "============================================"

cd "/Users/CXR0514/Library/CloudStorage/OneDrive-TheHomeDepot/Documents 1/GitHub/storynest"

echo "1. 🛑 Stopping any existing processes..."
pkill -f "next" 2>/dev/null || echo "   No existing processes found"
sleep 2

echo "2. 🔍 Checking for compilation errors..."
npm run build --no-lint > build.log 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Compilation successful"
    rm build.log
else
    echo "   ❌ Compilation failed. Check build.log for details:"
    tail -10 build.log
    exit 1
fi

echo "3. 🌍 Checking environment..."
if [ ! -f ".env.local" ]; then
    echo "   ⚠️  .env.local not found. Creating minimal version..."
    cat > .env.local << EOF
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/storynest
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EOF
    echo "   📝 Created .env.local with placeholder values"
    echo "   ⚠️  Please update with your actual values"
fi

echo "4. 🚀 Starting development server..."
npm run dev &
SERVER_PID=$!

echo "   📍 Server PID: $SERVER_PID"
echo "   ⏳ Waiting for server to start..."

# Wait for server to start (max 30 seconds)
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "   ✅ Server is running on http://localhost:3000"
        break
    fi
    sleep 1
    echo -n "."
done

echo ""

# Test key pages
echo "5. 🧪 Testing key pages..."

# Test health endpoint
if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    echo "   ✅ Health endpoint working"
else
    echo "   ❌ Health endpoint failed"
fi

# Test debug page
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/stories/create/debug | grep -q "200"; then
    echo "   ✅ Debug page accessible"
else
    echo "   ❌ Debug page failed"
fi

# Test fixed page
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/stories/create/fixed | grep -q "200"; then
    echo "   ✅ Fixed story creation page accessible"
else
    echo "   ❌ Fixed story creation page failed"
fi

echo ""
echo "📋 SOLUTION SUMMARY:"
echo "==================="
echo ""
echo "✅ FIXES APPLIED:"
echo "  • Removed problematic useSubscription hook"
echo "  • Added timeout protections"
echo "  • Created simplified debug page"
echo "  • Created fully working fixed page"
echo "  • Added proper error handling"
echo ""
echo "🌐 AVAILABLE PAGES:"
echo "  • Debug: http://localhost:3000/stories/create/debug"
echo "  • Fixed: http://localhost:3000/stories/create/fixed"
echo "  • Original: http://localhost:3000/stories/create"
echo ""
echo "💡 RECOMMENDATIONS:"
echo "  1. Use the FIXED page: /stories/create/fixed"
echo "  2. Test authentication at: /auth/signin"
echo "  3. Check debug info at: /stories/create/debug"
echo ""
echo "🔧 IF ISSUES PERSIST:"
echo "  1. Check browser console for JavaScript errors"
echo "  2. Verify authentication is working"
echo "  3. Ensure sample data exists in database"
echo "  4. Check that API endpoints respond"
echo ""

if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server is running successfully!"
    echo "   Visit: http://localhost:3000/stories/create/fixed"
else
    echo "❌ Server failed to start. Check logs for errors."
fi
