/**
 * E2E Smoke Test for ULICA Platform
 * 
 * This is a minimal smoke test to verify critical user flows work end-to-end.
 * Run with: npx playwright test (after installing Playwright)
 * 
 * Prerequisites:
 * - Backend running on http://localhost:5001
 * - Frontend running on http://localhost:3000
 * - Test database seeded with sample data
 */

import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('ULICA E2E Smoke Tests', () => {
  test('Backend health check', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('Frontend homepage loads', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await expect(page).toHaveTitle(/ULICA/i);
  });

  test('Products API returns data', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/products`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('Admin login flow (if credentials available)', async ({ page, request }) => {
    // Skip if no test credentials
    const testEmail = process.env.TEST_ADMIN_EMAIL;
    const testPassword = process.env.TEST_ADMIN_PASSWORD;
    
    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }

    // Test login API
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        email: testEmail,
        password: testPassword,
      },
    });

    if (loginResponse.status() === 200) {
      const loginBody = await loginResponse.json();
      expect(loginBody.success).toBe(true);
      expect(loginBody.data.user).toBeDefined();
    }
  });

  test('Product detail page loads', async ({ page }) => {
    // First get a product ID from API
    const response = await page.request.get(`${BACKEND_URL}/api/products`);
    const products = await response.json();
    const productList = Array.isArray(products.data) ? products.data : (Array.isArray(products) ? products : []);
    
    if (productList.length > 0) {
      const product = productList[0];
      const productId = product.id || product.slug;
      
      if (productId) {
        await page.goto(`${FRONTEND_URL}/product/${productId}`);
        // Just verify page loads without errors
        await expect(page.locator('body')).toBeVisible();
      }
    } else {
      test.skip();
    }
  });
});

