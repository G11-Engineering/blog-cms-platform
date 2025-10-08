# CMS Blog Platform Makefile

.PHONY: help install dev build test clean start stop restart logs health setup-demo

# Default target
help:
	@echo "CMS Blog Platform - Available Commands:"
	@echo ""
	@echo "Setup:"
	@echo "  install          Install all dependencies"
	@echo "  setup-demo       Setup demo data"
	@echo ""
	@echo "Development:"
	@echo "  dev              Start development environment"
	@echo "  start            Start all services with Docker"
	@echo "  stop             Stop all services"
	@echo "  restart          Restart all services"
	@echo ""
	@echo "Building:"
	@echo "  build            Build all services"
	@echo "  build-frontend   Build frontend only"
	@echo "  build-services   Build all microservices"
	@echo ""
	@echo "Testing:"
	@echo "  test             Run all tests"
	@echo "  test-frontend    Run frontend tests"
	@echo "  test-services    Run service tests"
	@echo "  health           Check service health"
	@echo ""
	@echo "Utilities:"
	@echo "  logs             Show all service logs"
	@echo "  logs-frontend    Show frontend logs"
	@echo "  logs-user        Show user service logs"
	@echo "  clean            Clean up Docker resources"
	@echo "  reset            Reset all data and restart"

# Installation
install:
	@echo "Installing all dependencies..."
	npm run install:all

# Development
dev:
	@echo "Starting development environment..."
	docker-compose up -d
	@echo "Waiting for services to start..."
	sleep 10
	npm run dev:frontend

# Docker commands
start:
	@echo "Starting all services..."
	docker-compose up -d

stop:
	@echo "Stopping all services..."
	docker-compose down

restart:
	@echo "Restarting all services..."
	docker-compose restart

# Building
build:
	@echo "Building all services..."
	npm run build

build-frontend:
	@echo "Building frontend..."
	npm run build:frontend

build-services:
	@echo "Building all microservices..."
	npm run build:services

# Testing
test:
	@echo "Running all tests..."
	npm run test

test-frontend:
	@echo "Running frontend tests..."
	npm run test:frontend

test-services:
	@echo "Running service tests..."
	npm run test:services

health:
	@echo "Checking service health..."
	npm run health

# Logs
logs:
	@echo "Showing all service logs..."
	docker-compose logs -f

logs-frontend:
	@echo "Showing frontend logs..."
	docker-compose logs -f frontend

logs-user:
	@echo "Showing user service logs..."
	docker-compose logs -f user-service

logs-content:
	@echo "Showing content service logs..."
	docker-compose logs -f content-service

logs-media:
	@echo "Showing media service logs..."
	docker-compose logs -f media-service

logs-category:
	@echo "Showing category service logs..."
	docker-compose logs -f category-service

logs-comment:
	@echo "Showing comment service logs..."
	docker-compose logs -f comment-service

# Setup
setup-demo:
	@echo "Setting up demo data..."
	npm run setup:demo

# Cleanup
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f

reset:
	@echo "Resetting all data and restarting..."
	docker-compose down -v
	docker-compose up -d
	@echo "Waiting for services to start..."
	sleep 15
	npm run setup:demo

# Quick start for new users
quickstart: install start setup-demo
	@echo ""
	@echo "🎉 CMS Blog Platform is ready!"
	@echo ""
	@echo "📋 Next steps:"
	@echo "1. Visit http://localhost:3000"
	@echo "2. Login with admin@cms.com / admin123"
	@echo "3. Start creating content!"
	@echo ""
	@echo "📚 For more commands, run: make help"
