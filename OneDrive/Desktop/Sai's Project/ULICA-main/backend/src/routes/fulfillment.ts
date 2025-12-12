import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import Joi from 'joi';
import {
  updateFulfillmentStatus,
  bulkUpdateFulfillmentStatus,
  getFulfillmentStatus,
  getOrdersByFulfillmentStatus,
  getFulfillmentStats,
  generateShippingLabel,
  bulkGenerateShippingLabels
} from '../services/fulfillmentService';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * PUT /api/fulfillment/status
 * Update order fulfillment status
 */
router.put('/status',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      orderId: Joi.string().required(),
      status: Joi.string().valid('picked', 'packed', 'shipped', 'delivered').required(),
      userId: Joi.string().optional(),
      trackingNumber: Joi.string().optional(),
      carrier: Joi.string().optional(),
      notes: Joi.string().optional()
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const order = await updateFulfillmentStatus(req.body);
    
    res.json({
      success: true,
      message: 'Fulfillment status updated successfully',
      data: order
    });
  })
);

/**
 * PUT /api/fulfillment/bulk-status
 * Bulk update fulfillment status
 */
router.put('/bulk-status',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      orderIds: Joi.array().items(Joi.string()).min(1).max(100).required(),
      status: Joi.string().valid('picked', 'packed', 'shipped', 'delivered').required(),
      userId: Joi.string().optional(),
      trackingNumber: Joi.string().optional(),
      carrier: Joi.string().optional(),
      notes: Joi.string().optional()
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const result = await bulkUpdateFulfillmentStatus(req.body);
    
    res.json({
      success: true,
      message: `Bulk update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      data: result
    });
  })
);

/**
 * GET /api/fulfillment/status/:orderId
 * Get fulfillment status for an order
 */
router.get('/status/:orderId',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      orderId: Joi.string().required()
    }
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const orderId = req.params['orderId'];
    if (!orderId) {
      throw new CustomError('Order ID is required', 400);
    }
    const order = await getFulfillmentStatus(orderId);
    
    res.json({
      success: true,
      data: order
    });
  })
);

/**
 * GET /api/fulfillment/orders
 * Get orders by fulfillment status
 */
router.get('/orders',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      status: Joi.string().valid('unfulfilled', 'picked', 'packed', 'shipped', 'delivered').required(),
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10)
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { status, page, limit } = req.query;
    const statusFilter = typeof status === 'string' ? status : undefined;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    if (!statusFilter) {
      throw new CustomError('Status filter is required', 400);
    }
    const result = await getOrdersByFulfillmentStatus(statusFilter, pageNum, limitNum);
    
    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * GET /api/fulfillment/stats
 * Get fulfillment dashboard statistics
 */
router.get('/stats',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: express.Request, res: express.Response) => {
    const stats = await getFulfillmentStats();
    
    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * POST /api/fulfillment/shipping-label/:orderId
 * Generate shipping label for an order
 */
router.post('/shipping-label/:orderId',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      orderId: Joi.string().required()
    }
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const orderId = req.params['orderId'];
    if (!orderId) {
      throw new CustomError('Order ID is required', 400);
    }
    const result = await generateShippingLabel(orderId);
    
    res.json({
      success: true,
      message: 'Shipping label generated successfully',
      data: result
    });
  })
);

/**
 * POST /api/fulfillment/bulk-shipping-labels
 * Generate shipping labels for multiple orders
 */
router.post('/bulk-shipping-labels',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      orderIds: Joi.array().items(Joi.string()).min(1).max(50).required()
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const result = await bulkGenerateShippingLabels(req.body.orderIds);
    
    res.json({
      success: true,
      message: `Bulk label generation completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      data: result
    });
  })
);

/**
 * GET /api/fulfillment/dashboard
 * Get fulfillment dashboard data
 */
router.get('/dashboard',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: express.Request, res: express.Response) => {
    const [
      stats,
      recentOrders,
      urgentOrders
    ] = await Promise.all([
      getFulfillmentStats(),
      prisma.order.findMany({
        where: {
          fulfillmentStatus: { in: ['picked', 'packed', 'shipped'] }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          fulfillment: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),
      prisma.order.findMany({
        where: {
          fulfillmentStatus: 'unfulfilled',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);
    
    res.json({
      success: true,
      data: {
        stats,
        recentOrders,
        urgentOrders
      }
    });
  })
);

export default router;
