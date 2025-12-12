# 🧪 ULICA Manual Testing Guide

## Overview
This guide provides comprehensive instructions for manually testing the ULICA e-commerce platform. All test scripts are configured to show ✅ for passing tests and ❌ for failing tests.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install all project dependencies
npm run install:all

# Or install individually:
npm install                    # Root dependencies
cd backend && npm install     # Backend dependencies  
cd ../frontend && npm install # Frontend dependencies
```

### 2. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend   # Backend on port 5001
npm run dev:frontend  # Frontend on port 3000
```

### 3. Run Tests
```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test:backend   # Backend tests only
npm run test:frontend  # Frontend tests only
npm run test:coverage  # Generate coverage report
```

## 📋 Test Commands

### Available Test Scripts

| Command | Description | Output |
|---------|-------------|---------|
| `npm run test:all` | Run all tests (backend + frontend) | ✅/❌ status |
| `npm run test:backend` | Run backend tests only | API, auth, database tests |
| `npm run test:frontend` | Run frontend tests only | Component, UI tests |
| `npm run test:coverage` | Generate coverage report | Coverage percentage |
| `npm run test:watch` | Watch mode for development | Auto-rerun on changes |

### Test Runner Script
```bash
# Use the enhanced test runner
./test-runner.sh all       # Run all tests
./test-runner.sh backend   # Backend tests only
./test-runner.sh frontend  # Frontend tests only
./test-runner.sh coverage  # Coverage report
./test-runner.sh help      # Show help
```

## 🎯 Expected Test Outputs

### ✅ Passing Tests Example
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

### ❌ Failing Tests Example
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

## 📁 Test Structure

```
tests/
├── routes/
│   ├── products.test.ts      # Product API endpoints
│   ├── cart.test.ts          # Cart functionality
│   ├── orders.test.ts        # Order processing
│   └── users.test.ts         # User management
├── auth/
│   ├── auth.test.ts          # Authentication flows
│   ├── middleware.test.ts    # Auth middleware
│   └── permissions.test.ts   # Role-based access
├── components/
│   ├── Button.test.tsx       # Button component
│   ├── ProductCard.test.tsx  # Product display
│   ├── CartWidget.test.tsx   # Shopping cart
│   └── Forms.test.tsx        # Form components
├── integration/
│   ├── checkout.test.ts      # End-to-end checkout
│   ├── payment.test.ts       # Payment processing
│   └── admin.test.ts         # Admin panel flows
└── utils/
    ├── api.test.ts           # API utilities
    └── helpers.test.ts       # Helper functions
```

## 🔍 Test Categories

### Backend Tests (`npm run test:backend`)

#### API Routes Testing
- **Products**: CRUD operations, filtering, search
- **Cart**: Add/remove items, quantity updates
- **Orders**: Order creation, status updates
- **Users**: Registration, login, profile management
- **Admin**: Product management, order processing

#### Authentication Testing
- **Login/Logout**: JWT token generation and validation
- **Registration**: User creation and email verification
- **Password Reset**: Secure password reset flow
- **Role-based Access**: Admin vs customer permissions

#### Database Testing
- **CRUD Operations**: Create, read, update, delete
- **Relationships**: User-orders, product-categories
- **Validation**: Input validation and constraints
- **Transactions**: Order processing and inventory

#### Payment Integration Testing
- **Razorpay**: Payment gateway integration
- **Webhooks**: Payment confirmation handling
- **Error Handling**: Failed payment scenarios
- **Security**: Payment data protection

### Frontend Tests (`npm run test:frontend`)

#### Component Testing
- **Rendering**: Component mounts and displays correctly
- **Props**: Props are passed and used correctly
- **State**: Component state updates properly
- **Events**: User interactions trigger correct actions

#### User Interface Testing
- **Navigation**: Routing and page transitions
- **Forms**: Form validation and submission
- **Responsive**: Mobile and desktop layouts
- **Accessibility**: Screen reader and keyboard navigation

#### State Management Testing
- **Context**: Global state updates
- **Local State**: Component-level state
- **Side Effects**: API calls and data fetching
- **Caching**: Data persistence and retrieval

#### Integration Testing
- **API Integration**: Frontend-backend communication
- **User Flows**: Complete user journeys
- **Error Handling**: Error states and recovery
- **Performance**: Loading states and optimization

## 🐛 Debugging Failed Tests

### 1. Verbose Test Output
```bash
# Run tests with detailed output
npm run test:all -- --verbose

# Run specific test file
npm run test:all -- tests/routes/products.test.ts

# Run tests matching pattern
npm run test:all -- --testNamePattern="authentication"
```

### 2. Check Application Logs
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs
cd frontend && npm run dev

# Check browser console for frontend errors
# Open Developer Tools → Console
```

### 3. Common Issues and Solutions

#### Database Connection Issues
```bash
# Check database connection
cd backend && npx prisma db push

# Reset database if needed
cd backend && npx prisma migrate reset

# Check environment variables
cat .env
```

#### API Endpoint Issues
```bash
# Test API endpoints manually
curl http://localhost:5001/api/health
curl http://localhost:5001/api/products

# Check if backend is running
ps aux | grep node
```

#### Component Rendering Issues
```bash
# Check if frontend is running
curl http://localhost:3000

# Clear Next.js cache
cd frontend && rm -rf .next

