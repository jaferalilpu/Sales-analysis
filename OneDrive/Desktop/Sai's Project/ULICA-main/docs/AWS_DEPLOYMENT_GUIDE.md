# 🚀 ULICA AWS Deployment Guide

This guide will help you deploy your ULICA Next.js e-commerce application to AWS EC2.

## 📋 Prerequisites

- AWS Account with EC2, RDS, and S3 access
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt or AWS Certificate Manager)
- Basic knowledge of AWS services

## 🏗️ AWS Infrastructure Setup

### 1. EC2 Instance Setup

**Recommended Instance Type:** `t3.medium` or `t3.large` for production

```bash
# Launch EC2 instance with Ubuntu 22.04 LTS
# Security Group Rules:
# - SSH (22): Your IP
# - HTTP (80): 0.0.0.0/0
# - HTTPS (443): 0.0.0.0/0
# - Custom (3000): 0.0.0.0/0 (for Next.js)
# - Custom (5001): 0.0.0.0/0 (for Backend API)
```

### 2. RDS PostgreSQL Database

```bash
# Create RDS PostgreSQL instance
# Engine: PostgreSQL 15.x
# Instance Class: db.t3.micro (for testing) or db.t3.small (for production)
# Storage: 20GB minimum
# Multi-AZ: Yes (for production)
# Backup Retention: 7 days
# Security Group: Allow EC2 security group on port 5432
```

### 3. S3 Bucket for File Storage

```bash
# Create S3 bucket for file uploads
# Bucket Name: ulica-production-uploads
# Region: ap-south-1 (Mumbai)
# Versioning: Enabled
# Public Access: Block all public access
# CORS Configuration: Allow your domain
```

### 4. CloudFront CDN (Optional)

```bash
# Create CloudFront distribution
# Origin: S3 bucket
# Caching: Optimized for web delivery
# Price Class: Use all edge locations
# Custom Error Pages: 404 -> /404.html
```

## 🔧 Server Setup

### 1. Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Install PostgreSQL client (for database connection testing)
sudo apt install postgresql-client -y
```

### 3. Clone and Setup Project

```bash
# Clone your repository
git clone https://github.com/your-username/ulica.git
cd ulica

# Make deployment script executable
chmod +x deploy-aws.sh

# Run deployment preparation
./deploy-aws.sh
```

## ⚙️ Environment Configuration

### 1. Create Production Environment File

```bash
# Copy and edit production environment
cp env.production .env.production
nano .env.production
```

### 2. Update Environment Variables

```bash
# Update these values in .env.production:

# Database
DATABASE_URL=postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/ulica_production

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here

# Domain URLs
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=ulica-production-uploads
AWS_S3_DOMAIN=your-s3-bucket.s3.ap-south-1.amazonaws.com

# Email Configuration
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@your-domain.com
```

## 🚀 Deployment Methods

### Method 1: Direct Deployment

```bash
# Start the application directly
./start-production.sh
```

### Method 2: PM2 Process Manager (Recommended)

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Method 3: Docker Deployment

```bash
# Build and start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🌐 Nginx Configuration

### 1. Update Nginx Configuration

```bash
# Edit nginx configuration
sudo nano /etc/nginx/sites-available/ulica

# Copy the nginx.conf content from deploy-aws.sh
# Update server_name with your domain
# Update SSL certificate paths
```

### 2. Enable Site and SSL

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ulica /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 📊 Monitoring and Logs

### 1. View Application Logs

```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### 2. Monitor Performance

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
df -h
free -h
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. SSL/TLS Configuration

```bash
# Update SSL configuration in nginx
# Use strong cipher suites
# Enable HSTS
# Set secure headers
```

### 3. Database Security

```bash
# Ensure RDS is in private subnet
# Use VPC security groups
# Enable encryption at rest
# Regular security updates
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check RDS security groups
   # Verify DATABASE_URL format
   # Test connection: psql $DATABASE_URL
   ```

2. **Port Already in Use**
   ```bash
   # Check running processes
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :5001
   
   # Kill processes if needed
   sudo kill -9 <PID>
   ```

3. **Permission Denied**
   ```bash
   # Fix file permissions
   sudo chown -R ubuntu:ubuntu /home/ubuntu/ulica
   chmod +x start-production.sh
   ```

4. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf frontend/.next backend/dist
   npm run build
   ```

## 📈 Performance Optimization

### 1. Enable Gzip Compression

```bash
# Already configured in nginx.conf
# Verify with: curl -H "Accept-Encoding: gzip" -I https://your-domain.com
```

### 2. Setup CDN

```bash
# Configure CloudFront distribution
# Update image domains in next.config.js
# Use S3 for static assets
```

### 3. Database Optimization

```bash
# Run Prisma migrations
cd backend
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 🔄 Updates and Maintenance

### 1. Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
npm run build
pm2 restart all
```

### 2. Database Migrations

```bash
# Run migrations
cd backend
npx prisma migrate deploy
```

### 3. Backup Strategy

```bash
# Database backups (automated via RDS)
# File backups to S3
# Configuration backups
```

## 📞 Support

If you encounter any issues:

1. Check the logs: `pm2 logs`
2. Verify environment variables: `cat .env.production`
3. Test database connection: `psql $DATABASE_URL`
4. Check nginx status: `sudo systemctl status nginx`

## 🎉 Success!

Your ULICA application should now be running on AWS EC2 with:
- ✅ Next.js frontend on port 3000
- ✅ Express.js backend on port 5001
- ✅ PostgreSQL database on RDS
- ✅ Nginx reverse proxy with SSL
- ✅ PM2 process management
- ✅ File uploads to S3
- ✅ Payment gateway integration

Visit your domain to see your live application!
