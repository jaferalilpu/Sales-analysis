# 🚀 ULICA - Complete Setup Guide

This guide will help you set up the ULICA e-commerce platform from scratch for both development and production environments.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **Docker & Docker Compose** (optional, for containerized setup) ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## 🏗️ Project Structure

```
Ulica/
├── backend/          # Express.js API server
├── frontend/         # Next.js 14 frontend
├── prisma/          # Database schema
└── .github/         # CI/CD workflows
```

## 🔧 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Ulica
```

### 2. Backend Setup

#### 2.1 Install Dependencies

```bash
cd backend
npm install
```

#### 2.2 Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

**Required Backend Environment Variables:**

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ulica_dev?schema=public"

# Server
NODE_ENV="development"
PORT=5001
HOST="0.0.0.0"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5001"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Admin User (for initial setup)
ADMIN_EMAIL="admin@ulica.com"
ADMIN_PASSWORD="ChangeThisPassword123!"
ADMIN_NAME="Admin User"

# Payment Gateways (Optional for development)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""

PHONEPE_MERCHANT_ID=""
PHONEPE_SALT_KEY=""
PHONEPE_SALT_INDEX="1"

# Shipping (Optional for development)
SHIPROCKET_EMAIL=""
SHIPROCKET_PASSWORD=""
SHIPROCKET_BASE_URL="https://apiv2.shiprocket.in"

# Email (Optional for development)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
```

#### 2.3 Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed database with sample data
npm run db:seed
```

#### 2.4 Create Admin User

```bash
# Create admin user (uses values from .env)
npm run create-admin
```

#### 2.5 Start Backend Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The backend API will be available at `http://localhost:5001`

### 3. Frontend Setup

#### 3.1 Install Dependencies

```bash
cd ../frontend
npm install
```

#### 3.2 Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
nano .env.local  # or use your preferred editor
```

**Required Frontend Environment Variables:**

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:5001"

# Backend URL
BACKEND_URL="http://localhost:5001"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=""
```

#### 3.3 Start Frontend Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The frontend will be available at `http://localhost:3000`

### 4. Quick Start with Docker Compose

If you prefer using Docker:

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# Run migrations
docker-compose exec backend npm run db:migrate

# Seed database
docker-compose exec backend npm run db:seed

# Create admin user
docker-compose exec backend npm run create-admin

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords and secrets
- [ ] Use strong JWT secrets (generate with `openssl rand -base64 32`)
- [ ] Enable HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins in `ALLOWED_ORIGINS`
- [ ] Set up firewall rules
- [ ] Enable rate limiting (already configured)
- [ ] Use secure cookies (httpOnly, secure, sameSite)
- [ ] Regular security updates
- [ ] Set up monitoring and logging
- [ ] Configure database backups

## 📊 Database Management

### Prisma Studio (GUI for database)

```bash
cd backend
npm run db:studio
```

Access at `http://localhost:5555`

### Common Database Commands

```bash
# Create a new migration
npm run db:migrate -- --name migration_name

# Reset database (WARNING: deletes all data)
npm run db:reset

# Deploy migrations (production)
npm run db:deploy

# Seed database
npm run db:seed
```

## 🚀 Production Deployment

### Environment Variables for Production

Ensure all production environment variables are set:

```env
NODE_ENV=production
DATABASE_URL=<production-postgres-url>
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Build and Deploy

**Backend:**
```bash
cd backend
npm ci
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm ci
npm run build
npm start
```

### Docker Deployment

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 📝 Troubleshooting

### Common Issues

**1. Database Connection Error**
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `createdb ulica_dev`

**2. Port Already in Use**
- Change `PORT` in backend `.env`
- Change frontend port: `npm run dev -- -p 3001`

**3. Prisma Client Not Generated**
```bash
cd backend
npm run db:generate
```

**4. Migration Errors**
```bash
cd backend
npm run db:migrate reset  # WARNING: Deletes data
npm run db:migrate
```

**5. Module Not Found Errors**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🆘 Getting Help

1. Check logs:
   - Backend: `backend/logs/`
   - Docker: `docker-compose logs`

2. Verify environment variables are set correctly

3. Ensure all dependencies are installed

4. Check database connection

5. Review error messages in console/logs

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Database migrations run successfully
- [ ] Admin user can log in at `/admin`
- [ ] API endpoints respond correctly
- [ ] Frontend can connect to backend API
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run type-check`
- [ ] Build succeeds: `npm run build`

## 🎉 Success!

If all checks pass, you're ready to start developing! The platform should be accessible at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Admin Panel**: http://localhost:3000/admin
- **API Health**: http://localhost:5001/health

