# 🧪 ULICA Testing Guide

This document provides comprehensive information about the testing setup for the ULICA e-commerce application.

## 📋 Table of Contents

- [Testing Overview](#testing-overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [CI/CD Pipeline](#cicd-pipeline)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Troubleshooting](#troubleshooting)

## 🎯 Testing Overview

The ULICA project uses a comprehensive testing strategy with:

- **Jest** as the primary testing framework
- **Supertest** for API testing
- **React Testing Library** for component testing
- **Jest DOM** for DOM assertions
- **GitHub Actions** for CI/CD pipeline

## 📁 Test Structure

```
/tests/
├── routes/           # Backend API route tests
│   ├── products.test.ts
│   └── cart.test.ts
├── auth/             # Authentication tests
│   └── auth.test.ts
├── components/       # Frontend component tests
│   └── Button.test.tsx
└── integration/      # Integration tests
    └── health-check.test.ts

/backend/src/__tests__/  # Backend-specific tests
/frontend/__tests__/     # Frontend-specific tests
```

## 🚀 Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm run install:all
```

2. Set up test database:
```bash
# For PostgreSQL (recommended)
createdb ulica_test

# Or use the provided test environment
cp env.test .env.test
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run specific test file
npx jest tests/routes/products.test.ts

# Run tests matching pattern
npx jest --testNamePattern="should return products"
```

### Environment Setup

The tests use different configurations:

- **Backend**: Node.js environment with mocked Prisma
- **Frontend**: jsdom environment with mocked Next.js components
- **Integration**: Full environment with test database

## 🧪 Test Categories

### 1. Backend API Tests (`/tests/routes/`)

Tests for all API endpoints:

- **Products API**: CRUD operations, filtering, pagination
- **Cart API**: Add/remove items, checkout process
- **Auth API**: Login, register, password reset
- **Orders API**: Order creation, status updates
- **Admin API**: Admin-only operations

Example:
```typescript
describe('Products API Routes', () => {
  it('should return paginated products', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.products).toBeDefined();
  });
});
```

### 2. Authentication Tests (`/tests/auth/`)

Tests for authentication flows:

- User registration and validation
- Login with various scenarios
- Password reset functionality
- JWT token management
- Role-based access control

### 3. Component Tests (`/tests/components/`)

Tests for React components:

- Component rendering
- User interactions
- Props handling
- Accessibility features
- Styling and classes

Example:
```typescript
describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
});
```

### 4. Integration Tests (`/tests/integration/`)

Tests for system integration:

- Database connectivity
- Health checks
- End-to-end workflows
- External service integration

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) includes:

### Pipeline Stages

1. **🔍 Lint & Type Check**
   - ESLint validation
   - TypeScript type checking
   - Code formatting verification

2. **🏗️ Build**
   - Backend compilation
   - Frontend build
   - Artifact generation

3. **🧪 Test Suite**
   - Unit tests
   - Integration tests
   - Coverage reporting
   - PostgreSQL test database

4. **🔒 Security Scan**
   - npm audit
   - Snyk vulnerability scan
   - Dependency security check

5. **⚡ Performance Tests**
   - Lighthouse CI
   - Bundle size analysis
   - Performance metrics

6. **🐳 Docker Build**
   - Container image creation
   - Container health checks

7. **🚀 Deployment**
   - Staging deployment (develop branch)
   - Production deployment (main branch)
   - AWS Elastic Beanstalk integration

### Environment Variables

Required GitHub Secrets:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
S3_BUCKET

# Security
SNYK_TOKEN
LHCI_GITHUB_APP_TOKEN

# Notifications
SLACK_WEBHOOK_URL
```

## ✍️ Writing Tests

### Backend API Tests

```typescript
import request from 'supertest';
import express from 'express';

describe('API Route', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    // Setup middleware and routes
  });

  it('should handle request correctly', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' })
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component prop="value" />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Best Practices

1. **Arrange-Act-Assert Pattern**:
   ```typescript
   it('should do something', () => {
     // Arrange
     const input = 'test data';
     
     // Act
     const result = functionUnderTest(input);
     
     // Assert
     expect(result).toBe('expected output');
   });
   ```

2. **Descriptive Test Names**:
   ```typescript
   // Good
   it('should return 404 when product ID does not exist')
   
   // Bad
   it('should work')
   ```

3. **Mock External Dependencies**:
   ```typescript
   jest.mock('@prisma/client');
   const mockPrisma = new MockedPrismaClient();
   ```

4. **Clean Up After Tests**:
   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

## 📊 Test Coverage

Coverage reports are generated for:

- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of conditional branches taken
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

### Coverage Commands

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

### Coverage Targets

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   ```bash
   # Ensure PostgreSQL is running
   pg_ctl start
   
   # Create test database
   createdb ulica_test
   ```

2. **Port Conflicts**:
   ```bash
   # Kill processes on ports
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

3. **Memory Issues**:
   ```bash
   # Increase Node.js memory
   NODE_OPTIONS="--max-old-space-size=4096" npm test
   ```

4. **Test Timeout Issues**:
   ```typescript
   // Increase timeout for specific tests
   it('should complete long operation', async () => {
     // test code
   }, 10000); // 10 second timeout
   ```

### Debug Mode

```bash
# Run tests in debug mode
npm test -- --verbose

# Run specific test with debug output
npx jest tests/routes/products.test.ts --verbose
```

### Environment Variables

Ensure test environment variables are set:

```bash
# Copy test environment
cp env.test .env.test

# Load test environment
source .env.test
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🤝 Contributing

When adding new tests:

1. Follow the existing test structure
2. Write descriptive test names
3. Include both positive and negative test cases
4. Mock external dependencies
5. Ensure tests are isolated and repeatable
6. Update this documentation if needed

## 📞 Support

For testing-related issues:

1. Check this documentation
2. Review existing test examples
3. Check CI/CD pipeline logs
4. Create an issue with test details and error messages
