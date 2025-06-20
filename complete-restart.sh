#!/bin/zsh

echo "🔄 StoryNest Complete Server Restart"
echo "===================================="

# Navigate to project directory
cd "/Users/CXR0514/Library/CloudStorage/OneDrive-TheHomeDepot/Documents 1/GitHub/storynest"

echo "🛑 Stopping all existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

echo "⏳ Waiting for processes to stop..."
sleep 3

echo "🗑️  Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
echo "Cache cleared successfully"

echo "🔧 Checking critical files..."
echo "package.json: $([ -f package.json ] && echo "✅" || echo "❌")"
echo "globals.css: $([ -f src/app/globals.css ] && echo "✅" || echo "❌")"
echo "page.tsx: $([ -f src/app/page.tsx ] && echo "✅" || echo "❌")"
echo "layout.tsx: $([ -f src/app/layout.tsx ] && echo "✅" || echo "❌")"

echo "🔍 Environment variables..."
if [ -f .env.local ]; then
    echo "OPENAI_API_KEY: $(grep -q "OPENAI_API_KEY=sk-proj-" .env.local && echo "✅ Valid format" || echo "❌ Invalid or missing")"
    echo "DATABASE_URL: $(grep -q "DATABASE_URL=" .env.local && echo "✅" || echo "❌")"
    echo "NEXTAUTH_SECRET: $(grep -q "NEXTAUTH_SECRET=" .env.local && echo "✅" || echo "❌")"
else
    echo "❌ .env.local file not found"
fi

echo ""
echo "🚀 Starting development server..."
echo "This may take a moment to compile..."
echo ""

# Start the development server
npm run dev
