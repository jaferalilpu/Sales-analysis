#!/bin/bash

# ULICA Deployment Script
set -e

echo "🚀 Starting ULICA deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from env.example..."
    cp env.example .env
    echo "📝 Please update .env file with your configuration before continuing."
    read -p "Press Enter to continue after updating .env file..."
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend npx prisma migrate deploy

# Create admin user
echo "👤 Creating admin user..."
docker-compose exec backend node scripts/create-admin.js

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo "🗄️  Database: localhost:5432"
echo "📊 pgAdmin: http://localhost:5050 (if enabled)"
