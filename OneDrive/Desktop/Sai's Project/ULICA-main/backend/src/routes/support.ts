import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import Joi from 'joi';
import {
  createSupportTicket,
  getSupportTickets,
  getSupportTicket,
  updateSupportTicket,
  addTicketResponse,
  getSupportStats,
  getCustomerTickets,
  assignTicket,
  closeTicket
} from '../services/supportService';
import { ExpressResponse } from '../types/express';
import { AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/support/tickets
 * Create a new support ticket
 */
router.post('/tickets',
  validate({
    body: Joi.object({
      userId: Joi.string().optional(),
      email: Joi.string().email().required(),
      subject: Joi.string().min(5).max(200).required(),
      description: Joi.string().min(10).max(2000).required(),
      category: Joi.string().valid('general', 'technical', 'billing', 'shipping', 'returns').default('general'),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const ticket = await createSupportTicket(req.body);

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  })
);

/**
 * GET /api/support/my-tickets
 * Get current user's support tickets
 */
router.get('/my-tickets',
  authenticateToken,
  validate({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').optional(),
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.SupportTicketWhereInput = { userId };
    if (status) where.status = String(status) as any;

    const [tickets, total] = await prisma.$transaction([
      prisma.supportTicket.findMany({
        where,
        include: {
          responses: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.supportTicket.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  })
);

/**
 * GET /api/support/tickets
 * Get support tickets with pagination and filters (Admin only)
 */
router.get('/tickets',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').optional(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
      category: Joi.string().valid('general', 'technical', 'billing', 'shipping', 'returns').optional(),
      assignedTo: Joi.string().optional(),
      search: Joi.string().optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { page, limit, ...filters } = req.query;
    const result = await getSupportTickets(page as any, limit as any, filters);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * GET /api/support/tickets/:id
 * Get a single support ticket
 */
router.get('/tickets/:id',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const ticket = await getSupportTicket(req.params['id'] as string);

    res.json({
      success: true,
      data: ticket
    });
  })
);

/**
 * PUT /api/support/tickets/:id
 * Update support ticket
 */
router.put('/tickets/:id',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    },
    body: Joi.object({
      status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').optional(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
      category: Joi.string().valid('general', 'technical', 'billing', 'shipping', 'returns').optional(),
      assignedTo: Joi.string().optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const ticket = await updateSupportTicket(req.params['id'] as string, req.body);

    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      data: ticket
    });
  })
);

/**
 * POST /api/support/tickets/:id/responses
 * Add response to support ticket
 */
router.post('/tickets/:id/responses',
  authenticateToken,
  validate({
    params: {
      id: Joi.string().required()
    },
    body: Joi.object({
      message: Joi.string().min(1).max(2000).required(),
      isInternal: Joi.boolean().default(false)
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const response = await addTicketResponse({
      ticketId: req.params['id'] as string,
      userId: req.user?.id || '',
      message: req.body.message,
      isInternal: req.body.isInternal
    });

    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      data: response
    });
  })
);

/**
 * GET /api/support/stats
 * Get support ticket statistics
 */
router.get('/stats',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: ExpressResponse) => {
    const stats = await getSupportStats();

    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * GET /api/support/customer/:userId/tickets
 * Get tickets for a specific customer
 */
router.get('/customer/:userId/tickets',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      userId: Joi.string().required()
    },
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10)
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { page, limit } = req.query;
    const result = await getCustomerTickets(req.params['userId'] as string, page as any, limit as any);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * PUT /api/support/tickets/:id/assign
 * Assign ticket to admin user
 */
router.put('/tickets/:id/assign',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    },
    body: Joi.object({
      assignedTo: Joi.string().required()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const ticket = await assignTicket(req.params['id'] as string, req.body.assignedTo);

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      data: ticket
    });
  })
);

/**
 * PUT /api/support/tickets/:id/close
 * Close support ticket
 */
router.put('/tickets/:id/close',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const ticket = await closeTicket(req.params['id'] as string);

    res.json({
      success: true,
      message: 'Ticket closed successfully',
      data: ticket
    });
  })
);

/**
 * GET /api/support/dashboard
 * Get support dashboard data
 */
router.get('/dashboard',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: ExpressResponse) => {
    const [
      stats,
      recentTickets,
      urgentTickets
    ] = await Promise.all([
      getSupportStats(),
      prisma.supportTicket.findMany({
        where: {
          status: { in: ['open', 'in_progress'] }
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
        take: 10
      }),
      prisma.supportTicket.findMany({
        where: {
          priority: 'urgent',
          status: { in: ['open', 'in_progress'] }
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
        orderBy: { createdAt: 'asc' },
        take: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        stats,
        recentTickets,
        urgentTickets
      }
    });
  })
);

export default router;