# Rebuild frontend
cd frontend && npm run build
```

#### Test Environment Issues
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📊 Test Coverage

### Coverage Goals
- **Backend**: 80%+ code coverage
- **Frontend**: 70%+ code coverage
- **Critical Paths**: 95%+ coverage (auth, payments, checkout)

### Generate Coverage Report
```bash
npm run test:coverage
```

### View Coverage Report
```bash
# Open coverage report in browser
open coverage/lcov-report/index.html

# Or navigate to:
# file:///path/to/project/coverage/lcov-report/index.html
```

## 🔄 Continuous Testing

### Watch Mode (Development)
```bash
# Run tests in watch mode
npm run test:watch

# Tests will automatically rerun when files change
```

### Pre-commit Testing
```bash
# Run all tests before committing
npm run test:all && npm run lint

# Add to git hooks for automated testing
```

### CI/CD Integration
```bash
# Run tests in CI environment
npm ci
npm run test:all
npm run build
```

## ✅ Manual Test Checklist

### Backend API Tests
- [ ] **Product Management**
  - [ ] Create new product
  - [ ] Update product details
  - [ ] Delete product
  - [ ] Search and filter products
  - [ ] Product image upload

- [ ] **User Authentication**
  - [ ] User registration
  - [ ] User login/logout
  - [ ] Password reset
  - [ ] Email verification
  - [ ] Profile updates

- [ ] **Cart Operations**
  - [ ] Add items to cart
  - [ ] Remove items from cart
  - [ ] Update item quantities
  - [ ] Clear cart
  - [ ] Cart persistence

- [ ] **Order Processing**
  - [ ] Create new order
  - [ ] Order status updates
  - [ ] Order history
  - [ ] Order cancellation
  - [ ] Invoice generation

- [ ] **Payment Integration**
  - [ ] Razorpay payment processing
  - [ ] Payment webhook handling
  - [ ] Failed payment handling
  - [ ] Refund processing

### Frontend Component Tests
- [ ] **Navigation**
  - [ ] Header navigation
  - [ ] Footer links
  - [ ] Mobile menu
  - [ ] Breadcrumb navigation
  - [ ] Search functionality

- [ ] **Product Pages**
  - [ ] Product listing
  - [ ] Product filtering
  - [ ] Product search
  - [ ] Product detail view
  - [ ] Product image gallery

- [ ] **Shopping Cart**
  - [ ] Add to cart button
  - [ ] Cart widget display
  - [ ] Cart page functionality
  - [ ] Quantity updates
  - [ ] Remove items

- [ ] **Checkout Process**
  - [ ] Checkout form
  - [ ] Address selection
  - [ ] Payment method selection
  - [ ] Order confirmation
  - [ ] Order tracking

- [ ] **User Account**
  - [ ] Login form
  - [ ] Registration form
  - [ ] Profile management
  - [ ] Order history
  - [ ] Wishlist functionality

- [ ] **Admin Panel**
  - [ ] Admin login
  - [ ] Product management
  - [ ] Order management
  - [ ] User management
  - [ ] Analytics dashboard

### Integration Tests
- [ ] **Complete User Flows**
  - [ ] Browse → Add to Cart → Checkout → Payment
  - [ ] Register → Login → Profile Update
  - [ ] Admin Login → Manage Products → Update Orders
  - [ ] Search → Filter → Purchase → Track Order

- [ ] **Error Handling**
  - [ ] Network errors
  - [ ] Invalid form inputs
  - [ ] Payment failures
  - [ ] Authentication errors
  - [ ] Server errors

## 🚨 Troubleshooting Guide

### Tests Not Running
```bash
# Check Node.js version (should be 18+)
node --version

# Clear all caches
npm cache clean --force
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
# Check database connection
cd backend && npx prisma db push

# Run migrations
cd backend && npx prisma migrate dev

# Reset database
cd backend && npx prisma migrate reset
```

### Port Conflicts
```bash
# Check if ports are in use
lsof -i :3000  # Frontend port
lsof -i :5001  # Backend port

# Kill processes if needed
kill -9 <PID>
```

### Environment Issues
```bash
# Check environment variables
cat .env
cat backend/.env
cat frontend/.env

# Verify database URL format
# Should be: postgresql://user:password@host:port/database
```

## 📈 Performance Testing

### API Response Times
```bash
# Test API endpoints with timing
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5001/api/products

# Create curl-format.txt with:
#     time_namelookup:  %{time_namelookup}\n
#        time_connect:  %{time_connect}\n
#     time_appconnect:  %{time_appconnect}\n
#    time_pretransfer:  %{time_pretransfer}\n
#       time_redirect:  %{time_redirect}\n
#  time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#          time_total:  %{time_total}\n
```

### Frontend Performance
```bash
# Build and analyze bundle
cd frontend && npm run build
npm run analyze  # If configured

# Check Core Web Vitals
# Use browser DevTools → Lighthouse
```

## 🎉 Success Criteria

Your testing is successful when:
- ✅ All tests pass (`npm run test:all`)
- ✅ Coverage meets targets (80%+ backend, 70%+ frontend)
- ✅ No console errors in browser
- ✅ All API endpoints respond correctly
- ✅ User flows work end-to-end
- ✅ Error handling works properly
- ✅ Performance is acceptable

## 📞 Support

If you encounter issues:
1. Check the troubleshooting guide above
2. Review application logs
3. Verify environment configuration
4. Test individual components
5. Check browser console for errors

**Happy Testing!** 🧪✨
