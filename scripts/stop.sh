#!/bin/bash

# 02 Blog Platform - Stop Script
# This script stops all Docker services

set -e

echo "🛑 Stopping 02 Blog Platform..."

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

# Stop all services
echo "📦 Stopping all services..."
$DOCKER_COMPOSE down

echo "🧹 Cleaning up containers..."
$DOCKER_COMPOSE down --remove-orphans

echo "✅ All services stopped successfully!"
echo ""
echo "🔍 Remaining containers:"
docker ps -a --filter "name=group-11" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
