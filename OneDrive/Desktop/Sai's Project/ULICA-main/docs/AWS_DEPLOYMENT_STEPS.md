# 🚀 ULICA AWS Deployment - Step by Step Guide

## 🎯 **Quick Start (30 minutes)**

### **Step 1: AWS Infrastructure Setup**

#### **1.1 Create EC2 Instance**
```bash
# Launch EC2 instance:
# - Instance Type: t3.medium (2 vCPU, 4GB RAM)
# - AMI: Ubuntu Server 22.04 LTS
# - Storage: 20GB gp3
# - Security Group: 
#   - SSH (22): Your IP
#   - HTTP (80): 0.0.0.0/0
#   - HTTPS (443): 0.0.0.0/0
#   - Custom (3000): 0.0.0.0/0
#   - Custom (5001): 0.0.0.0/0
```

#### **1.2 Create RDS PostgreSQL Database**
```bash
# Create RDS instance:
# - Engine: PostgreSQL 15.x
# - Instance Class: db.t3.micro (free tier) or db.t3.small
# - Storage: 20GB
# - Security Group: Allow EC2 security group on port 5432
# - Database Name: ulica_production
# - Username: ulica_admin
# - Password: [Generate secure password]
```

#### **1.3 Create S3 Bucket**
```bash
# Create S3 bucket:
# - Bucket Name: ulica-production-[random-suffix]
# - Region: ap-south-1 (Mumbai)
# - Block all public access: Yes
# - Versioning: Enabled
```

### **Step 2: Connect to EC2 and Setup**

#### **2.1 Connect to EC2**
```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### **2.2 Install Required Software**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Install PostgreSQL client
sudo apt install postgresql-client -y
```

### **Step 3: Deploy Application**

#### **3.1 Clone Repository**
```bash
# Clone your repository
git clone https://github.com/charansai0108/ULICA.git
cd ULICA

# Make deployment script executable
chmod +x deploy-aws.sh
```

#### **3.2 Configure Environment Variables**
```bash
# Copy production environment file
cp env.production .env.production

# Edit environment variables
nano .env.production
```

**Update these critical variables:**
```bash
# Database (replace with your RDS endpoint)
DATABASE_URL=postgresql://ulica_admin:your-password@your-rds-endpoint.ap-south-1.rds.amazonaws.com:5432/ulica_production

# Domain (replace with your domain or EC2 public IP)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Payment Gateway (get from Razorpay dashboard)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# AWS S3 (get from AWS IAM)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=ulica-production-your-suffix
```

#### **3.3 Run Deployment**
```bash
# Run deployment script
./deploy-aws.sh
```

### **Step 4: Setup Database**

#### **4.1 Run Database Migrations**
```bash
# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Run Prisma migrations
cd backend
npx prisma migrate deploy
npx prisma generate
cd ..
```

#### **4.2 Create Admin User**
```bash
# Create admin user
cd backend
node scripts/create-admin.js
cd ..
```

### **Step 5: Configure Nginx**

#### **5.1 Update Nginx Configuration**
```bash
# Edit nginx configuration
sudo nano /etc/nginx/sites-available/ulica
```

**Copy this configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com your-ec2-ip;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **5.2 Enable Nginx Site**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ulica /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

### **Step 6: Start Application**

#### **6.1 Start with PM2 (Recommended)**
```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

#### **6.2 Verify Application**
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Test endpoints
curl http://localhost:3000
curl http://localhost:5001/health
```

### **Step 7: Setup SSL (Optional but Recommended)**

#### **7.1 Install Certbot**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🎉 **Deployment Complete!**

Your ULICA application should now be running at:
- **Frontend**: http://your-ec2-ip or https://your-domain.com
- **Backend API**: http://your-ec2-ip/api or https://your-domain.com/api
- **Admin Panel**: http://your-ec2-ip/admin

## 🔧 **Management Commands**

### **Application Management**
```bash
# View logs
pm2 logs

# Restart application
pm2 restart all

# Stop application
pm2 stop all

# Monitor application
pm2 monit
```

### **Database Management**
```bash
# Connect to database
psql $DATABASE_URL

# Run migrations
cd backend && npx prisma migrate deploy

# Reset database (WARNING: This will delete all data)
cd backend && npx prisma migrate reset
```

### **Updates**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
npm run build
pm2 restart all
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Port Already in Use**
```bash
sudo netstat -tulpn | grep :3000
sudo kill -9 <PID>
```

2. **Database Connection Failed**
```bash
# Test database connection
psql $DATABASE_URL

# Check RDS security groups
# Verify DATABASE_URL format
```

3. **Permission Denied**
```bash
sudo chown -R ubuntu:ubuntu /home/ubuntu/ULICA
chmod +x deploy-aws.sh
```

4. **Build Failures**
```bash
rm -rf frontend/.next backend/dist
npm run build
```

## 📊 **Monitoring**

### **Check Application Status**
```bash
# PM2 status
pm2 status

# System resources
htop
df -h
free -h

# Nginx status
sudo systemctl status nginx
```

### **View Logs**
```bash
# Application logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

## 🔒 **Security Checklist**

- [ ] Change default passwords
- [ ] Configure firewall (UFW)
- [ ] Setup SSL certificates
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup database regularly

## 🎯 **Next Steps**

1. **Setup Domain**: Point your domain to EC2 public IP
2. **SSL Certificate**: Get SSL certificate for HTTPS
3. **Monitoring**: Setup CloudWatch or similar monitoring
4. **Backup**: Configure automated database backups
5. **CDN**: Setup CloudFront for better performance

**Your ULICA e-commerce platform is now live on AWS!** 🚀
