# 🚀 ULICA - Complete Environment Setup Guide

## 📋 **Prerequisites**

- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for caching)
- Git

## 🔧 **Environment Variables**

### **Backend (.env)**
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ulica_db"
SHADOW_DATABASE_URL="postgresql://username:password@localhost:5432/ulica_shadow_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5000"

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@ulica.com"
FROM_NAME="ULICA"

# Payment Gateways
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

PHONEPE_MERCHANT_ID="your-phonepe-merchant-id"
PHONEPE_SALT_KEY="your-phonepe-salt-key"
PHONEPE_SALT_INDEX="1"
PHONEPE_ENVIRONMENT="sandbox"

# Shipping
SHIPROCKET_EMAIL="your-shiprocket-email"
SHIPROCKET_PASSWORD="your-shiprocket-password"
SHIPROCKET_BASE_URL="https://apiv2.shiprocket.in/v1/external"
SHIPROCKET_PICKUP_PINCODE="110001"
SHIPROCKET_PICKUP_LOCATION="Primary"

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="ulica-uploads"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# Google Analytics
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX-X"
```

### **Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_GA_ID="GA-XXXXXXXXX-X"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your-razorpay-key-id"
NEXT_PUBLIC_PHONEPE_MERCHANT_ID="your-phonepe-merchant-id"
```

## 🗄️ **Database Setup**

### **1. Install PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### **2. Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ulica_db;
CREATE DATABASE ulica_shadow_db;

# Create user (optional)
CREATE USER ulica_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ulica_db TO ulica_user;
GRANT ALL PRIVILEGES ON DATABASE ulica_shadow_db TO ulica_user;

# Exit
\q
```

### **3. Run Database Migrations**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

## 🚀 **Installation & Setup**

### **1. Clone Repository**
```bash
git clone <repository-url>
cd Ulica
```

### **2. Install Dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **3. Environment Setup**
```bash
# Copy environment files
cp env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit environment variables
nano backend/.env
nano frontend/.env.local
```

### **4. Database Setup**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

### **5. Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔧 **Development Commands**

### **Backend Commands**
```bash
# Start development server
npm run dev

# Start production server
npm run start

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Database commands
npx prisma migrate dev          # Create and apply migration
npx prisma migrate reset        # Reset database
npx prisma generate            # Generate Prisma client
npx prisma studio              # Open Prisma Studio
npx prisma db seed             # Seed database

# Linting and formatting
npm run lint
npm run lint:fix
npm run format
```

### **Frontend Commands**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Type checking
npm run type-check
```

## 🐳 **Docker Setup (Optional)**

### **1. Build and Run with Docker Compose**
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### **2. Individual Docker Commands**
```bash
# Build backend image
docker build -t ulica-backend ./backend

# Build frontend image
docker build -t ulica-frontend ./frontend

# Run backend container
docker run -p 5000:5000 --env-file backend/.env ulica-backend

# Run frontend container
docker run -p 3000:3000 --env-file frontend/.env.local ulica-frontend
```

## 📊 **Database Management**

### **Prisma Studio**
```bash
cd backend
npx prisma studio
```
Access at: http://localhost:5555

### **Database Backup**
```bash
# Create backup
pg_dump -U postgres -h localhost ulica_db > backup.sql

# Restore backup
psql -U postgres -h localhost ulica_db < backup.sql
```

## 🔍 **Testing**

### **Backend Tests**
```bash
cd backend
npm run test                    # Run all tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Run tests with coverage
npm run test:integration       # Run integration tests
```

### **Frontend Tests**
```bash
cd frontend
npm run test                   # Run all tests
npm run test:watch            # Run tests in watch mode
npm run test:coverage         # Run tests with coverage
npm run test:e2e              # Run end-to-end tests
```

## 🚀 **Production Deployment**

### **1. Build for Production**
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### **2. Environment Variables**
- Set production environment variables
- Configure production database
- Set up SSL certificates
- Configure CDN for static assets

### **3. Database Migration**
```bash
cd backend
npx prisma migrate deploy
```

### **4. Start Production Servers**
```bash
# Backend
cd backend
npm run start

# Frontend
cd frontend
npm run start
```

## 📱 **Mobile App Setup (Optional)**

### **React Native**
```bash
cd mobile
npm install
npx react-native run-ios      # iOS
npx react-native run-android  # Android
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Check database exists

2. **Port Already in Use**
   - Change PORT in .env files
   - Kill existing processes: `lsof -ti:3000 | xargs kill -9`

3. **Prisma Client Error**
   - Run `npx prisma generate`
   - Check schema.prisma syntax

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies installed

### **Logs and Debugging**
```bash
# Backend logs
cd backend
npm run dev 2>&1 | tee backend.log

# Frontend logs
cd frontend
npm run dev 2>&1 | tee frontend.log

# Database logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

## 📚 **Additional Resources**

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Shiprocket API Documentation](https://www.shiprocket.in/api-documentation/)

## 🆘 **Support**

For issues and questions:
1. Check this documentation
2. Review error logs
3. Check GitHub issues
4. Contact development team

---

**Happy Coding! 🎉**
