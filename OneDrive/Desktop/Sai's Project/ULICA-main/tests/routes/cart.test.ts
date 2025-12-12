import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cartRouter from '../../backend/src/routes/cart';
import { authenticateToken } from '../../backend/src/middlewares/auth';

// Mock Prisma
jest.mock('@prisma/client');
jest.mock('../../backend/src/middlewares/auth');

const MockedPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>;
const mockAuthenticateToken = authenticateToken as jest.MockedFunction<typeof authenticateToken>;

describe('Cart API Routes', () => {
  let app: express.Application;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/cart', cartRouter);
  });

  beforeEach(() => {
    mockPrisma = new MockedPrismaClient() as jest.Mocked<PrismaClient>;
    jest.clearAllMocks();
    
    // Mock authenticateToken to always pass for testing
    mockAuthenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 'test-user-id', role: 'customer' };
      next();
    });
  });

  describe('GET /api/cart', () => {
    it('should return user cart items', async () => {
      const mockCartItems = [
        {
          id: 'cart-1',
          userId: 'test-user-id',
          productId: 'product-1',
          variantId: 'variant-1',
          quantity: 2,
          product: {
            id: 'product-1',
            title: 'Test Product',
            slug: 'test-product',
            price: 100,
            images: [{ url: 'image.jpg', altText: 'Product image' }],
            variants: [{ id: 'variant-1', title: 'Size M', price: 100, stock: 10 }]
          }
        }
      ];

      mockPrisma.cartItem.findMany.mockResolvedValue(mockCartItems as any);

      const response = await request(app)
        .get('/api/cart')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].product.title).toBe('Test Product');
      expect(response.body.data.items[0].quantity).toBe(2);
    });

    it('should return empty cart for new user', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/cart')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.cartItem.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/cart')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch cart items');
    });
  });

  describe('POST /api/cart/add', () => {
    it('should add new item to cart', async () => {
      const addItemRequest = {
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 1
      };

      const mockProduct = {
        id: 'product-1',
        title: 'Test Product',
        isActive: true,
        variants: [{ id: 'variant-1', stock: 10 }]
      };

      const mockCartItem = {
        id: 'cart-1',
        userId: 'test-user-id',
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 1,
        product: mockProduct
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct as any);
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);
      mockPrisma.cartItem.create.mockResolvedValue(mockCartItem as any);

      const response = await request(app)
        .post('/api/cart/add')
        .send(addItemRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item added to cart successfully');
      expect(mockPrisma.cartItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'test-user-id',
            productId: 'product-1',
            variantId: 'variant-1',
            quantity: 1
          })
        })
      );
    });

    it('should update quantity if item already exists in cart', async () => {
      const addItemRequest = {
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 2
      };

      const mockProduct = {
        id: 'product-1',
        title: 'Test Product',
        isActive: true,
        variants: [{ id: 'variant-1', stock: 10 }]
      };

      const existingCartItem = {
        id: 'cart-1',
        userId: 'test-user-id',
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 1
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct as any);
      mockPrisma.cartItem.findFirst.mockResolvedValue(existingCartItem as any);
      mockPrisma.cartItem.update.mockResolvedValue({
        ...existingCartItem,
        quantity: 3
      } as any);

      const response = await request(app)
        .post('/api/cart/add')
        .send(addItemRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cart-1' },
          data: { quantity: 3 }
        })
      );
    });

    it('should return 400 for invalid product ID', async () => {
      const addItemRequest = {
        productId: 'non-existent',
        variantId: 'variant-1',
        quantity: 1
      };

      mockPrisma.product.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/cart/add')
        .send(addItemRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Product not found');
    });

    it('should return 400 for insufficient stock', async () => {
      const addItemRequest = {
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 15
      };

      const mockProduct = {
        id: 'product-1',
        title: 'Test Product',
        isActive: true,
        variants: [{ id: 'variant-1', stock: 10 }]
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct as any);

      const response = await request(app)
        .post('/api/cart/add')
        .send(addItemRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient stock');
    });

    it('should validate required fields', async () => {
      const invalidRequest = {
        productId: 'product-1'
        // Missing variantId and quantity
      };

      const response = await request(app)
        .post('/api/cart/add')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });
  });

  describe('PUT /api/cart/:id', () => {
    it('should update cart item quantity', async () => {
      const updateRequest = {
        quantity: 5
      };

      const mockCartItem = {
        id: 'cart-1',
        userId: 'test-user-id',
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 5
      };

      mockPrisma.cartItem.findUnique.mockResolvedValue(mockCartItem as any);
      mockPrisma.cartItem.update.mockResolvedValue(mockCartItem as any);

      const response = await request(app)
        .put('/api/cart/cart-1')
        .send(updateRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cart item updated successfully');
      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cart-1' },
          data: { quantity: 5 }
        })
      );
    });

    it('should return 404 for non-existent cart item', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue(null);

      const updateRequest = {
        quantity: 5
      };

      const response = await request(app)
        .put('/api/cart/non-existent')
        .send(updateRequest)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Cart item not found');
    });

    it('should prevent unauthorized access to other users cart items', async () => {
      const otherUserCartItem = {
        id: 'cart-1',
        userId: 'other-user-id',
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 1
      };

      mockPrisma.cartItem.findUnique.mockResolvedValue(otherUserCartItem as any);

      const updateRequest = {
        quantity: 5
      };

      const response = await request(app)
        .put('/api/cart/cart-1')
        .send(updateRequest)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized access to cart item');
    });
  });

  describe('DELETE /api/cart/:id', () => {
    it('should remove item from cart', async () => {
      const mockCartItem = {
        id: 'cart-1',
        userId: 'test-user-id',
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 1
      };

      mockPrisma.cartItem.findUnique.mockResolvedValue(mockCartItem as any);
      mockPrisma.cartItem.delete.mockResolvedValue(mockCartItem as any);

      const response = await request(app)
        .delete('/api/cart/cart-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item removed from cart successfully');
      expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'cart-1' }
      });
    });

    it('should return 404 for non-existent cart item', async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/cart/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Cart item not found');
    });
  });

  describe('POST /api/cart/checkout', () => {
    it('should process cart checkout', async () => {
      const checkoutRequest = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        paymentMethod: 'razorpay'
      };

      const mockCartItems = [
        {
          id: 'cart-1',
          userId: 'test-user-id',
          productId: 'product-1',
          variantId: 'variant-1',
          quantity: 2,
          product: {
            id: 'product-1',
            title: 'Test Product',
            price: 100,
            variants: [{ id: 'variant-1', price: 100, stock: 10 }]
          }
        }
      ];

      const mockOrder = {
        id: 'order-1',
        orderNumber: 'ORD-123',
        userId: 'test-user-id',
        status: 'pending',
        totalAmount: 200,
        items: []
      };

      mockPrisma.cartItem.findMany.mockResolvedValue(mockCartItems as any);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
            update: jest.fn().mockResolvedValue({ ...mockOrder, status: 'confirmed' })
          },
          orderItem: {
            create: jest.fn().mockResolvedValue({})
          },
          cartItem: {
            deleteMany: jest.fn().mockResolvedValue({})
          }
        };
        return callback(mockTx as any);
      });

      const response = await request(app)
        .post('/api/cart/checkout')
        .send(checkoutRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.orderNumber).toBe('ORD-123');
      expect(response.body.data.paymentOrder).toBeDefined();
    });

    it('should return 400 for empty cart checkout', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([]);

      const checkoutRequest = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        paymentMethod: 'razorpay'
      };

      const response = await request(app)
        .post('/api/cart/checkout')
        .send(checkoutRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Cart is empty');
    });
  });
});
