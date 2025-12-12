#!/bin/bash

# ULICA Project Development Startup Script
echo "🚀 Starting ULICA Development Environment..."

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check ports
echo "🔍 Checking port availability..."
check_port 3000
check_port 5001
check_port 5556

echo ""
echo "📋 Available commands:"
echo "1. Start Prisma Studio (Database): npx prisma studio --port 5556"
echo "2. Start Backend API: cd backend && npm start"
echo "3. Start Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5001"
echo "   Prisma Studio: http://localhost:5556"
echo ""
echo "💡 Tip: Run each command in a separate terminal window"
