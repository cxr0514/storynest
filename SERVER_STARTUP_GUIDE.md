# 🚀 StoryNest Server Startup Troubleshooting Guide

## Current Issue: Blank Page / Server Not Starting

### ✅ Step-by-Step Manual Fix

Open your terminal and run these commands **one by one**:

#### 1. Navigate to Project Directory
```zsh
cd "/Users/CXR0514/Library/CloudStorage/OneDrive-TheHomeDepot/Documents 1/GitHub/storynest"
```

#### 2. Check Project Status
```zsh
# Check if you're in the right place
ls package.json

# Check Node.js version
node --version
npm --version
```

#### 3. Kill Any Existing Processes
```zsh
# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes on port 3000"

# Alternative: kill all Node processes
pkill -f "node" 2>/dev/null || echo "No Node processes found"
```

#### 4. Install Dependencies (if needed)
```zsh
# Check if node_modules exists
ls node_modules

# If missing, install dependencies
npm install
```

#### 5. Set Up Database
```zsh
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Alternative: push schema
npx prisma db push
```

#### 6. Create Sample Data
```zsh
# Create sample data for the authenticated user
node create-auth-data-final.js

# Check if data was created
node check-state.js
```

#### 7. Clear Cache and Start Server
```zsh
# Clear Next.js cache
rm -rf .next

# Start the development server
npm run dev
```

### 🎯 Expected Output

When the server starts successfully, you should see:
```
▲ Next.js 15.3.3
- Local:        http://localhost:3000
- Turbopack:    Enabled (experimental)

✓ Starting...
✓ Ready in [time]ms
```

### 🔧 Alternative Quick Start Scripts

You can also use the scripts I created:

#### Option 1: Full Setup Script
```zsh
chmod +x start-server.sh
./start-server.sh
```

#### Option 2: Debug Script
```zsh
chmod +x debug-and-start.sh
./debug-and-start.sh
```

#### Option 3: Quick Diagnostic
```zsh
node quick-diagnostic.js
```

### 🐛 Common Issues & Solutions

#### Issue: "Cannot find module" errors
**Solution:**
```zsh
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Database connection errors
**Solution:**
```zsh
# For PostgreSQL (if you have it installed)
createdb storynest

# For SQLite (simpler for development)
# Edit .env.local and change DATABASE_URL to:
# DATABASE_URL="file:./dev.db"
```

#### Issue: Port 3000 already in use
**Solution:**
```zsh
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001
```

#### Issue: Prisma errors
**Solution:**
```zsh
npx prisma migrate reset
npx prisma generate
npx prisma db push
```

### 🎯 Test URLs After Server Starts

Once you see "Ready in [time]ms", visit:
- **Main App**: http://localhost:3000
- **Story Creation**: http://localhost:3000/stories/create
- **Dashboard**: http://localhost:3000/dashboard

### 📞 If Nothing Works

Try this minimal approach:
```zsh
cd "/Users/CXR0514/Library/CloudStorage/OneDrive-TheHomeDepot/Documents 1/GitHub/storynest"
npm install --force
rm -rf .next
npx prisma generate
npm run dev -- --port 3001
```

Then visit: http://localhost:3001

The story creation form should now show:
- ✅ Child profile "Emma (age 6)"
- ✅ Characters "Luna the Unicorn" and "Benny the Bear"
- ✅ All story themes available
