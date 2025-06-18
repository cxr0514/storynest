#!/bin/bash

echo "🧪 Testing StoryNest API Endpoints"
echo "=================================="

# Test the basic endpoints to see if they respond
echo ""
echo "1. Testing Child Profiles API..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/api/child-profiles

echo ""
echo "2. Testing Characters API..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/api/characters

echo ""
echo "3. Testing Stories API..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/api/stories

echo ""
echo "4. Testing Recommendations API..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3001/api/recommendations?childProfileId=test"

echo ""
echo "Note: 401 Unauthorized is expected since we're not authenticated"
echo "500 Internal Server Error would indicate a schema issue"
echo "✅ Test complete!"
