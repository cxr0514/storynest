#!/bin/zsh

echo "🔧 StoryNest Server Debugging & Start Script"
echo "============================================="

# Check if we're in the right directory
echo "📁 Current directory:"
pwd

# Check if package.json exists
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found - you may be in the wrong directory"
    exit 1
fi

# Check Node.js and npm versions
echo ""
echo "🔍 Environment check:"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "⚠️  node_modules not found - installing dependencies..."
    npm install
fi

# Check for processes on port 3000
echo ""
echo "🔍 Checking port 3000:"
PORT_CHECK=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PORT_CHECK" ]; then
    echo "⚠️  Port 3000 is in use by process: $PORT_CHECK"
    echo "🛑 Killing process on port 3000..."
    kill -9 $PORT_CHECK 2>/dev/null
    sleep 2
else
    echo "✅ Port 3000 is available"
fi

# Check database and create sample data
echo ""
echo "🔍 Checking database and sample data:"
if [ -f "create-auth-data-final.js" ]; then
    echo "📊 Creating sample data for authenticated user..."
    node create-auth-data-final.js
else
    echo "⚠️  Sample data script not found"
fi

# Check if .env file exists
echo ""
echo "🔍 Environment configuration:"
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    if [ -f ".env.local" ]; then
        echo "✅ .env.local file found"
    else
        echo "⚠️  No .env file found - this might cause issues"
    fi
fi

# Try to start the server
echo ""
echo "🚀 Starting development server..."
echo "   This will start Next.js with Turbopack"
echo "   If successful, you'll see a message like:"
echo "   '▲ Next.js 15.3.3 - Local: http://localhost:3000'"
echo ""
echo "   Press Ctrl+C to stop the server when needed"
echo ""

# Start the server
npm run dev
