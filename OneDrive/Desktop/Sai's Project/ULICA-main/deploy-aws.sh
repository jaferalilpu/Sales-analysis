#!/bin/bash

# ULICA AWS Deployment Script
# This script prepares and deploys the ULICA project to AWS EC2

set -e

echo "🚀 Starting ULICA AWS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "RAZORPAY_KEY_ID"
        "RAZORPAY_KEY_SECRET"
        "NEXT_PUBLIC_SITE_URL"
        "NEXT_PUBLIC_API_URL"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_error "Please set these variables before deploying."
        exit 1
    fi
    
    print_status "All required environment variables are set."
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Frontend dependencies
    cd frontend
    npm ci --production=false
    cd ..
    
    # Backend dependencies
    cd backend
    npm ci --production=false
    cd ..
    
    print_status "Dependencies installed successfully."
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Build frontend
    cd frontend
    NODE_ENV=production npm run build
    cd ..
    
    # Build backend
    cd backend
    npm run build
    cd ..
    
    print_status "Application built successfully."
}

# Generate Prisma client
generate_prisma_client() {
    print_status "Generating Prisma client..."
    
    cd backend
    npx prisma generate
    cd ..
    
    print_status "Prisma client generated."
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd backend
    npx prisma migrate deploy
    cd ..
    
    print_status "Database migrations completed."
}

# Create production start script
create_start_script() {
    print_status "Creating production start script..."
    
    cat > start-production.sh << 'EOF'
#!/bin/bash

# ULICA Production Start Script
set -e

echo "🚀 Starting ULICA Production Server..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Start backend
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Function to handle shutdown
shutdown() {
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID
    exit 0
}

# Trap signals for graceful shutdown
trap shutdown SIGTERM SIGINT

# Wait for processes
wait
EOF

    chmod +x start-production.sh
    print_status "Production start script created."
}

# Create PM2 ecosystem file for process management
create_pm2_config() {
    print_status "Creating PM2 configuration..."
    
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'ulica-backend',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'ulica-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF

    print_status "PM2 configuration created."
}

# Create nginx configuration
create_nginx_config() {
    print_status "Creating nginx configuration..."
    
    cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration (replace with your certificate paths)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self' https://checkout.razorpay.com; frame-ancestors 'none';" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
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
    
    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:5001;
        access_log off;
    }
}
EOF

    print_status "Nginx configuration created."
}

# Create Docker configuration
create_docker_config() {
    print_status "Creating Docker configuration..."
    
    # Frontend Dockerfile
    cat > frontend/Dockerfile.prod << 'EOF'
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF

    # Backend Dockerfile
    cat > backend/Dockerfile.prod << 'EOF'
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nodejs

EXPOSE 5001

CMD ["node", "dist/index.js"]
EOF

    # Docker Compose for production
    cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - BACKEND_URL=${BACKEND_URL}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - /path/to/ssl/certificates:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
EOF

    print_status "Docker configuration created."
}

# Main deployment function
main() {
    print_status "Starting ULICA AWS deployment preparation..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
        print_error "Please run this script from the ULICA project root directory."
        exit 1
    fi
    
    # Run deployment steps
    check_env_vars
    install_dependencies
    build_application
    generate_prisma_client
    create_start_script
    create_pm2_config
    create_nginx_config
    create_docker_config
    
    print_status "🎉 ULICA is ready for AWS deployment!"
    print_status ""
    print_status "Next steps:"
    print_status "1. Set up your AWS RDS PostgreSQL database"
    print_status "2. Configure your environment variables in .env.production"
    print_status "3. Set up your domain and SSL certificates"
    print_status "4. Deploy using one of the following methods:"
    print_status "   - Direct deployment: ./start-production.sh"
    print_status "   - PM2: pm2 start ecosystem.config.js"
    print_status "   - Docker: docker-compose -f docker-compose.prod.yml up -d"
    print_status ""
    print_status "For detailed deployment instructions, see DEPLOYMENT.md"
}

# Run main function
main "$@"
