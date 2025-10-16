#!/bin/bash

# 02 Blog Platform - Start Script
# This script starts all Docker services and the application

set -e

echo "🚀 Starting 02 Blog Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Use docker compose (newer) or docker-compose (older)
if command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "📦 Starting all services..."

# Start all services
$DOCKER_COMPOSE up -d

echo "⏳ Waiting for services to be ready..."

# Wait for services to be healthy
sleep 10

# Check service status
echo "🔍 Checking service status..."
$DOCKER_COMPOSE ps

# Wait a bit more for services to fully initialize
sleep 5

echo "✅ All services started successfully!"
echo ""
echo "🌐 Your 02 Blog Platform is now running:"
echo "   Frontend: http://localhost:3000"
echo "   User Service: http://localhost:3001"
echo "   Content Service: http://localhost:3002"
echo "   Media Service: http://localhost:3003"
echo "   Category Service: http://localhost:3004"
echo "   Comment Service: http://localhost:3005"
echo ""
echo "📝 Default login credentials:"
echo "   Admin: admin@cms.com / admin123"
echo "   Demo: demo@example.com / demo123"
echo ""
echo "🎉 Enjoy your 02 Blog Platform!"
