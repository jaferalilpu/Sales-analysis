# 🧪 ULICA - Testing Guide

This document provides a comprehensive guide for running and writing tests for the ULICA e-commerce platform.

## 📋 Test Structure

### Backend Tests (`backend/src/__tests__/`)

- **`auth.test.ts`** - Authentication and authorization tests
- **`payments.integration.test.ts`** - Payment gateway integration tests (Razorpay, PhonePe)
- **`shiprocket.integration.test.ts`** - Shiprocket shipping integration tests
- **`email.integration.test.ts`** - Email service integration tests

### Frontend Tests (`frontend/__tests__/`)

- **`components/Header.test.tsx`** - Header component tests
- **`components/Toast.test.tsx`** - Toast notification tests
- **`components/Skeleton.test.tsx`** - Skeleton loader tests
- **`hooks/useGlobalLoading.test.tsx`** - Global loading hook tests
- **`hooks/useTheme.test.tsx`** - Theme management hook tests

## 🚀 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should login"
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Header.test.tsx
```

## 📝 Writing Tests

### Backend Integration Tests

#### Example: Payment Integration Test

```typescript
import request from 'supertest';
import express from 'express';
import checkoutRoutes from '../routes/checkout';
import { prisma } from './setup';

const app = express();
app.use(express.json());
app.use('/api/checkout', checkoutRoutes);

describe('Payment Integration', () => {
  let testOrder: any;

  beforeAll(async () => {
    // Setup test data
    testOrder = await prisma.order.create({
      data: {
        // ... order data
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.order.deleteMany();
  });

  it('should verify payment successfully', async () => {
    const response = await request(app)
      .post('/api/checkout/verify-payment')
      .send({
        orderId: testOrder.id,
        paymentId: 'pay_test123',
        // ... payment data
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Component Tests

#### Example: Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Frontend Hook Tests

#### Example: Custom Hook Test

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

describe('useMyHook', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.doSomething();
    });

    expect(result.current.value).toBe('expected');
  });
});
```

## 🎯 Test Coverage Goals

- **Critical Paths**: 90%+ coverage
- **Business Logic**: 80%+ coverage
- **UI Components**: 70%+ coverage
- **Overall**: 75%+ coverage

## 🔧 Test Setup

### Backend Test Setup

The backend test setup (`backend/src/__tests__/setup.ts`) includes:

- Prisma client configured for test database
- Database cleanup before/after tests
- Test database connection

### Frontend Test Setup

The frontend test setup (`frontend/jest.setup.js`) includes:

- `@testing-library/jest-dom` matchers
- Mock implementations for Next.js modules
- Global test utilities

## 📦 Mocking External Services

### Payment Gateways

Payment gateway tests use mocks to avoid actual API calls:

```typescript
jest.mock('../services/razorpayService');
jest.mock('../services/phonepeService');
```

### Email Service

Email service tests mock nodemailer:

```typescript
jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
```

### Shiprocket API

Shiprocket tests mock API client:

```typescript
jest.mock('../modules/shiprocket/services/apiClient');
```

## 🧪 Integration Test Scenarios

### Payment Flow

1. Create test order
2. Initiate payment
3. Verify payment signature
4. Handle webhook
5. Verify order status updated
6. Verify transaction logged

### Shipping Flow

1. Create order with shipping address
2. Create Shiprocket order
3. Generate shipping label
4. Schedule pickup
5. Track shipment
6. Handle webhook updates

### Email Flow

1. Send email
2. Verify email logged
3. Verify email sent
4. Test failed email handling
5. Test retry mechanism

## 🔍 Debugging Tests

### Backend

```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test
npm test -- --testNamePattern="should login"

# Debug with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend

```bash
# Run tests with verbose output
npm test -- --verbose

# Run in watch mode for iterative development
npm run test:watch

# Debug specific test
npm test -- --testNamePattern="should render"
```

## 📊 Coverage Reports

### View Coverage

After running `npm run test:coverage`:

- **Backend**: Open `backend/coverage/index.html`
- **Frontend**: Open `frontend/coverage/index.html`

### Coverage Thresholds

Configure coverage thresholds in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 75,
    functions: 75,
    lines: 75,
    statements: 75,
  },
},
```

## 🐛 Common Issues

### Database Connection Errors

Ensure test database is running:

```bash
# Start test database
docker-compose up -d postgres

# Or use test database URL
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ulica_test?schema=public npm test
```

### Module Not Found Errors

Clear Jest cache:

```bash
npm test -- --clearCache
```

### Timeout Errors

Increase test timeout in `jest.config.js`:

```javascript
testTimeout: 30000, // 30 seconds
```

## 🚀 CI/CD Integration

Tests run automatically on:

- Pull requests
- Pushes to `main` branch
- Pushes to `develop` branch

See `.github/workflows/ci.yml` for CI configuration.

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

