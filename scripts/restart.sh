#!/bin/bash

# 02 Blog Platform - Restart Script
# This script restarts all Docker services

set -e

echo "🔄 Restarting 02 Blog Platform..."

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

echo "🛑 Stopping all services..."
$DOCKER_COMPOSE down

echo "🧹 Cleaning up containers..."
$DOCKER_COMPOSE down --remove-orphans

echo "⏳ Waiting 5 seconds before restarting..."
sleep 5

echo "🚀 Starting all services..."
$DOCKER_COMPOSE up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
$DOCKER_COMPOSE ps

# Wait a bit more for services to fully initialize
sleep 5

echo "✅ All services restarted successfully!"
echo ""
echo "🌐 Your 02 Blog Platform is now running:"
echo "   Frontend: ${FRONTEND_URL:-http://localhost:3000}"
echo "   User Service: ${USER_SERVICE_URL:-http://localhost:3001}"
echo "   Content Service: ${CONTENT_SERVICE_URL:-http://localhost:3002}"
echo "   Media Service: ${MEDIA_SERVICE_URL:-http://localhost:3003}"
echo "   Category Service: ${CATEGORY_SERVICE_URL:-http://localhost:3004}"
echo "   Comment Service: ${COMMENT_SERVICE_URL:-http://localhost:3005}"
echo ""
echo "📝 Default login credentials:"
echo "   Admin: ${ADMIN_EMAIL:-admin@cms.com} / ${ADMIN_PASSWORD:-admin123}"
echo "   Demo: ${DEMO_EMAIL:-demo@example.com} / ${DEMO_PASSWORD:-demo123}"
echo ""
echo "🎉 Enjoy your 02 Blog Platform!"
