# ULICA E-commerce Deployment Guide

This guide covers deploying the ULICA e-commerce platform to production using various cloud providers and deployment strategies.

## 🚀 Quick Start (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Domain name configured
- SSL certificates (Let's Encrypt recommended)

### 1. Environment Setup

1. Copy the environment template:
```bash
cp env.example .env.production
```

2. Update `.env.production` with your production values:
```env
# Database
DATABASE_URL=postgresql://username:password@postgres:5432/ulica_prod

# Redis
REDIS_URL=redis://redis:6379

# Razorpay (Production keys)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Shiprocket (Production credentials)
SHIPROCKET_EMAIL=your_production_email
SHIPROCKET_PASSWORD=your_production_password

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=ulica-media-prod
AWS_REGION=ap-south-1

# Security
JWT_SECRET=your_very_secure_jwt_secret_32_chars_min
JWT_REFRESH_SECRET=your_very_secure_refresh_secret_32_chars_min

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. SSL Certificates

Generate SSL certificates using Let's Encrypt:
```bash
# Install certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem
sudo chown $USER:$USER ./ssl/*
```

### 3. Deploy with Docker Compose

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:seed

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## ☁️ Cloud Deployment Options

### AWS Deployment

#### Option 1: EC2 with Docker

1. **Launch EC2 Instance**
   - Instance type: t3.medium or larger
   - OS: Ubuntu 20.04 LTS
   - Security groups: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Setup Server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone <your-repo-url>
cd ulica-ecommerce
```

3. **Configure Environment and Deploy**
```bash
# Setup environment
cp env.example .env.production
# Edit .env.production with your values

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 2: AWS ECS with Fargate

1. **Create ECS Cluster**
```bash
aws ecs create-cluster --cluster-name ulica-cluster
```

2. **Build and Push Images**
```bash
# Build images
docker build -t your-account.dkr.ecr.region.amazonaws.com/ulica-frontend ./frontend
docker build -t your-account.dkr.ecr.region.amazonaws.com/ulica-backend ./backend

# Push to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin your-account.dkr.ecr.region.amazonaws.com
docker push your-account.dkr.ecr.region.amazonaws.com/ulica-frontend
docker push your-account.dkr.ecr.region.amazonaws.com/ulica-backend
```

3. **Create Task Definitions and Services**
   - Use AWS Console or CloudFormation
   - Configure load balancer, auto-scaling, and service discovery

### Google Cloud Platform

#### Cloud Run Deployment

1. **Build Images**
```bash
# Frontend
gcloud builds submit --tag gcr.io/your-project/ulica-frontend ./frontend

# Backend
gcloud builds submit --tag gcr.io/your-project/ulica-backend ./backend
```

2. **Deploy Services**
```bash
# Deploy frontend
gcloud run deploy ulica-frontend \
  --image gcr.io/your-project/ulica-frontend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated

# Deploy backend
gcloud run deploy ulica-backend \
  --image gcr.io/your-project/ulica-backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

3. **Setup Cloud SQL and Redis**
   - Create Cloud SQL PostgreSQL instance
   - Create Memorystore Redis instance
   - Update connection strings

### DigitalOcean

#### App Platform Deployment

1. **Create App Spec**
```yaml
# .do/app.yaml
name: ulica-ecommerce
services:
- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/ulica-ecommerce
    branch: main
    deploy_on_push: true
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  envs:
  - key: NODE_ENV
    value: production

- name: backend
  source_dir: /backend
  github:
    repo: your-username/ulica-ecommerce
    branch: main
    deploy_on_push: true
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /api
  envs:
  - key: NODE_ENV
    value: production
```

2. **Deploy**
```bash
doctl apps create --spec .do/app.yaml
```

## 🔧 Production Optimizations

### Database Optimizations

1. **Connection Pooling**
```typescript
// In backend/src/prisma/client.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=20&pool_timeout=20"
    }
  }
});
```

2. **Indexes**
```sql
-- Add to migration
CREATE INDEX CONCURRENTLY idx_products_status ON products(status);
CREATE INDEX CONCURRENTLY idx_products_featured ON products(featured);
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
```

### Performance Optimizations

1. **Redis Caching**
```typescript
// Add to backend
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache product data
const cacheProduct = async (productId: string, data: any) => {
  await redis.setex(`product:${productId}`, 3600, JSON.stringify(data));
};
```

2. **CDN Setup**
   - Configure CloudFlare or AWS CloudFront
   - Cache static assets and API responses
   - Enable compression and minification

### Monitoring and Logging

1. **Application Monitoring**
```typescript
// Add to backend
import { createPrometheusMetrics } from 'express-prometheus-middleware';

app.use(createPrometheusMetrics({
  collectDefaultMetrics: true,
}));
```

2. **Error Tracking**
```typescript
// Add Sentry
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🔐 Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF protection implemented
- [ ] Security headers configured
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting setup

## 📊 Monitoring Setup

### Health Checks
```bash
# Backend health
curl https://api.yourdomain.com/health

# Frontend health
curl https://yourdomain.com/api/health
```

### Log Monitoring
```bash
# Docker logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Application logs
tail -f /var/log/ulica/application.log
```

### Database Monitoring
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 🔄 Backup Strategy

### Database Backups
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### File Backups
```bash
# S3 sync for uploaded files
aws s3 sync /uploads s3://ulica-backups/uploads --delete
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
```bash
# Check database connectivity
docker-compose exec backend npx prisma db pull
```

2. **Memory Issues**
```bash
# Monitor memory usage
docker stats
```

3. **SSL Certificate Issues**
```bash
# Renew certificates
sudo certbot renew --dry-run
```

### Performance Issues

1. **Slow API Responses**
   - Check database query performance
   - Enable Redis caching
   - Optimize images and assets

2. **High Memory Usage**
   - Monitor for memory leaks
   - Implement connection pooling
   - Optimize database queries

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancers (AWS ALB, Nginx)
- Implement database read replicas
- Use Redis clustering
- Implement CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize database configuration
- Implement caching strategies
- Use database connection pooling

### Auto-scaling
- Configure auto-scaling groups
- Set up monitoring and alerts
- Implement health checks
- Use container orchestration (Kubernetes)

## 🔧 Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review and rotate secrets
- [ ] Monitor disk space and memory
- [ ] Check SSL certificate expiration
- [ ] Review security logs
- [ ] Update database statistics
- [ ] Clean up old backups
- [ ] Performance optimization review

### Emergency Procedures
1. **Service Outage**
   - Check service status
   - Review logs for errors
   - Restart services if needed
   - Escalate to team if unresolved

2. **Database Issues**
   - Check database connectivity
   - Review slow queries
   - Restart database service
   - Restore from backup if needed

3. **Security Incident**
   - Isolate affected services
   - Review access logs
   - Rotate compromised credentials
   - Update security measures
