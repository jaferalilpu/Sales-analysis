import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { Prisma } from '@prisma/client';
import Joi from 'joi';
import prisma from '../prisma/client';
import {
  adjustStock,
  createStockTransfer,
  completeStockTransfer,
  bulkStockUpdate,
  setReorderPoint,
  getLowStockAlerts,
  getInventoryLogs,
  getInventoryStats,
  exportInventoryData,
  setStockLevel
} from '../services/inventoryService';

const router = express.Router();

/**
 * GET /api/inventory
 * List inventory variants
 */
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(200).default(50),
      search: Joi.string().allow('').optional(),
      lowStockOnly: Joi.boolean().optional(),
      status: Joi.string().valid('active', 'inactive').optional(),
    }),
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { page, limit, search, lowStockOnly, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductVariantWhereInput = {};

    if (status) {
      where.isActive = status === 'active';
    }

    if (search) {
      const searchStr = String(search);
      where.OR = [
        { title: { contains: searchStr, mode: 'insensitive' } },
        { sku: { contains: searchStr, mode: 'insensitive' } },
        {
          product: {
            OR: [
              { title: { contains: searchStr, mode: 'insensitive' } },
              { sku: { contains: searchStr, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (lowStockOnly) {
      where.stockQty = { lte: Number(process.env['LOW_STOCK_THRESHOLD'] ?? 5) };
    }

    const [variants, total, stats] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              sku: true,
              slug: true,
              images: {
                select: { url: true, alt: true, isPrimary: true, sortOrder: true },
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
          reorderPoint: true,
        },
        orderBy: [{ product: { title: 'asc' } }, { title: 'asc' }],
        skip,
        take: Number(limit),
      }),
      prisma.productVariant.count({ where }),
      getInventoryStats(),
    ]);

    const defaultThreshold = Number(process.env['LOW_STOCK_THRESHOLD'] ?? 5);

    const items = variants.map((variant) => {
      const primaryImage =
        variant.product.images.find((img) => img.isPrimary) ?? variant.product.images[0];

      const threshold = variant.reorderPoint?.minQuantity ?? defaultThreshold;

      return {
        variantId: variant.id,
        productId: variant.productId,
        productName: variant.product.title,
        productSku: variant.product.sku,
        productSlug: variant.product.slug,
        variantName: variant.title,
        sku: variant.sku ?? variant.product.sku ?? '-',
        stockQty: variant.stockQty,
        price: variant.price,
        costPrice: variant.costPrice,
        options: variant.options,
        lowStockThreshold: threshold,
        isLowStock: variant.stockQty <= threshold,
        image: primaryImage?.url ?? null,
        updatedAt: variant.updatedAt,
        isActive: variant.isActive,
      };
    });

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        stats,
      },
    });
  })
);

/**
 * POST /api/inventory/adjust
 * Adjust stock for a variant
 */
router.post('/adjust',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      variantId: Joi.string().required(),
      quantity: Joi.number().required(),
      reason: Joi.string().min(2).max(200).required(),
      reference: Joi.string().optional()
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const variant = await adjustStock(req.body);

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: variant
    });
  })
);

/**
 * PATCH /api/inventory/:variantId
 * Set stock quantity for a variant
 */
router.patch(
  '/:variantId',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      variantId: Joi.string().required(),
    },
    body: Joi.object({
      stockQty: Joi.number().integer().min(0).required(),
      reason: Joi.string().min(2).max(200).default('Manual adjustment'),
      reference: Joi.string().optional(),
    }),
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const variantId = req.params['variantId'];
    if (!variantId) {
      throw new CustomError('Variant ID is required', 400);
    }
    const { stockQty, reason, reference } = req.body;

    const variant = await setStockLevel(variantId, stockQty, reason, reference);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: variant,
    });
  })
);

/**
 * POST /api/inventory/transfer
 * Create stock transfer
 */
