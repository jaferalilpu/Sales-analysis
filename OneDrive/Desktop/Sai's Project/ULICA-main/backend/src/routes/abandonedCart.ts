import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { ExpressResponse } from '../types/express';
import Joi from 'joi';
import {
  trackAbandonedCart,
  getAbandonedCartsForReminder,
  markCartAsRecovered,
  getAbandonedCartStats,
  getAbandonedCart,
  cleanupOldAbandonedCarts,
  getRecoveryCampaigns,
  sendRecoveryEmail,
  bulkSendRecoveryEmails
} from '../services/abandonedCartService';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/abandoned-cart/track
 * Track abandoned cart
 */
router.post('/track',
  validate({
    body: Joi.object({
      userId: Joi.string().optional(),
      email: Joi.string().email().required(),
      items: Joi.array().items(Joi.object()).required(),
      totalAmount: Joi.number().min(0).required()
    })
  }),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const cart = await trackAbandonedCart(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Abandoned cart tracked successfully',
      data: cart
    });
  })
);

/**
 * GET /api/abandoned-cart/reminders
 * Get abandoned carts for email reminders
 */
router.get('/reminders',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      hoursSinceLastActivity: Joi.number().min(1).default(24),
      maxReminders: Joi.number().min(1).max(10).default(3)
    })
  }),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const hoursSinceLastActivity = Number(req.query['hoursSinceLastActivity'] ?? 24);
    const maxReminders = Number(req.query['maxReminders'] ?? 3);
    const carts = await getAbandonedCartsForReminder(hoursSinceLastActivity, maxReminders);
    
    res.json({
      success: true,
      data: carts
    });
  })
);

/**
 * PUT /api/abandoned-cart/:id/recover
 * Mark cart as recovered
 */
router.put('/:id/recover',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    }
  }),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const cartId = req.params['id'];
    if (!cartId) {
      return res.status(400).json({ success: false, message: 'Cart ID is required' });
    }
    const cart = await markCartAsRecovered(cartId);
    
    return res.json({
      success: true,
      message: 'Cart marked as recovered',
      data: cart
    });
  })
);

/**
 * GET /api/abandoned-cart/stats
 * Get abandoned cart statistics
 */
router.get('/stats',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: express.Request, res: ExpressResponse) => {
    const stats = await getAbandonedCartStats();
    
    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * GET /api/abandoned-cart/:id
 * Get abandoned cart details
 */
router.get('/:id',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    }
  }),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const cartId = req.params['id'];
    if (!cartId) {
      return res.status(400).json({ success: false, message: 'Cart ID is required' });
    }
    const cart = await getAbandonedCart(cartId);
    
    return res.json({
      success: true,
      data: cart
    });
  })
);

/**
 * DELETE /api/abandoned-cart/cleanup
 * Cleanup old abandoned carts
 */
router.delete('/cleanup',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      daysOld: Joi.number().min(1).max(365).default(30)
    })
  }),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const daysOld = Number(req.query['daysOld'] ?? 30);
    const result = await cleanupOldAbandonedCarts(daysOld);
    
    res.json({
      success: true,
      message: `Cleaned up ${result.count} old abandoned carts`,
      data: result
    });
  })
);

/**
 * GET /api/abandoned-cart/campaigns
 * Get recovery campaign data
 */
router.get('/campaigns',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: express.Request, res: ExpressResponse) => {
    const campaigns = await getRecoveryCampaigns();
    
    res.json({
      success: true,
      data: campaigns
    });
  })
);

/**
 * POST /api/abandoned-cart/:id/send-email
 * Send recovery email
 */
router.post('/:id/send-email',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    },
    body: Joi.object({
      templateType: Joi.string().valid('first', 'second', 'final').required()
    })
  }),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const cartId = req.params['id'];
    if (!cartId) {
      return res.status(400).json({ success: false, message: 'Cart ID is required' });
    }
    const result = await sendRecoveryEmail(cartId, req.body.templateType);
    
    return res.json({
      success: true,
      message: 'Recovery email sent successfully',
      data: result
    });
  })
);

/**
 * POST /api/abandoned-cart/bulk-send-emails
 * Send recovery emails to multiple carts
 */
router.post('/bulk-send-emails',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      cartIds: Joi.array().items(Joi.string()).min(1).max(100).required(),
      templateType: Joi.string().valid('first', 'second', 'final').required()
    })
  }),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const result = await bulkSendRecoveryEmails(req.body.cartIds, req.body.templateType);
    
    res.json({
      success: true,
      message: `Bulk email sending completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      data: result
    });
  })
);

/**
 * GET /api/abandoned-cart/dashboard
 * Get abandoned cart dashboard data
 */
router.get('/dashboard',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: express.Request, res: ExpressResponse) => {
    const [
      stats,
      recentAbandonments,
      topValueCarts
    ] = await Promise.all([
      getAbandonedCartStats(),
      prisma.abandonedCart.findMany({
        where: { recovered: false },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),
      prisma.abandonedCart.findMany({
        where: { recovered: false },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { totalAmount: 'desc' },
        take: 10
      })
    ]);
    
    res.json({
      success: true,
      data: {
        stats,
        recentAbandonments: recentAbandonments.map(cart => ({
          ...cart,
          items: typeof cart.items === 'string' && cart.items
            ? JSON.parse(cart.items as unknown as string)
            : cart.items
        })),
        topValueCarts: topValueCarts.map(cart => ({
          ...cart,
          items: typeof cart.items === 'string' && cart.items
            ? JSON.parse(cart.items as unknown as string)
            : cart.items
        }))
      }
    });
  })
);

export default router;
