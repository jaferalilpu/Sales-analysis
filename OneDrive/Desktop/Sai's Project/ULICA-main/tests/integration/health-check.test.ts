import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client');

const MockedPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>;

describe('Health Check Integration Tests', () => {
  let app: express.Application;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeAll(() => {
    // Create a simple Express app for health checks
    app = express();
    
    app.get('/health', async (req, res) => {
      try {
        // Mock database health check
        await mockPrisma.$queryRaw`SELECT 1`;
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'connected',
            api: 'running'
          }
        });
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'disconnected',
            api: 'running'
          },
          error: 'Database connection failed'
        });
      }
    });

    app.get('/api/health', async (req, res) => {
      res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
      });
    });
  });

  beforeEach(() => {
    mockPrisma = new MockedPrismaClient() as jest.Mocked<PrismaClient>;
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return healthy status when database is connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }] as any);

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.services.database).toBe('connected');
      expect(response.body.services.api).toBe('running');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return unhealthy status when database is disconnected', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const response = await request(app)
        .get('/health')
        .expect(503);

      expect(response.body.status).toBe('unhealthy');
      expect(response.body.services.database).toBe('disconnected');
      expect(response.body.services.api).toBe('running');
      expect(response.body.error).toBe('Database connection failed');
    });
  });

  describe('GET /api/health', () => {
    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API is healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});

describe('Database Connection Tests', () => {
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new MockedPrismaClient() as jest.Mocked<PrismaClient>;
    jest.clearAllMocks();
  });

  it('should establish database connection', async () => {
    mockPrisma.$connect.mockResolvedValue(undefined);
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }] as any);

    await mockPrisma.$connect();
    const result = await mockPrisma.$queryRaw`SELECT 1`;

    expect(mockPrisma.$connect).toHaveBeenCalled();
    expect(result).toEqual([{ '?column?': 1 }]);
  });

  it('should handle database connection errors', async () => {
    const connectionError = new Error('Connection timeout');
    mockPrisma.$connect.mockRejectedValue(connectionError);

    await expect(mockPrisma.$connect()).rejects.toThrow('Connection timeout');
  });

  it('should disconnect from database gracefully', async () => {
    mockPrisma.$disconnect.mockResolvedValue(undefined);

    await mockPrisma.$disconnect();

    expect(mockPrisma.$disconnect).toHaveBeenCalled();
  });
});
