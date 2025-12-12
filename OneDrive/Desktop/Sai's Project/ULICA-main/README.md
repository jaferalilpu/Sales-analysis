# ULICA — E-commerce Platform (Next.js + Node.js + Prisma)

## Overview
Production-grade e-commerce platform for ULICA streetwear brand:
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Node.js + Express, TypeScript, Prisma (PostgreSQL)
- **Payments**: Razorpay (implemented), PhonePe (stub)
- **Shipping**: Shiprocket integration (implemented)
- **Storage**: AWS S3 for media
- **Cache**: Redis for sessions and caching

## Features

### Storefront
- Home page with hero banner and featured collections
- Product listing and detail pages with image carousel
- Shopping cart and checkout flow
- User account management
- Responsive design with TailwindCSS

### Admin Panel
- Product and variant management
- Order lifecycle management
- Payment and shipping integration
- Role-based access control

### Payment Integration
- Razorpay Checkout (fully implemented)
- PhonePe UPI (stub for implementation)
- Webhook handling for payment confirmation

### Shipping Integration
- Shiprocket API integration
- Automatic shipment creation
- Tracking and label generation

## Prerequisites
- Node.js 18+
- pnpm / npm / yarn
- Docker & docker-compose (for local development)
- PostgreSQL (or use docker-compose)
- Redis (or use docker-compose)

## 🚀 Quick Start

For detailed setup instructions, see **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**.

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Quick Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd Ulica

# 2. Backend setup
cd backend
npm install
cp .env.example .env  # Edit with your values
npm run db:generate
npm run db:migrate
npm run db:seed       # Optional: seed sample data
npm run create-admin  # Create admin user
npm run dev

# 3. Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env.local  # Edit with your values
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Admin Panel**: http://localhost:3000/admin
- **Health Check**: http://localhost:5001/health

### Docker Setup (Alternative)

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run db:migrate

# Seed database
docker-compose exec backend npm run db:seed

# Create admin
docker-compose exec backend npm run create-admin
```

## Project Structure

```
ulica-ecommerce/
├── frontend/                 # Next.js 14 App Router
│   ├── app/                  # App Router pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities and API helpers
│   └── styles/               # TailwindCSS styles
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── controllers/      # Business logic
│   │   ├── services/         # External service integrations
│   │   ├── middlewares/      # Express middlewares
│   │   ├── prisma/           # Database client
│   │   └── utils/            # Helper utilities
│   └── scripts/              # Database seeding scripts
├── prisma/                   # Database schema and migrations
├── docker-compose.yml        # Local development infrastructure
└── .env.example              # Environment variables template
```

## API Endpoints

### Products
- `GET /api/products` - List all published products
- `GET /api/products/:slug` - Get product by slug

### Orders
- `GET /api/orders` - Get user orders (authenticated)
- `POST /api/checkout/create-order` - Create new order

### Payments
- `POST /api/payments/verify` - Verify payment signature
- `POST /api/webhooks/razorpay` - Razorpay webhook handler
- `POST /api/webhooks/phonepe` - PhonePe webhook handler

### Admin
- `POST /api/admin/products` - Create product (admin only)
- `GET /api/admin/orders` - List all orders (admin only)

## Environment Variables

See `.env.example` for required environment variables:

- **Database**: PostgreSQL connection string
- **Redis**: Redis connection for caching
- **Razorpay**: Payment gateway credentials
- **PhonePe**: UPI payment gateway credentials
- **Shiprocket**: Shipping service credentials
- **AWS S3**: Media storage credentials

## Payment Integration

### Razorpay
1. Create Razorpay account and get API keys
2. Add keys to `.env` file
3. Configure webhook endpoint in Razorpay dashboard: `http://yourdomain.com/api/webhooks/razorpay`

### PhonePe
1. Register with PhonePe Merchant API
2. Implement signature verification per PhonePe documentation
3. Update `backend/src/services/phonepeService.ts`

## Shipping Integration

### Shiprocket
1. Create Shiprocket account
2. Add credentials to `.env` file
3. Configure pickup location in Shiprocket dashboard

## Deployment

### Pre-Deployment Verification

Before deploying to production, ensure:

1. **Environment Variables**: All required variables set (see `.env.example`)
2. **Database Migrations**: Run `npx prisma migrate deploy` (see `docs/MIGRATION_VERIFICATION.md`)
3. **Builds**: Both frontend and backend build successfully
4. **Tests**: All tests pass
5. **Health Check**: Run `./scripts/production-health-check.sh`

