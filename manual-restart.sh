#!/bin/zsh

echo "🔄 StoryNest Server Restart Script"
echo "=================================="

# Navigate to project directory
cd "/Users/CXR0514/Library/CloudStorage/OneDrive-TheHomeDepot/Documents 1/GitHub/storynest"

echo "🛑 Stopping existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

echo "⏳ Waiting for processes to stop..."
sleep 3

echo "🗑️  Clearing Next.js cache..."
rm -rf .next

echo "🔧 Environment check..."
echo "OPENAI_API_KEY set: $([ -n "$OPENAI_API_KEY" ] && echo "✅ Yes" || echo "❌ No - check .env.local")"

echo "🚀 Starting development server..."
echo "Server will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
