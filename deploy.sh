#!/bin/bash

# Deployment script for Chatbot application with Load Balancing
# This script automates the deployment process with scaling support

set -e  # Exit on error

echo "🚀 Starting deployment process with load balancing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
APP_REPLICAS=${APP_REPLICAS:-3}
PRODUCTION_MODE=${PRODUCTION_MODE:-true}

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

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --replicas)
            APP_REPLICAS="$2"
            shift 2
            ;;
        --dev)
            PRODUCTION_MODE=false
            shift
            ;;
        --scale)
            APP_REPLICAS="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --replicas N    Number of app replicas (default: 3)"
            echo "  --scale N       Same as --replicas"
            echo "  --dev           Run in development mode (single instance)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_header "Configuration"
echo "  APP_REPLICAS: $APP_REPLICAS"
echo "  PRODUCTION_MODE: $PRODUCTION_MODE"
echo ""

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

print_header "Stopping Existing Services"
# Stop existing containers
print_info "Stopping existing containers..."
docker compose down

print_header "Build and Deploy"

if [ "$PRODUCTION_MODE" = true ]; then
    print_info "Deploying in PRODUCTION mode with $APP_REPLICAS replicas..."
    export APP_REPLICAS=$APP_REPLICAS
    
    # Build and start with production config
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --scale app=$APP_REPLICAS
else
    print_info "Deploying in DEVELOPMENT mode (single instance)..."
    docker compose --env-file .env.production up -d --build
fi

# Wait for services to be healthy
print_header "Health Checks"
print_info "Waiting for services to be healthy..."
sleep 15

# Function to check service health
check_health() {
    local service=$1
    local container_count=$(docker compose ps -q $service | wc -l)
    local healthy_count=$(docker compose ps $service | grep -c "Up" || true)
    
    echo "  $service: $healthy_count/$container_count containers healthy"
    
    if [ "$healthy_count" -eq 0 ]; then
        return 1
    fi
    return 0
}

# Check all services
all_healthy=true
if ! check_health "app"; then
    all_healthy=false
fi
if ! check_health "nginx"; then
    all_healthy=false
fi

if [ "$all_healthy" = false ]; then
    print_error "Some containers failed to start properly"
    print_info "Showing recent logs..."
    docker compose logs --tail=50
    exit 1
fi

print_success "All containers are running!"

print_header "Service Status"
docker compose ps

print_header "Load Balancing Info"
app_count=$(docker compose ps -q app | wc -l)
print_success "Load balancing across $app_count app instances"
echo ""
echo "  Nginx upstream: nextjs_app"
echo "  Algorithm: least_conn (least connections)"
echo "  Health checks: enabled (max_fails=3, fail_timeout=30s)"
echo "  Failover: automatic (proxy_next_upstream)"
echo ""

print_header "Access Information"
echo "Access your application at:"
echo "  - HTTP:  http://digiz.tech"
echo "  - HTTPS: https://digiz.tech"
echo ""

print_header "Useful Commands"
echo "  View logs (all):       docker compose logs -f"
echo "  View logs (app):       docker compose logs -f app"
echo "  View logs (nginx):     docker compose logs -f nginx"
echo "  Scale up/down:         docker compose up -d --scale app=5"
echo "  Stop containers:       docker compose down"
echo "  Restart service:       docker compose restart app"
echo "  View status:           docker compose ps"
echo "  Check health:          docker compose ps app"
echo ""

# Ask if user wants to see logs
read -p "Do you want to view logs now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Displaying logs (Ctrl+C to exit)..."
    docker compose logs -f
fi

print_success "Deployment completed successfully!"