### Production Checklist

See **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** for complete deployment checklist.

Quick checklist:
- [ ] Set up production PostgreSQL database
- [ ] Configure Redis instance
- [ ] Set up AWS S3 bucket for media
- [ ] Configure domain and SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure CI/CD pipeline
- [ ] Set up backup strategy
- [ ] Test all integrations (payments, shipping, email)
- [ ] Verify security settings (HTTPS, CORS, rate limiting)

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

#### Backend
```bash
cd backend
npm install --production
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm install --production
npm run build
npm start
```

### Health Monitoring

Use the production health check script:
```bash
./scripts/production-health-check.sh
```

This verifies:
- Backend and frontend are accessible
- Database connection
- Environment variables
- External integrations (credentials configured)
- Disk space

### Documentation

- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Complete deployment guide
- **[docs/MIGRATION_VERIFICATION.md](./docs/MIGRATION_VERIFICATION.md)** - Database migration verification
- **[docs/CLEANUP.md](./docs/CLEANUP.md)** - Project cleanup report

## Development Scripts

### Backend
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:generate` - Generate Prisma client

### Frontend
- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🧪 Manual Testing Guide

This guide will help you run comprehensive tests for the ULICA project to ensure everything works correctly.

### Prerequisites

1. **Install Dependencies**
   ```bash
   # Install all dependencies for the project
   npm run install:all
   
   # Or install individually:
   npm install                    # Root dependencies
   cd backend && npm install     # Backend dependencies
   cd ../frontend && npm install # Frontend dependencies
   ```

2. **Setup Test Environment**
   ```bash
   # Ensure your development servers are running
   npm run dev
   ```

### Test Commands

#### 1. Run All Tests
```bash
npm run test:all
```
**What it does:** Runs all tests in the `/tests/` folder (backend + frontend)
**Expected output:** Shows ✅ for passing tests and ❌ for failing tests

#### 2. Run Backend Tests Only
```bash
npm run test:backend
```
**What it does:** Runs only backend tests (routes, auth, integration)
**Expected output:** Tests API endpoints, authentication, and database operations

#### 3. Run Frontend Tests Only
```bash
npm run test:frontend
```
**What it does:** Runs only frontend component tests
**Expected output:** Tests React components, user interactions, and UI behavior

#### 4. Check Test Coverage
```bash
npm run test:coverage
```
**What it does:** Runs all tests and generates coverage report
**Expected output:** Shows percentage of code covered by tests

### Test Structure

```
tests/
├── routes/
│   ├── products.test.ts      # Product API tests
│   ├── cart.test.ts          # Cart functionality tests
│   └── orders.test.ts        # Order processing tests
├── auth/
│   ├── auth.test.ts          # Authentication tests
│   └── middleware.test.ts    # Auth middleware tests
├── components/
│   ├── Button.test.tsx       # Button component tests
│   ├── ProductCard.test.tsx  # Product card tests
│   └── CartWidget.test.tsx   # Cart widget tests
└── integration/
    ├── checkout.test.ts      # End-to-end checkout tests
    └── payment.test.ts       # Payment flow tests
```

### Sample Test Outputs

#### ✅ Passing Tests Example
```bash
$ npm run test:all

PASS tests/routes/products.test.ts
PASS tests/auth/auth.test.ts
PASS tests/components/Button.test.tsx

Test Suites: 3 passed, 3 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        2.345 s
Ran all test suites.

✅ All tests passed successfully!
```

#### ❌ Failing Tests Example
```bash
$ npm run test:all

FAIL tests/routes/products.test.ts
  ✗ should fetch all products (15ms)
    Expected: 200
    Received: 500

FAIL tests/components/Button.test.tsx
  ✗ should render button with correct text (8ms)
    Expected: "Click me"
    Received: ""

Test Suites: 1 failed, 2 passed, 3 total
Tests:       2 failed, 13 passed, 15 total

❌ Some tests failed. Check the output above for details.
```

### Debugging Failed Tests

#### 1. Check Test Logs
```bash
# Run tests with verbose output
npm run test:all -- --verbose

# Run specific test file
npm run test:all -- tests/routes/products.test.ts
```

#### 2. Check Application Logs
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs  
cd frontend && npm run dev
```

#### 3. Common Issues and Solutions

**Database Connection Issues:**
```bash
# Check if database is running
cd backend && npx prisma db push

# Reset database if needed
cd backend && npx prisma migrate reset
```

