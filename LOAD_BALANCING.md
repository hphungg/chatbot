# Load Balancing Setup Guide

## 📋 Overview

Your chatbot application now includes a comprehensive load balancing setup that distributes traffic across multiple application instances for improved performance, reliability, and scalability.

## 🏗️ Architecture

```
Internet
   ↓
[Nginx Load Balancer]
   ↓
┌──────────────────────┐
│  Load Balancing      │
│  - Algorithm: least_conn
│  - Health checks
│  - Failover
└──────────────────────┘
   ↓
┌─────────────┬─────────────┬─────────────┐
│   App 1     │   App 2     │   App 3     │
│  (Next.js)  │  (Next.js)  │  (Next.js)  │
└─────────────┴─────────────┴─────────────┘
   ↓
[MongoDB Atlas Database]
```

## ✨ Key Features

### 1. **Load Balancing Algorithm: Least Connections**
   - Distributes requests to the server with the fewest active connections
   - Ideal for applications with varying request processing times
   - Better than round-robin for API-heavy workloads

### 2. **Health Checks**
   - **Docker-level**: Each container has built-in health checks
   - **Nginx-level**: `max_fails=3` with `fail_timeout=30s`
   - Automatic removal of unhealthy instances from the pool
   - Health endpoint: `/health`

### 3. **Automatic Failover**
   - `proxy_next_upstream` on errors (502, 503, 504)
   - Maximum 3 retry attempts per request
   - 30-second timeout for upstream retries
   - Seamless traffic routing to healthy instances

### 4. **Connection Management**
   - 64 keepalive connections per worker
   - Connection pooling for better performance
   - 20 concurrent connections per IP limit
   - HTTP/1.1 with keepalive optimization

### 5. **Rate Limiting**
   - General traffic: 10 requests/second (burst: 20)
   - API endpoints: 30 requests/second (burst: 50)
   - Per-IP connection limits

### 6. **Resource Management**
   - CPU limits: 1 core per app instance
   - Memory limits: 1GB per app instance
   - Reserved resources: 0.5 CPU, 512MB RAM

## 🚀 Deployment

### Basic Deployment (3 Replicas)
```bash
./deploy.sh
```

### Custom Number of Replicas
```bash
./deploy.sh --replicas 5
# or
./deploy.sh --scale 5
```

### Development Mode (Single Instance)
```bash
./deploy.sh --dev
```

### Using Docker Compose Directly

#### Production with scaling:
```bash
# Deploy with 3 replicas (default)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --scale app=3

# Deploy with 5 replicas
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --scale app=5
```

#### Scale existing deployment:
```bash
# Scale up to 7 instances
docker compose up -d --scale app=7 --no-recreate

# Scale down to 2 instances
docker compose up -d --scale app=2 --no-recreate
```

## 📊 Monitoring

### Check Service Status
```bash
# View all containers
docker compose ps

# View only app containers
docker compose ps app

# Get detailed info about app instances
docker ps --filter "name=chatbot-app" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### View Logs
```bash
# All services
docker compose logs -f

# Only app instances
docker compose logs -f app

# Only nginx
docker compose logs -f nginx

# Last 100 lines
docker compose logs --tail=100
```

### Health Check Monitoring
```bash
# Check health status of all app containers
docker ps --filter "name=chatbot-app" --format "{{.Names}}: {{.Status}}"

# Test health endpoint directly
curl http://localhost/health
curl https://digiz.tech/health
```

### Nginx Access Logs
```bash
# Real-time monitoring
tail -f nginx/logs/access.log

# View error logs
tail -f nginx/logs/error.log

# Analyze traffic distribution (requires logs)
awk '{print $11}' nginx/logs/access.log | sort | uniq -c
```

## 🔧 Configuration Files

### 1. `nginx/nginx.conf`
Key load balancing configuration:
```nginx
upstream nextjs_app {
    least_conn;  # Load balancing algorithm
    
    server app:3000 max_fails=3 fail_timeout=30s weight=1;
    
    keepalive 64;
    keepalive_requests 100;
    keepalive_timeout 60s;
}
```

### 2. `docker-compose.yml`
Base configuration with health checks:
```yaml
app:
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

