import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { ExpressResponse } from '../types/express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Prisma } from '@prisma/client';
import Joi from 'joi';
import {
  calculateCohortAnalysis,
  calculateCustomerLTV,
  getAllCustomerLTV,
  trackFunnelStep,
  getFunnelAnalysis,
  createCustomReport,
  getCustomReports,
  executeCustomReport,
  getAnalyticsDashboard
} from '../services/analyticsService';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/analytics/dashboard
 * Get analytics dashboard data
 */
router.get('/dashboard',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: ExpressResponse) => {
    const dashboard = await getAnalyticsDashboard();
    
    res.json({
      success: true,
      data: dashboard
    });
  })
);

/**
 * GET /api/analytics/cohort
 * Get cohort analysis data
 */
router.get('/cohort',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(String(startDate)) : new Date();
    const end = endDate ? new Date(String(endDate)) : new Date();
    const cohortData = await calculateCohortAnalysis(start, end);
    
    return res.json({
      success: true,
      data: cohortData
    });
  })
);

/**
 * GET /api/analytics/ltv
 * Get customer lifetime value data
 */
router.get('/ltv',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(20),
      segment: Joi.string().valid('high_value', 'medium_value', 'low_value').optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { page, limit, segment } = req.query;
    const pageNum = page ? Number(page) : undefined;
    const limitNum = limit ? Number(limit) : undefined;
    const segmentStr = segment ? String(segment) : undefined;
    const ltvData = await getAllCustomerLTV(pageNum, limitNum, segmentStr);
    
    return res.json({
      success: true,
      data: ltvData
    });
  })
);

/**
 * POST /api/analytics/ltv/:userId
 * Calculate LTV for specific customer
 */
router.post('/ltv/:userId',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      userId: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.params['userId'];
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    const ltvData = await calculateCustomerLTV(userId);
    
    if (!ltvData) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or has no orders'
      });
    }
    
    return res.json({
      success: true,
      data: ltvData
    });
  })
);

/**
 * POST /api/analytics/funnel/track
 * Track funnel step
 */
router.post('/funnel/track',
  validate({
    body: Joi.object({
      funnelName: Joi.string().required(),
      step: Joi.string().required(),
      userId: Joi.string().optional(),
      sessionId: Joi.string().optional(),
      metadata: Joi.object().optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { funnelName, step, userId, sessionId, metadata } = req.body;
    await trackFunnelStep(funnelName, step, userId, sessionId, metadata);
    
    res.json({
      success: true,
      message: 'Funnel step tracked successfully'
    });
  })
);

/**
 * GET /api/analytics/funnel/:funnelName
 * Get funnel analysis
 */
router.get('/funnel/:funnelName',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      funnelName: Joi.string().required()
    },
    query: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const funnelName = req.params['funnelName'];
    if (!funnelName) {
      return res.status(400).json({
        success: false,
        message: 'Funnel name is required'
      });
    }
    const { startDate, endDate } = req.query;
    const funnelData = await getFunnelAnalysis(
      funnelName, 
      new Date(String(startDate || '')), 
      new Date(String(endDate || ''))
    );
    
    return res.json({
      success: true,
      data: funnelData
    });
  })
);

/**
 * POST /api/analytics/reports
 * Create custom report
 */
router.post('/reports',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      query: Joi.object().required(),
      filters: Joi.object().optional(),
      isPublic: Joi.boolean().default(false)
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    const report = await createCustomReport(req.body, req.user.id);
    
    return res.status(201).json({
      success: true,
      message: 'Custom report created successfully',
      data: report
    });
  })
);

/**
 * GET /api/analytics/reports
 * Get custom reports
 */
router.get('/reports',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(20),
      isPublic: Joi.boolean().optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { page, limit, isPublic } = req.query;
    const pageNum = page ? Number(page) : undefined;
    const limitNum = limit ? Number(limit) : undefined;
    const isPublicBool = isPublic !== undefined ? (String(isPublic) === 'true') : undefined;
    const reports = await getCustomReports(pageNum, limitNum, isPublicBool);
    
    return res.json({
      success: true,
      data: reports
    });
  })
);

