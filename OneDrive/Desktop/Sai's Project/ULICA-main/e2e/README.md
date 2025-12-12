# E2E Smoke Tests

Minimal end-to-end tests to verify critical user flows work.

## Prerequisites

1. Install Playwright:
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. Start services:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

3. Set environment variables (optional):
   ```bash
   export BACKEND_URL=http://localhost:5001
   export FRONTEND_URL=http://localhost:3000
   export TEST_ADMIN_EMAIL=admin@ulica.com
   export TEST_ADMIN_PASSWORD=admin123
   ```

## Running Tests

```bash
# Run all smoke tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific test
npx playwright test smoke.test.ts
```

## Test Coverage

- ✅ Backend health check
- ✅ Frontend homepage loads
- ✅ Products API returns data
- ✅ Admin login flow (if credentials available)
- ✅ Product detail page loads

## Adding More Tests

Add new test cases to `smoke.test.ts` following the existing pattern.