### 3. `docker-compose.prod.yml`
Production scaling configuration:
```yaml
app:
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '1'
        memory: 1G
```

## 📈 Performance Tuning

### Adjust Number of Replicas Based on Load

| Traffic Level | Recommended Replicas | Server CPU | Server RAM | Estimated Cost |
|--------------|---------------------|------------|------------|----------------|
| Low (< 100 req/min) | 2-3 | 2-4 cores | 4GB | $25-50/mo |
| Medium (100-500 req/min) | 3-5 | 4-6 cores | 8GB | $50-100/mo |
| High (500-1000 req/min) | 5-8 | 6-8 cores | 12-16GB | $100-250/mo |
| Very High (> 1000 req/min) | 8+ | 12+ cores | 24GB+ | $250+/mo |

**📖 Detailed server requirements:** See [SERVER_REQUIREMENTS.md](SERVER_REQUIREMENTS.md) for complete specifications, cloud provider recommendations, and cost estimates.

### Change Load Balancing Algorithm

Edit `nginx/nginx.conf`:

```nginx
upstream nextjs_app {
    # Choose one:
    
    # least_conn;           # Least connections (current, recommended)
    # ip_hash;              # Session persistence based on IP
    # random two least_conn; # Random selection from 2 least loaded
    # hash $request_uri;     # Route by URL (for caching)
    
    server app:3000 max_fails=3 fail_timeout=30s weight=1;
}
```

### Adjust Rate Limits

Edit `nginx/nginx.conf`:

```nginx
# Increase rate limits for higher traffic
limit_req_zone $binary_remote_addr zone=general:10m rate=50r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
```

## 🐛 Troubleshooting

### Issue: Containers not starting
```bash
# Check logs
docker compose logs app

# Check resource usage
docker stats

# Verify health check endpoint
docker compose exec app wget -O- http://localhost:3000/health
```

### Issue: Uneven load distribution
```bash
# Check Nginx logs for upstream selection
tail -f nginx/logs/access.log | grep upstream

# Verify all containers are healthy
docker compose ps app
```

### Issue: High memory usage
```bash
# Check memory per container
docker stats --no-stream

# Scale down if needed
docker compose up -d --scale app=2 --no-recreate
```

### Issue: Requests failing during scaling
This is expected during scaling operations. Nginx will automatically detect new instances within 30 seconds (health check interval).

## 🔄 Rolling Updates

For zero-downtime deployments:

```bash
# Scale up with new version
docker compose up -d --scale app=6 --build --no-recreate

# Wait for new instances to be healthy (30-60 seconds)
sleep 60

# Scale down old instances
docker compose up -d --scale app=3 --no-recreate
```

## 📝 Environment Variables

Add to `.env.production`:

```bash
# Number of app replicas (default: 3)
APP_REPLICAS=3
```

## 🎯 Best Practices

1. **Always run at least 2 replicas** for high availability
2. **Monitor resource usage** regularly with `docker stats`
3. **Test health endpoints** before deploying
4. **Scale gradually** - don't jump from 2 to 10 instances immediately
5. **Monitor logs** during scaling operations
6. **Set up alerts** for container failures
7. **Use production config** (`docker-compose.prod.yml`) for production deployments
8. **Keep resource limits** appropriate for your server capacity

## 🔐 Security Considerations

- Rate limiting protects against DDoS attacks
- Connection limits prevent resource exhaustion
- Health checks prevent routing to compromised instances
- Each container runs as non-root user
- SSL/TLS termination at Nginx level

## 📚 Additional Resources

- [Nginx Load Balancing Docs](https://nginx.org/en/docs/http/load_balancing.html)
- [Docker Compose Scaling](https://docs.docker.com/compose/production/)
- [Docker Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)

## 🆘 Support Commands

```bash
# Quick status check
docker compose ps && docker stats --no-stream

# View upstream status (requires stub_status module)
curl http://localhost/nginx_status

# Test load balancing manually
for i in {1..10}; do curl -s http://localhost/api/health; done

# Check which container handled request (add to app)
curl -v http://localhost/ 2>&1 | grep -i hostname
```

---

**Last Updated**: October 17, 2025
**Version**: 1.0

