import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import productsRouter from '../../backend/src/routes/products';
import { authenticateToken } from '../../backend/src/middlewares/auth';

// Mock Prisma
jest.mock('@prisma/client');
jest.mock('../../backend/src/middlewares/auth');

const MockedPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>;
const mockAuthenticateToken = authenticateToken as jest.MockedFunction<typeof authenticateToken>;

describe('Products API Routes', () => {
  let app: express.Application;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/products', productsRouter);
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

  describe('GET /api/products', () => {
    it('should return paginated products with default parameters', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'Test Product 1',
          slug: 'test-product-1',
          price: 100,
          description: 'Test description',
          isActive: true,
          isFeatured: false,
          categoryId: 'cat-1',
          images: [],
          variants: [{ id: 'var-1', price: 100, stock: 10 }],
          _count: { reviews: 0 },
          wishlistItems: []
        }
      ];

      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts as any);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 1 } });

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'Test Product 1',
          slug: 'test-product-1',
          price: 100,
          description: 'Test description',
          isActive: true,
          isFeatured: false,
          categoryId: 'cat-1',
          images: [],
          variants: [{ id: 'var-1', price: 100, stock: 10 }],
          _count: { reviews: 0 },
          wishlistItems: []
        }
      ];

      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts as any);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 1 } });

      const response = await request(app)
        .get('/api/products?category=cat-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat-1'
          })
        })
      );
    });

    it('should search products by query', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'Test Product 1',
          slug: 'test-product-1',
          price: 100,
          description: 'Test description',
          isActive: true,
          isFeatured: false,
          categoryId: 'cat-1',
          images: [],
          variants: [{ id: 'var-1', price: 100, stock: 10 }],
          _count: { reviews: 0 },
          wishlistItems: []
        }
      ];

      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts as any);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 1 } });

      const response = await request(app)
        .get('/api/products?search=test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
              { tags: { contains: 'test', mode: 'insensitive' } }
            ])
          })
        })
      );
    });

    it('should filter featured products', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'Featured Product',
          slug: 'featured-product',
          price: 100,
          description: 'Featured description',
          isActive: true,
          isFeatured: true,
          categoryId: 'cat-1',
          images: [],
          variants: [{ id: 'var-1', price: 100, stock: 10 }],
          _count: { reviews: 0 },
          wishlistItems: []
        }
      ];

      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts as any);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 1 } });

      const response = await request(app)
        .get('/api/products?featured=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isFeatured: true
          })
        })
      );
    });

    it('should handle server errors gracefully', async () => {
      mockPrisma.product.count.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/products')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch products');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by ID', async () => {
      const mockProduct = {
        id: '1',
        title: 'Test Product',
        slug: 'test-product',
        price: 100,
        description: 'Test description',
        isActive: true,
        isFeatured: false,
        categoryId: 'cat-1',
        images: [{ url: 'image.jpg', altText: 'Product image' }],
        variants: [{ id: 'var-1', price: 100, stock: 10 }],
        _count: { reviews: 5 }
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct as any);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.2 }, _count: { rating: 5 } });

      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.id).toBe('1');
      expect(response.body.data.product.title).toBe('Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/products/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('POST /api/products (Admin only)', () => {
    beforeEach(() => {
      mockAuthenticateToken.mockImplementation((req, res, next) => {
        req.user = { id: 'admin-user-id', role: 'admin' };
        next();
      });
    });

    it('should create a new product', async () => {
      const newProduct = {
        title: 'New Product',
        slug: 'new-product',
        description: 'New product description',
        price: 150,
        categoryId: 'cat-1',
        variants: [{ title: 'Default', price: 150, stock: 20 }]
      };

      const mockCreatedProduct = {
        id: 'new-id',
        ...newProduct,
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.product.create.mockResolvedValue(mockCreatedProduct as any);

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.title).toBe('New Product');
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Product',
            variants: {
              create: expect.arrayContaining([
                expect.objectContaining({
                  title: 'Default',
                  price: 150,
                  stock: 20
                })
              ])
            }
          })
        })
      );
    });

    it('should return 403 for non-admin users', async () => {
      mockAuthenticateToken.mockImplementation((req, res, next) => {
        req.user = { id: 'user-id', role: 'customer' };
        next();
      });

      const newProduct = {
        title: 'New Product',
        slug: 'new-product',
        description: 'New product description',
        price: 150,
        categoryId: 'cat-1'
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should validate required fields', async () => {
      const incompleteProduct = {
        title: 'Incomplete Product'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/products')
        .send(incompleteProduct)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });
  });
});
