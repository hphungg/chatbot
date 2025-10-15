#!/bin/bash

# Deployment script for Chatbot application
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if .env file exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    print_info "Please create .env.production file with required environment variables"
    exit 1
fi

print_success ".env.production file found"

# Create nginx directory if it doesn't exist
if [ ! -d "nginx" ]; then
    print_info "Creating nginx directory..."
    mkdir -p nginx/ssl nginx/logs
    print_success "Nginx directory created"
fi

# Check if nginx.conf exists
if [ ! -f "nginx/nginx.conf" ]; then
    print_error "nginx/nginx.conf not found!"
    print_info "Please create nginx configuration file"
    exit 1
fi

print_success "Nginx configuration found"

# Stop existing containers
print_info "Stopping existing containers..."
docker compose down

# Remove old images (optional)
read -p "Do you want to remove old images? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Removing old images..."
    docker compose down --rmi all --volumes
fi

# Build and start containers
print_info "Building and starting containers..."
docker compose --env-file .env.production up -d --build

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check if containers are running
if docker compose ps | grep -q "Up"; then
    print_success "Containers are running!"
else
    print_error "Some containers failed to start"
    docker-compose logs --tail=50
    exit 1
fi

# Display logs
print_info "Displaying logs (Ctrl+C to exit)..."
docker compose logs -f

print_success "Deployment completed successfully!"
echo ""
echo "Access your application at:"
echo "  - HTTP:  http://localhost"
echo "  - HTTPS: https://localhost (if SSL configured)"
echo ""
echo "Useful commands:"
echo "  - View logs:        docker-compose logs -f"
echo "  - Stop containers:  docker-compose down"
echo "  - Restart:          docker-compose restart"
echo "  - View status:      docker-compose ps"
