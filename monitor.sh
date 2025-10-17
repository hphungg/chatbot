#!/bin/bash

# Monitoring script for load-balanced chatbot application
# This script provides real-time monitoring of your deployment

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Clear screen
clear

print_header "Chatbot Application - Load Balancing Monitor"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running!"
    exit 1
fi

# 1. Service Status
print_header "1. Service Status"
echo ""

app_containers=$(docker compose ps -q app 2>/dev/null | wc -l)
nginx_containers=$(docker compose ps -q nginx 2>/dev/null | wc -l)

if [ "$app_containers" -eq 0 ]; then
    print_error "No app containers running!"
else
    print_success "$app_containers app container(s) found"
fi

if [ "$nginx_containers" -eq 0 ]; then
    print_error "No nginx container running!"
else
    print_success "$nginx_containers nginx container found"
fi

echo ""
docker compose ps
echo ""

# 2. Health Status
print_header "2. Container Health Status"
echo ""

app_healthy=0
app_unhealthy=0

# Check each app container
for container in $(docker compose ps -q app 2>/dev/null); do
    container_name=$(docker inspect --format='{{.Name}}' $container | sed 's/\///')
    health_status=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "no-healthcheck")
    status=$(docker inspect --format='{{.State.Status}}' $container)
    
    if [ "$status" = "running" ]; then
        if [ "$health_status" = "healthy" ] || [ "$health_status" = "no-healthcheck" ]; then
            print_success "$container_name: running, health: ${health_status}"
            ((app_healthy++))
        else
            print_warning "$container_name: running, health: ${health_status}"
            ((app_unhealthy++))
        fi
    else
        print_error "$container_name: $status"
        ((app_unhealthy++))
    fi
done

echo ""
echo "Summary: $app_healthy healthy, $app_unhealthy unhealthy/unknown"
echo ""

# 3. Resource Usage
print_header "3. Resource Usage"
echo ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep -E "NAME|chatbot"
echo ""

# 4. Load Distribution (from nginx logs if available)
print_header "4. Recent Traffic (Last 100 requests)"
echo ""

if [ -f "nginx/logs/access.log" ]; then
    total_requests=$(tail -n 100 nginx/logs/access.log 2>/dev/null | wc -l)
    
    if [ "$total_requests" -gt 0 ]; then
        echo "Total requests analyzed: $total_requests"
        echo ""
        echo "Status Code Distribution:"
        tail -n 100 nginx/logs/access.log | awk '{print $9}' | sort | uniq -c | sort -rn
        echo ""
        
        echo "Top 5 Request Paths:"
        tail -n 100 nginx/logs/access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -5
    else
        print_info "No recent traffic in logs"
    fi
else
    print_warning "Nginx access log not found at nginx/logs/access.log"
fi

echo ""

# 5. Error Logs
print_header "5. Recent Errors (Last 10)"
echo ""

if [ -f "nginx/logs/error.log" ]; then
    error_count=$(tail -n 100 nginx/logs/error.log 2>/dev/null | wc -l)
    
    if [ "$error_count" -gt 0 ]; then
        print_warning "Found $error_count errors in last 100 log lines"
        echo ""
        tail -n 10 nginx/logs/error.log
    else
        print_success "No errors found in nginx logs"
    fi
else
    print_info "Nginx error log not found at nginx/logs/error.log"
fi

echo ""

# 6. Load Balancing Configuration
print_header "6. Load Balancing Configuration"
echo ""

echo "Current Nginx Upstream Configuration:"
if [ -f "nginx/nginx.conf" ]; then
    echo ""
    grep -A 10 "upstream nextjs_app" nginx/nginx.conf | grep -v "^$"
    echo ""
else
    print_warning "nginx.conf not found"
fi

# 7. Quick Commands Reference
print_header "7. Quick Commands"
echo ""
echo "  Scale up:          docker compose up -d --scale app=5 --no-recreate"
echo "  Scale down:        docker compose up -d --scale app=2 --no-recreate"
echo "  View logs:         docker compose logs -f app"
echo "  Restart app:       docker compose restart app"
echo "  Check health:      curl http://localhost/health"
echo "  Full status:       docker compose ps"
echo ""

# 8. Recommendations
print_header "8. Recommendations"
echo ""

# Check if only 1 replica is running
if [ "$app_containers" -eq 1 ]; then
    print_warning "Running with only 1 replica - consider scaling up for better availability"
    echo "           Run: docker compose up -d --scale app=3 --no-recreate"
fi

# Check memory usage
high_mem_count=$(docker stats --no-stream --format "{{.MemPerc}}" | grep -E "[8-9][0-9]\.[0-9]|100" | wc -l)
if [ "$high_mem_count" -gt 0 ]; then
    print_warning "Some containers are using high memory (>80%)"
    echo "           Consider scaling down or increasing memory limits"
fi

# Check if unhealthy containers exist
if [ "$app_unhealthy" -gt 0 ]; then
    print_error "Unhealthy containers detected - investigate logs immediately"
    echo "           Run: docker compose logs --tail=50 app"
fi

if [ "$app_healthy" -gt 0 ] && [ "$app_unhealthy" -eq 0 ]; then
    print_success "All systems operational!"
fi

echo ""
print_header "Monitoring Complete"
echo ""

# Ask for continuous monitoring
read -p "Do you want to enable continuous monitoring (updates every 5s)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    while true; do
        sleep 5
        clear
        $0 --no-prompt
    done
fi

