# Deployment Guide - Chatbot with Load Balancing

This guide covers deploying your chatbot application with full load balancing capabilities.

## 🚀 Quick Start

### 1. Prerequisites
- Docker & Docker Compose installed
- Domain name configured (digiz.tech)
- SSL certificates set up (see `setup-ssl.sh`)
- `.env.production` file configured

### 2. Deploy with Load Balancing

```bash
# Deploy with default settings (3 replicas)
./deploy.sh

# Deploy with custom number of replicas
./deploy.sh --replicas 5

# Deploy in development mode (single instance)
./deploy.sh --dev
```

### 3. Monitor Your Deployment

```bash
# Run monitoring script
./monitor.sh

# Check service status
docker compose ps

# View logs
docker compose logs -f app
```

## 📝 Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/chatbot

# Authentication
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=https://digiz.tech

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# OpenAI
OPENAI_API_KEY=sk-your-key

# Email (Optional)
RESEND_API_KEY=your-key
RESEND_FROM_EMAIL=noreply@digiz.tech
INVITE_EMAIL_FROM=team@digiz.tech

# Admin
ADMIN_EMAIL=admin@digiz.tech
ADMIN_PASSWORD=secure-password
ADMIN_NAME=Administrator

# Application
APP_URL=https://digiz.tech
NODE_ENV=production

# Load Balancing (NEW!)
APP_REPLICAS=3  # Number of app instances
```

## 🎯 Load Balancing Features

### Automatic Features
✅ **Load Distribution**: Requests distributed across multiple app instances  
✅ **Health Checks**: Automatic detection and removal of unhealthy instances  
✅ **Failover**: Automatic retry to healthy instances on failure  
✅ **Connection Pooling**: Efficient connection reuse  
✅ **Rate Limiting**: Protection against traffic spikes  
✅ **Resource Limits**: Prevents resource exhaustion  

### Configuration
- **Algorithm**: Least Connections (`least_conn`)
- **Default Replicas**: 3 app instances
- **Health Check Interval**: 30 seconds
- **Failover Retries**: Up to 3 attempts
- **Max Fails Before Removal**: 3 failures in 30 seconds

## 📊 Scaling Operations

### Scale Up
```bash
# Add more instances on the fly
docker compose up -d --scale app=5 --no-recreate
```

### Scale Down
```bash
# Reduce instances
docker compose up -d --scale app=2 --no-recreate
```

### Production Deployment
```bash
# Deploy with production configuration
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --scale app=3
```

## 🔍 Monitoring

### Service Status
```bash
# Check all services
docker compose ps

# Check only app instances
docker compose ps app

# View resource usage
docker stats
```

### Logs
```bash
# All logs
docker compose logs -f

# App logs only
docker compose logs -f app

# Nginx logs
docker compose logs -f nginx
tail -f nginx/logs/access.log
```

### Health Checks
```bash
# Check application health
curl http://localhost/health
curl https://digiz.tech/health

# Check container health
docker inspect --format='{{.State.Health.Status}}' <container-id>
```

## 🔄 Deployment Strategies

### Zero-Downtime Updates

1. **Scale up with new version**:
   ```bash
   docker compose up -d --scale app=6 --build
   ```

2. **Wait for health checks** (30-60 seconds):
   ```bash
   ./monitor.sh
   ```

3. **Scale down old instances**:
   ```bash
   docker compose up -d --scale app=3 --no-recreate
   ```

### Rollback
```bash
# Stop current deployment
docker compose down

# Rebuild previous version
git checkout <previous-commit>
./deploy.sh --replicas 3
```

## 🛠️ Troubleshooting

### Problem: Containers won't start
```bash
# Check logs
docker compose logs app

# Check resource availability
docker stats
df -h

# Verify health endpoint
docker compose exec app wget -O- http://localhost:3000/health
```

### Problem: Uneven load distribution
```bash
# Check nginx upstream status
docker compose logs nginx | grep upstream

# Verify all containers are healthy
docker compose ps app

# Check nginx configuration
docker compose exec nginx nginx -t
```

### Problem: High CPU/Memory usage
```bash
# Check resource usage per container
docker stats

# Scale down if needed
docker compose up -d --scale app=2 --no-recreate

# Increase resource limits in docker-compose.prod.yml
```

### Problem: Health checks failing
```bash
# Test health endpoint directly
docker compose exec app wget -O- http://localhost:3000/health

# Check app logs for errors
docker compose logs --tail=100 app

# Restart unhealthy instances
docker compose restart app
```

## 📈 Performance Recommendations

### Based on Traffic

| Traffic Level | Replicas | Server CPU | Server RAM | Monthly Cost |
|--------------|----------|------------|------------|--------------|
| Low (< 100 req/min) | 2-3 | 2-4 cores | 4GB | $25-50 |
| Medium (100-500 req/min) | 3-5 | 4-6 cores | 8GB | $50-100 |
| High (500-1000 req/min) | 5-8 | 6-8 cores | 12-16GB | $100-250 |
| Very High (> 1000 req/min) | 8+ | 12+ cores | 24GB+ | $250+ |

**💡 Need help choosing server specs?** See [SERVER_REQUIREMENTS.md](SERVER_REQUIREMENTS.md) for:
- Detailed hardware requirements
- Cloud provider comparisons (DigitalOcean, AWS, GCP)
- Cost estimates and optimization tips
- Step-by-step calculation examples

### Optimization Tips

1. **Start with 3 replicas** and monitor performance
2. **Scale gradually** - increase by 1-2 instances at a time
3. **Monitor resource usage** with `docker stats`
4. **Use production config** for better resource management
5. **Enable logging** to analyze traffic patterns
6. **Set up alerts** for container failures

## 🔐 Security

- ✅ SSL/TLS encryption (Let's Encrypt)
- ✅ Rate limiting (10 req/s general, 30 req/s API)
- ✅ Connection limits (20 per IP)
- ✅ Security headers enabled
- ✅ Non-root user in containers
- ✅ Resource limits to prevent DoS
- ✅ Automatic failover for compromised instances

## 📚 Additional Documentation

- [LOAD_BALANCING.md](LOAD_BALANCING.md) - Detailed load balancing guide
- [README.md](README.md) - Project overview
- [docker-compose.yml](docker-compose.yml) - Base configuration
- [docker-compose.prod.yml](docker-compose.prod.yml) - Production settings
- [nginx/nginx.conf](nginx/nginx.conf) - Nginx configuration

## 🆘 Support Commands

```bash
# Full deployment status
docker compose ps && docker stats --no-stream

# Quick health check
curl -s http://localhost/health

# Test load balancing (run multiple times)
for i in {1..10}; do curl -s http://localhost/api/health; done

# View all app container IPs
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker compose ps -q app)

# Restart everything
docker compose restart

# Clean restart (rebuild)
docker compose down && ./deploy.sh
```

## 📞 Getting Help

If you encounter issues:

1. Run `./monitor.sh` to check system status
2. Check logs: `docker compose logs --tail=100`
3. Verify configuration: `docker compose config`
4. Test health endpoints: `curl http://localhost/health`
5. Review [LOAD_BALANCING.md](LOAD_BALANCING.md) for detailed troubleshooting

---

**Last Updated**: October 17, 2025  
**Version**: 1.0 with Load Balancing