/**
 * GET /api/analytics/reports/:id
 * Get custom report by ID
 */
router.get('/reports/:id',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const reportId = req.params['id'];
    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }
    const report = await prisma.customReport.findUnique({
      where: { id: reportId }
    });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    return res.json({
      success: true,
      data: {
        ...report,
        query: JSON.parse(report.query),
        // Backwards-compatible: parameters replaces legacy 'filters'
        filters: report.parameters ? JSON.parse(report.parameters as string) : null
      }
    });
  })
);

/**
 * POST /api/analytics/reports/:id/execute
 * Execute custom report
 */
router.post('/reports/:id/execute',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const reportId = req.params['id'];
    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }
    const result = await executeCustomReport(reportId);
    
    return res.json({
      success: true,
      data: result
    });
  })
);

/**
 * PUT /api/analytics/reports/:id
 * Update custom report
 */
router.put('/reports/:id',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    },
    body: Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      query: Joi.object().optional(),
      filters: Joi.object().optional(),
      isPublic: Joi.boolean().optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const reportId = req.params['id'];
    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }
    const updateData: Record<string, unknown> = { ...req.body };
    
    if (updateData['query']) {
      updateData['query'] = JSON.stringify(updateData['query']);
    }
    if (updateData['filters']) {
      updateData['filters'] = JSON.stringify(updateData['filters']);
    }
    
    const report = await prisma.customReport.update({
      where: { id: reportId },
      data: updateData as Prisma.CustomReportUpdateInput
    });
    
    return res.json({
      success: true,
      message: 'Report updated successfully',
      data: {
        ...report,
        query: JSON.parse(report.query),
        filters: report.parameters ? JSON.parse(report.parameters as string) : null
      }
    });
  })
);

/**
 * DELETE /api/analytics/reports/:id
 * Delete custom report
 */
router.delete('/reports/:id',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const reportId = req.params['id'];
    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }
    await prisma.customReport.delete({
      where: { id: reportId }
    });
    
    return res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  })
);

/**
 * GET /api/analytics/export/:type
 * Export analytics data
 */
router.get('/export/:type',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      type: Joi.string().valid('orders', 'products', 'customers', 'ltv').required()
    },
    query: Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      format: Joi.string().valid('csv', 'json').default('csv')
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const exportType = req.params['type'];
    if (!exportType) {
      return res.status(400).json({
        success: false,
        message: 'Export type is required'
      });
    }
    const { startDate, endDate, format } = req.query;
    
    let data: unknown[] = [];
    const where: Record<string, unknown> = {};
    
    if (startDate && endDate) {
      where['createdAt'] = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate))
      };
    }
    
    switch (exportType) {
      case 'orders':
        data = await prisma.order.findMany({
          where: {
            paymentStatus: 'paid',
            ...(where as Prisma.OrderWhereInput)
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      select: {
                        title: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
        
      case 'products':
        data = await prisma.product.findMany({
          where: where as Prisma.ProductWhereInput,
          include: {
            variants: true,
            reviews: true
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
        
      case 'customers':
        data = await prisma.user.findMany({
          where: {
            role: 'customer',
            ...(where as Prisma.UserWhereInput)
          },
          include: {
            orders: {
              where: {
                paymentStatus: 'paid'
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
        
      case 'ltv':
        data = await prisma.customerLifetimeValue.findMany({
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { totalSpent: 'desc' }
        });
        break;
    }
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvContent = data.length > 0 && typeof data[0] === 'object' && data[0] !== null ? [
        Object.keys(data[0] as Record<string, unknown>).join(','),
        ...data.map(row => Object.values(row as Record<string, unknown>).map(val => 
          typeof val === 'object' ? JSON.stringify(val) : String(val)
        ).join(','))
      ].join('\n') : '';
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${exportType}-export.csv"`);
      return res.send(csvContent);
    } else {
      return res.json({
        success: true,
        data
      });
    }
  })
);

export default router;