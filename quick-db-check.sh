#!/bin/bash

echo "🔍 Quick Database Check"
echo "======================"

# Check if we can connect to the database
cd /Users/CXR0514/Library/CloudStorage/OneDrive-TheHomeDepot/Documents\ 1/GitHub/storynest

echo "Testing database connection..."
npx prisma db pull --schema=./prisma/schema.prisma > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo ""
echo "Checking users in database..."
npx prisma studio --browser none &
STUDIO_PID=$!
sleep 2
kill $STUDIO_PID 2>/dev/null

echo ""
echo "Creating sample data for current user..."
