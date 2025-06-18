#!/bin/zsh

echo "🧪 Testing Form Functionality"
echo "============================="

cd "/Users/CXR0514/Library/CloudStorage/OneDrive-TheHomeDepot/Documents 1/GitHub/storynest"

echo "1. Running data fix..."
node fix-all-forms.js

echo ""
echo "2. Testing API endpoints..."

# Test child profiles API
echo "Testing /api/child-profiles..."
curl -s http://localhost:3000/api/child-profiles -H "Accept: application/json" | head -c 200
echo ""

# Test characters API  
echo "Testing /api/characters..."
curl -s http://localhost:3000/api/characters -H "Accept: application/json" | head -c 200
echo ""

echo ""
echo "3. Form URLs to test:"
echo "✅ Character Creation: http://localhost:3000/characters/create"
echo "✅ Story Creation: http://localhost:3000/stories/create"
echo "✅ Dashboard: http://localhost:3000/dashboard"

echo ""
echo "🎯 Expected Results:"
echo "- Character form should show child profile dropdown"
echo "- Story form should show child profiles and characters"
echo "- Both forms should be fully functional"

echo ""
echo "If forms are still empty:"
echo "1. Check browser console for errors"
echo "2. Verify you're logged in with carlos.rodriguez.jj@gmail.com"
echo "3. Try refreshing the page"