router.post('/transfer',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      fromLocation: Joi.string().min(2).max(100).required(),
      toLocation: Joi.string().min(2).max(100).required(),
      supplierId: Joi.string().optional(),
      notes: Joi.string().max(500).optional(),
      items: Joi.array().items(
        Joi.object({
          variantId: Joi.string().required(),
          quantity: Joi.number().min(1).required()
        })
      ).min(1).required()
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const transfer = await createStockTransfer(req.body);

    res.status(201).json({
      success: true,
      message: 'Stock transfer created successfully',
      data: transfer
    });
  })
);

/**
 * PUT /api/inventory/transfer/:id/complete
 * Complete stock transfer
 */
router.put('/transfer/:id/complete',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    },
    body: Joi.object({
      receivedItems: Joi.array().items(
        Joi.object({
          variantId: Joi.string().required(),
          receivedQty: Joi.number().min(0).required()
        })
      ).min(1).required()
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const transferId = req.params['id'];
    if (!transferId) {
      throw new CustomError('Transfer ID is required', 400);
    }
    const transfer = await completeStockTransfer(transferId, req.body.receivedItems);

    res.json({
      success: true,
      message: 'Stock transfer completed successfully',
      data: transfer
    });
  })
);

/**
 * POST /api/inventory/bulk-update
 * Bulk stock update
 */
router.post('/bulk-update',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      updates: Joi.array().items(
        Joi.object({
          variantId: Joi.string().required(),
          quantity: Joi.number().required(),
          reason: Joi.string().optional()
        })
      ).min(1).max(100).required()
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const result = await bulkStockUpdate(req.body);

    res.json({
      success: true,
      message: `Bulk update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      data: result
    });
  })
);

/**
 * POST /api/inventory/reorder-point
 * Set reorder point for a variant
 */
router.post('/reorder-point',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      variantId: Joi.string().required(),
      threshold: Joi.number().min(0).required()
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const reorderPoint = await setReorderPoint(req.body.variantId, req.body.threshold);

    res.json({
      success: true,
      message: 'Reorder point set successfully',
      data: reorderPoint
    });
  })
);

/**
 * GET /api/inventory/alerts
 * Get low stock alerts
 */
router.get('/alerts',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: express.Request, res: express.Response) => {
    const alerts = await getLowStockAlerts();

    res.json({
      success: true,
      data: alerts
    });
  })
);

/**
 * GET /api/inventory/logs/:variantId
 * Get inventory logs for a variant
 */
router.get('/logs/:variantId',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      variantId: Joi.string().required()
    },
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(20)
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const variantId = req.params['variantId'];
    if (!variantId) {
      throw new CustomError('Variant ID is required', 400);
    }
    const { page, limit } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const result = await getInventoryLogs(variantId, pageNum, limitNum);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * GET /api/inventory/stats
 * Get inventory statistics
 */
router.get('/stats',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: express.Request, res: express.Response) => {
    const stats = await getInventoryStats();

    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * GET /api/inventory/export
 * Export inventory data
 */
router.get('/export',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: express.Request, res: express.Response) => {
    const data = await exportInventoryData();

    res.json({
      success: true,
      data: data
    });
  })
);

/**
 * GET /api/inventory/transfers
 * Get stock transfers
 */
router.get('/transfers',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      status: Joi.string().valid('pending', 'in_transit', 'completed', 'cancelled').optional()
    })
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { page, limit, status } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.StockTransferWhereInput = {};
    if (typeof status === 'string') {
      where.status = status as any;
    }

    const [transfers, total] = await prisma.$transaction([
      prisma.stockTransfer.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true
            }
          },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      title: true,
                      sku: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.stockTransfer.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        transfers,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  })
);

/**
 * GET /api/inventory/transfers/:id
 * Get stock transfer by ID
 */
router.get('/transfers/:id',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    }
  }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const id = req.params['id'];
    if (!id) {
      throw new CustomError('Transfer ID is required', 400);
    }

    const transfer = await prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    title: true,
                    sku: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Stock transfer not found'
      });
    }

    return res.json({
      success: true,
      data: transfer
    });
  })
);

export default router;