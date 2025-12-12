import { prisma } from './setup';
import {
  authenticateShiprocket,
  createShiprocketOrder,
  generateLabel,
  schedulePickup,
  trackShipment,
} from '../modules/shiprocket/services/shippingService';
import { ensureCredentials } from '../modules/shiprocket/utils/config';

// Mock Shiprocket API calls
jest.mock('../modules/shiprocket/services/apiClient', () => ({
  makeRequest: jest.fn((endpoint: string) => {
    // Mock responses based on endpoint
    if (endpoint.includes('/auth/login')) {
      return Promise.resolve({
        token: 'mock-shiprocket-token',
        expires: new Date(Date.now() + 3600000),
      });
    }
    if (endpoint.includes('/orders/create')) {
      return Promise.resolve({
        order_id: 12345,
        shipment_id: 67890,
        status: 'NEW',
      });
    }
    if (endpoint.includes('/courier/generate/label')) {
      return Promise.resolve({
        label_url: 'https://example.com/label.pdf',
        status: 'SUCCESS',
      });
    }
    if (endpoint.includes('/courier/generate/pickup')) {
      return Promise.resolve({
        pickup_status: 'SCHEDULED',
        pickup_date: new Date().toISOString(),
      });
    }
    if (endpoint.includes('/courier/track')) {
      return Promise.resolve({
        tracking_data: {
          awb_code: 'AWB123',
          status: 'In Transit',
          current_status: 'PICKED_UP',
        },
      });
    }
    return Promise.resolve({});
  }),
}));

describe('Shiprocket Integration Tests', () => {
  let testOrder: any;
  let testUser: any;

  beforeAll(async () => {
    // Create test user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('test123', 12);
    testUser = await prisma.user.create({
      data: {
        email: 'shiprocket-test@example.com',
        password: hashedPassword,
        name: 'Shiprocket Test User',
        role: 'customer',
        isActive: true,
      },
    });

    // Create test product and variant
    const category = await prisma.category.create({
      data: { name: 'Test', slug: 'test' },
    });

    const product = await prisma.product.create({
      data: {
        title: 'Test Product',
        slug: 'test-product',
        price: 1000,
        categoryId: category.id,
      },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        title: 'Test Variant',
        price: 1000,
        stockQty: 100,
        isActive: true,
        options: {}, // required JSON field
      },
    });

    // Create test order with shipping address
    testOrder = await prisma.order.create({
      data: {
        orderNumber: `SR-ORD-${Date.now()}`,
        userId: testUser.id,
        totalAmount: 1000,
        subtotal: 1000,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        status: 'confirmed',
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            title: 'Test Product',
            price: 1000,
            quantity: 1,
            total: 1000,
          },
        },
        addresses: {
          create: {
            type: 'shipping',
            firstName: 'Test',
            lastName: 'User',
            address1: '123 Test Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
            phone: '+919876543210',
          },
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        addresses: true,
        user: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  });

  describe('Shiprocket Authentication', () => {
    it('should authenticate with Shiprocket API', async () => {
      const token = await authenticateShiprocket();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should handle authentication failure gracefully', async () => {
      await expect(authenticateShiprocket()).rejects.toThrow();
    });
  });

  describe('Shiprocket Order Creation', () => {
    it('should create Shiprocket order successfully', async () => {
      const result = await createShiprocketOrder(testOrder.id);

      expect(result).toBeDefined();
      expect(result.order.shiprocketShipmentId).toBeDefined();

      // Verify order was updated
      const updatedOrder = await prisma.order.findUnique({
        where: { id: testOrder.id },
      });

      expect(updatedOrder?.shiprocketShipmentId).toBeDefined();
    });

    it('should handle missing shipping address gracefully', async () => {
      const orderWithoutAddress = await prisma.order.create({
        data: {
          orderNumber: `SR-ORD-NO-ADDR-${Date.now()}`,
          userId: testUser.id,
          totalAmount: 1000,
          subtotal: 1000,
          paymentMethod: 'razorpay',
          paymentStatus: 'paid',
          status: 'confirmed',
        },
      });

      await expect(createShiprocketOrder(orderWithoutAddress.id)).rejects.toThrow();
    });
  });

  describe('Shiprocket Label Generation', () => {
    it('should generate shipping label', async () => {
      // First create shipment
      await createShiprocketOrder(testOrder.id);

      const result = await generateLabel(testOrder.id);

      expect(result).toBeDefined();
      expect(result.labelUrl).toBeDefined();

      // Verify order was updated with label URL
      const updatedOrder = await prisma.order.findUnique({
        where: { id: testOrder.id },
      });

      expect(updatedOrder?.labelUrl).toBeDefined();
    });
  });

  describe('Shiprocket Pickup Scheduling', () => {
    it('should schedule pickup successfully', async () => {
      // First create shipment
      await createShiprocketOrder(testOrder.id);

      const result = await schedulePickup(testOrder.id, {
        pickupDate: new Date().toISOString(),
        pickupTime: '10:00-18:00',
      });

      expect(result).toBeDefined();
      expect(result.order.pickupStatus).toBeDefined();
    });
  });

  describe('Shiprocket Tracking', () => {
    it('should track shipment by AWB', async () => {
      const awbCode = 'AWB123456';

      const result = await trackShipment(awbCode);

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });
  });

  describe('Shiprocket Credentials', () => {
    it('should check for credentials availability', async () => {
      // This should work if credentials are in .env
      const hasCreds = await ensureCredentials(false);

      // Should return null if not configured, or config if available
      expect(hasCreds === null || typeof hasCreds === 'object').toBe(true);
    });

    it('should throw error when credentials required but missing', async () => {
      // This will throw if credentials are not configured
      await expect(ensureCredentials(true)).rejects.toThrow();
    });
  });
});