**API Endpoint Issues:**
```bash
# Test API endpoints manually
curl http://localhost:5001/api/health
curl http://localhost:5001/api/products
```

**Component Rendering Issues:**
```bash
# Check if frontend is running
curl http://localhost:3000

# Check for console errors in browser
# Open Developer Tools → Console
```

### Test Categories

#### Backend Tests (`npm run test:backend`)
- **API Routes**: Test all REST endpoints
- **Authentication**: Test login, registration, JWT tokens
- **Database**: Test CRUD operations
- **Payment**: Test Razorpay integration
- **Validation**: Test input validation and error handling

#### Frontend Tests (`npm run test:frontend`)
- **Components**: Test React component rendering
- **User Interactions**: Test clicks, form submissions
- **State Management**: Test context and state updates
- **Responsive Design**: Test mobile/desktop layouts
- **Accessibility**: Test keyboard navigation and screen readers

### Continuous Testing

#### Watch Mode (Development)
```bash
# Run tests in watch mode during development
npm run test:watch
```

#### Pre-commit Testing
```bash
# Run all tests before committing
npm run test:all && npm run lint
```

### Test Coverage Goals

- **Backend**: 80%+ coverage
- **Frontend**: 70%+ coverage
- **Critical Paths**: 95%+ coverage (auth, payments, checkout)

### Manual Test Checklist

#### Backend API Tests
- [ ] Product CRUD operations
- [ ] User authentication and authorization
- [ ] Cart operations (add, remove, update)
- [ ] Order creation and processing
- [ ] Payment gateway integration
- [ ] File upload functionality
- [ ] Error handling and validation

#### Frontend Component Tests
- [ ] Navigation and routing
- [ ] Product listing and filtering
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] User account management
- [ ] Admin panel features
- [ ] Responsive design
- [ ] Form validation and error messages

#### Integration Tests
- [ ] Complete checkout flow
- [ ] Payment processing
- [ ] Email notifications
- [ ] Order fulfillment
- [ ] User registration and login
- [ ] Admin product management

### Troubleshooting

#### Tests Not Running
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Database Test Issues
```bash
# Use test database
cp .env .env.test
# Update DATABASE_URL to point to test database

# Run migrations
cd backend && npx prisma migrate dev
```

#### Frontend Test Issues
```bash
# Clear Next.js cache
cd frontend && rm -rf .next

# Rebuild
cd frontend && npm run build
```

### Advanced Testing

#### Performance Testing
```bash
# Test API response times
npm run test:backend -- --testNamePattern="performance"

# Test component render times
npm run test:frontend -- --testNamePattern="performance"
```

#### Security Testing
```bash
# Test authentication security
npm run test:backend -- --testNamePattern="security"

# Test input validation
npm run test:backend -- --testNamePattern="validation"
```

### Test Reports

After running tests, you can find detailed reports in:
- **Coverage Report**: `coverage/lcov-report/index.html`
- **Test Results**: Console output with pass/fail status
- **Jest Reports**: `jest-results.json`

### Backend API Testing
```bash
# Test Razorpay webhook
curl -X POST http://localhost:5001/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: <signature>" \
  -d '<webhook_payload>'
```

### Database Testing
```bash
# Seed test data
cd backend
node scripts/seed.js
```

## Security Considerations

- Never commit `.env` files
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Use CORS properly
- Implement proper authentication
- Regular security updates

### JWT Secret Rotation

**IMPORTANT**: JWT secrets should be rotated regularly in production for security.

1. **Generate Strong Secrets**:
   ```bash
   # Generate a secure random secret (32+ characters recommended)
   openssl rand -base64 32
   ```

2. **Update Environment Variables**:
   - Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in your `.env` file
   - Restart the backend server

3. **Rotation Schedule**:
   - Rotate JWT secrets every 90 days (or as per your security policy)
   - Rotate immediately if a secret is compromised
   - Use a secret management service (AWS Secrets Manager, HashiCorp Vault) in production

4. **Impact**:
   - All existing tokens will become invalid after rotation
   - Users will need to log in again
   - Consider implementing a grace period with dual secrets during rotation

5. **Best Practices**:
   - Use different secrets for access tokens and refresh tokens
   - Never hardcode secrets in source code
   - Use environment-specific secrets (dev, staging, production)
   - Monitor for unauthorized token usage

## Support

For issues and questions:
1. Check the documentation
2. Review environment configuration
3. Check logs for errors
4. Create an issue in the repository

## License

Private - ULICA Fashion Brand
