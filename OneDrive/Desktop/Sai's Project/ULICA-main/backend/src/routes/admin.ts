import * as express from 'express';
import { Prisma, OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';
import prisma from '../prisma/client';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { generateProductSku, generateVariantSku } from '../services/skuService';
import { generateProductBarcode, generateVariantBarcode } from '../services/barcodeService';
import { transitionOrderStatus } from '../services/orderStatusService';
import { bulkUpdateFulfillmentStatus } from '../services/fulfillmentService';
import { ensureShiprocketShipmentArtifacts } from '../modules/shiprocket/services/shippingService';
import {
  generateProductInfoSheet,
  regenerateProductInfoSheet,
  getOrGenerateInfoSheet,
  bulkGenerateInfoSheets
} from '../services/productInfoSheetService';
import { logger } from '../services/loggerService';
import { Middleware, ExpressResponse } from '../types/express';
import { ProductVariantInput } from '../types/product';
import { getErrorMessage } from '../types/common';
import Joi from 'joi';

const router = express.Router();

// Admin middleware
const requireAdmin: Middleware = (req: AuthenticatedRequest, _res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new CustomError('Admin access required', 403);
  }
  next();
};

// Validation schemas
const createProductSchema = {
  body: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    shortDescription: Joi.string().optional(),
    category: Joi.string().optional(),
    tags: Joi.string().optional(),
    featured: Joi.boolean().default(false),
    metaTitle: Joi.string().optional(),
    metaDescription: Joi.string().optional(),
    sku: Joi.string().optional(), // Optional - will be auto-generated if not provided
    variants: Joi.array().items(
      Joi.object({
        sku: Joi.string().required(),
        title: Joi.string().required(),
        price: Joi.number().positive().required(),
        compareAtPrice: Joi.number().positive().optional(),
        costPrice: Joi.number().positive().optional(),
        stockQty: Joi.number().min(0).default(0),
        weight: Joi.number().positive().optional(),
        dimensions: Joi.string().optional(),
        options: Joi.object().optional(),
        attributes: Joi.string().optional() // For variant SKU generation
      })
    ).min(1).required(),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        alt: Joi.string().optional(),
        isPrimary: Joi.boolean().default(false)
      })
    ).min(1).required(),
    sizeChart: Joi.array().items(
      Joi.object({
        size: Joi.string().required(),
        chest: Joi.string().optional(),
        length: Joi.string().optional(),
        sleeve: Joi.string().optional(),
        shoulder: Joi.string().optional()
      })
    ).optional(),
    details: Joi.object({
      material: Joi.string().optional(),
      fit: Joi.string().optional(),
      weight: Joi.string().optional(),
      origin: Joi.string().optional(),
      color: Joi.string().optional()
    }).optional(),
    specifications: Joi.object({
      weight: Joi.string().optional(),
      dimensions: Joi.string().optional(),
      sizes: Joi.array().items(Joi.string()).optional()
    }).optional(),
    washCare: Joi.array().items(Joi.string()).optional()
  })
};

const updateProductSchema = {
  body: Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    shortDescription: Joi.string().optional(),
    category: Joi.string().optional(),
    tags: Joi.string().optional(),
    featured: Joi.boolean().optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    sizeChart: Joi.array().items(
      Joi.object({
        size: Joi.string().required(),
        chest: Joi.string().optional(),
        length: Joi.string().optional(),
        sleeve: Joi.string().optional(),
        shoulder: Joi.string().optional()
      })
    ).optional(),
    details: Joi.object({
      material: Joi.string().optional(),
      fit: Joi.string().optional(),
      weight: Joi.string().optional(),
      origin: Joi.string().optional(),
      color: Joi.string().optional()
    }).optional(),
    specifications: Joi.object({
      weight: Joi.string().optional(),
      dimensions: Joi.string().optional(),
      sizes: Joi.array().items(Joi.string()).optional()
    }).optional(),
    washCare: Joi.array().items(Joi.string()).optional(),
    metaTitle: Joi.string().optional(),
    metaDescription: Joi.string().optional()
  })
};

const getOrdersSchema = {
  query: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    status: Joi.string()
      .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
      .optional(),
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').optional(),
    fulfillmentStatus: Joi.string()
      .valid('unfulfilled', 'picked', 'packed', 'shipped', 'delivered', 'cancelled', 'return_initiated', 'returned')
      .optional(),
    hasShipment: Joi.boolean().optional(),
    hasLabel: Joi.boolean().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    search: Joi.string().trim().max(200).optional(),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'totalAmount').default('createdAt'),
    sortDirection: Joi.string().valid('asc', 'desc').default('desc')
  })
};

const bulkOrdersSchema = {
  body: Joi.object({
    orderIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    action: Joi.string()
      .valid(
        'updateStatus',
        'updatePaymentStatus',
        'updateFulfillmentStatus',
        'cancel',
        'markPaid',
        'markDelivered',
        'generateLabels'
      )
      .required(),
    value: Joi.string().allow('', null).optional(),
    metadata: Joi.object().optional()
  })
};

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 */
router.get('/dashboard',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: ExpressResponse) => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenuePromise = prisma.$queryRaw<
      Array<{ month: Date; revenue: number | null; orders: bigint }>
    >`
      SELECT DATE_TRUNC('month', "createdAt") AS month,
             COALESCE(SUM("totalAmount"), 0) AS revenue,
             COUNT(*) AS orders
      FROM "orders"
      WHERE "paymentStatus" = 'paid' AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const dropPerformancePromise = prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        status: string;
        startDate: Date;
        endDate: Date;
        productCount: bigint;
        unitsSold: bigint;
        revenue: number | null;
        customerCount: bigint;
      }>
    >`
      SELECT d.id,
             d.name,
             d.status,
             d."startDate",
             d."endDate",
             COUNT(DISTINCT dp."productId") AS "productCount",
             COALESCE(SUM(dpurch.quantity), 0) AS "unitsSold",
             COALESCE(SUM(dpurch.quantity * p.price), 0) AS "revenue",
             COUNT(DISTINCT dpurch."userId") AS "customerCount"
      FROM drops d
      LEFT JOIN drop_products dp ON dp."dropId" = d.id
      LEFT JOIN drop_purchases dpurch ON dpurch."dropId" = d.id
      LEFT JOIN products p ON p.id = dpurch."productId"
      WHERE d."isPublished" = TRUE
      GROUP BY d.id
      ORDER BY d."startDate" DESC
      LIMIT 5
    `;

    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      unfulfilledOrders,
      abandonedCarts,
      monthlyRevenueRaw,
      dropPerformanceRaw,
      dropStatusCounts,
      totalDrops,
      publishedDrops,
      liveDrops,
      upcomingDrops,
      activeInventoryAlerts
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      
      // Total revenue
      prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalAmount: true }
      }),
      
      // Total products
      prisma.product.count(),
      
      // Total customers
      prisma.user.count({
        where: { role: 'customer' }
      }),
      
      // Pending orders
      prisma.order.count({
        where: { status: 'pending' }
      }),
      
      // Low stock products
      prisma.productVariant.count({
        where: {
          stockQty: { lte: 5 },
          isActive: true
        }
      }),
      
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          items: {
            take: 1,
            include: {
              variant: {
                include: {
                  product: {
                    select: { title: true }
                  }
                }
              }
            }
          }
        }
      }),
      // Unfulfilled orders
      prisma.order.count({
        where: { fulfillmentStatus: 'unfulfilled' }
      }),

      // Abandoned carts
      prisma.abandonedCart.count({
        where: { recovered: false }
      }),
      monthlyRevenuePromise,
      dropPerformancePromise,
      prisma.drop.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.drop.count(),
      prisma.drop.count({
        where: { isPublished: true }
      }),
      prisma.drop.count({
        where: { status: 'live' }
      }),
      prisma.drop.count({
        where: { status: 'upcoming' }
      }),
      prisma.inventoryAlert.count({
        where: { resolvedAt: null }
      })
    ]);

    type DropStatusGroupBy = Array<{ status: string; _count: { status: number | null } }>;
    const dropStatusMap = (dropStatusCounts as DropStatusGroupBy).reduce<Record<string, number>>(
      (acc: Record<string, number>, item) => {
        acc[item.status] = Number(item._count.status ?? 0);
        return acc;
      },
      {}
    );

    const monthlyRevenue = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const match = monthlyRevenueRaw.find((row) => {
        const rowDate = new Date(row.month);
        return (
          rowDate.getFullYear() === date.getFullYear() &&
          rowDate.getMonth() === date.getMonth()
        );
      });

      return {
        month: date.toISOString(),
        revenue: Number(match?.revenue ?? 0),
        orders: Number(match?.orders ?? 0),
      };
    });

    const dropPerformance = dropPerformanceRaw.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
      productCount: Number(row.productCount ?? 0),
      unitsSold: Number(row.unitsSold ?? 0),
      revenue: Number(row.revenue ?? 0),
      customerCount: Number(row.customerCount ?? 0),
    }));

    const stats = {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        revenue: totalRevenue._sum.totalAmount || 0
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      },
      customers: {
        total: totalCustomers
      },
      fulfillment: {
        unfulfilled: unfulfilledOrders
      },
      marketing: {
        abandonedCarts: abandonedCarts
      },
      recentOrders,
      monthlyRevenue,
      drop: {
        overview: {
          total: totalDrops,
          published: publishedDrops,
          live: liveDrops,
          upcoming: upcomingDrops,
          ended: dropStatusMap['ended'] ?? 0,
          activeAlerts: activeInventoryAlerts
        },
        performance: dropPerformance
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  })
);

/**
 * GET /api/admin/products
 * Get all products for admin
 */
router.get('/products',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      status: Joi.string().valid('draft', 'published', 'archived').optional(),
      search: Joi.string().optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { page, limit, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductWhereInput = {};
    if (status) {
      // Map status query param to isActive boolean
      if (status === 'published' || status === 'active') {
        where.isActive = true;
      } else if (status === 'archived' || status === 'draft') {
        where.isActive = false;
      }
    }
    if (search) {
      const searchStr = typeof search === 'string' ? search : String(search);
      where.OR = [
        { title: { contains: searchStr, mode: 'insensitive' } },
        { description: { contains: searchStr, mode: 'insensitive' } }
      ];
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: {
            where: { isActive: true }
          },
          images: true,
          _count: {
            select: {
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      }
    });
  })
);

/**
 * POST /api/admin/products
 * Create new product
 */
router.post('/products',
  authenticateToken,
  requireAdmin,
  validate(createProductSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const productData = req.body;

    // Generate slug from title
    const slug = productData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    const finalSlug = existingProduct ? `${slug}-${Date.now()}` : slug;

    // Generate SKU if not provided
    let productSku = productData.sku;
    if (!productSku && productData.category) {
      productSku = await generateProductSku(productData.category);
    }

    // Generate variant SKUs
    const variantsWithSku = await Promise.all(
      productData.variants.map(async (variant: ProductVariantInput) => {
        let variantSku = variant.sku;
        if (productSku && variant.attributes) {
          try {
            variantSku = await generateVariantSku(productSku, variant.attributes);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            logger.error('Error generating variant SKU', { error: errorMsg }).catch(() => {});
            // Fallback to original SKU if generation fails
          }
        }
        
        return {
          ...variant,
          sku: variantSku,
          variantSku: variantSku !== variant.sku ? variantSku : null
        };
      })
    );

    // Handle size chart, details, specifications, washCare - store in tags as JSON strings
    const tags = productData.tags ? (typeof productData.tags === 'string' ? productData.tags.split(',') : productData.tags) : [];
    if (productData.sizeChart && Array.isArray(productData.sizeChart) && productData.sizeChart.length > 0) {
      tags.push(`__SIZECHART__:${JSON.stringify(productData.sizeChart)}`);
    }
    if (productData.details && Object.keys(productData.details).length > 0) {
      tags.push(`__DETAILS__:${JSON.stringify(productData.details)}`);
    }
    if (productData.specifications && Object.keys(productData.specifications).length > 0) {
      tags.push(`__SPECIFICATIONS__:${JSON.stringify(productData.specifications)}`);
    }
    if (productData.washCare && Array.isArray(productData.washCare) && productData.washCare.length > 0) {
      tags.push(`__WASHCARE__:${JSON.stringify(productData.washCare)}`);
    }

    // Create product with variants and images
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug: finalSlug,
        sku: productSku,
        status: 'draft',
        tags: tags,
        variants: {
          create: variantsWithSku
        },
        images: {
          create: productData.images
        }
      },
      include: {
        variants: true,
        images: true
      }
    });

    // Generate barcodes asynchronously
    try {
      if (productSku) {
        // Generate product barcode
        generateProductBarcode(product.id).catch((error) => {
          const errorMsg = error instanceof Error ? error.message : String(error);
          logger.error('Error generating product barcode', { productId: product.id, error: errorMsg }).catch(() => {});
        });
        
        // Generate variant barcodes
        for (const variant of product.variants) {
          if (variant.variantSku) {
            generateVariantBarcode(variant.id).catch((error) => {
              const errorMsg = error instanceof Error ? error.message : String(error);
              logger.error('Error generating variant barcode', { variantId: variant.id, error: errorMsg }).catch(() => {});
            });
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error generating barcodes', { error: errorMsg }).catch(() => {});
      // Don't fail the request if barcode generation fails
    }

    // Extract size chart, details, specifications, washCare from tags for response
    const extractFromTags = (prefix: string) => {
      const tag = product.tags?.find((t: string) => t.startsWith(prefix));
      if (tag) {
        try {
          const data = tag.replace(prefix, '');
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
      return null;
    };

    const productWithExtras = {
      ...product,
      sizeChart: extractFromTags('__SIZECHART__:'),
      details: extractFromTags('__DETAILS__:'),
      specifications: extractFromTags('__SPECIFICATIONS__:'),
      washCare: extractFromTags('__WASHCARE__:'),
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: productWithExtras }
    });
  })
);

/**
 * PUT /api/admin/products/:id
 * Update product
 */
router.put('/products/:id',
  authenticateToken,
  requireAdmin,
  validate(updateProductSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const id = req.params['id'] as string;
    const updateData = req.body;

    // Handle size chart, details, specifications, washCare - store in tags as JSON strings
    if (updateData.sizeChart !== undefined || updateData.details !== undefined || 
        updateData.specifications !== undefined || updateData.washCare !== undefined) {
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: { tags: true }
      });
      
      const tags = existingProduct?.tags ? [...existingProduct.tags] : [];
      // Remove existing special tags
      const filteredTags = tags.filter((tag: string) => 
        !tag.startsWith('__SIZECHART__:') && 
        !tag.startsWith('__DETAILS__:') && 
        !tag.startsWith('__SPECIFICATIONS__:') && 
        !tag.startsWith('__WASHCARE__:')
      );
      
      // Add new data if provided
      if (updateData.sizeChart !== undefined && Array.isArray(updateData.sizeChart) && updateData.sizeChart.length > 0) {
        filteredTags.push(`__SIZECHART__:${JSON.stringify(updateData.sizeChart)}`);
      }
      if (updateData.details !== undefined && Object.keys(updateData.details).length > 0) {
        filteredTags.push(`__DETAILS__:${JSON.stringify(updateData.details)}`);
      }
      if (updateData.specifications !== undefined && Object.keys(updateData.specifications).length > 0) {
        filteredTags.push(`__SPECIFICATIONS__:${JSON.stringify(updateData.specifications)}`);
      }
      if (updateData.washCare !== undefined && Array.isArray(updateData.washCare) && updateData.washCare.length > 0) {
        filteredTags.push(`__WASHCARE__:${JSON.stringify(updateData.washCare)}`);
      }
      
      updateData.tags = filteredTags;
      delete updateData.sizeChart;
      delete updateData.details;
      delete updateData.specifications;
      delete updateData.washCare;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        variants: true,
        images: true
      }
    });

    // Extract size chart, details, specifications, washCare from tags for response
    const extractFromTags = (prefix: string) => {
      const tag = product.tags?.find((t: string) => t.startsWith(prefix));
      if (tag) {
        try {
          const data = tag.replace(prefix, '');
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
      return null;
    };

    const productWithExtras = {
      ...product,
      sizeChart: extractFromTags('__SIZECHART__:'),
      details: extractFromTags('__DETAILS__:'),
      specifications: extractFromTags('__SPECIFICATIONS__:'),
      washCare: extractFromTags('__WASHCARE__:'),
    };

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: productWithExtras }
    });
  })
);

/**
 * DELETE /api/admin/products/:id
 * Delete product
 */
router.delete('/products/:id',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: id as string } as any
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  })
);

/**
 * GET /api/admin/orders
 * Get all orders for admin
 */
router.get('/orders',
  authenticateToken,
  requireAdmin,
  validate(getOrdersSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const {
      page,
      limit,
      status,
      paymentStatus,
      fulfillmentStatus,
      startDate,
      endDate,
      search,
      hasShipment,
      hasLabel,
      sortBy,
      sortDirection
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status as OrderStatus;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (fulfillmentStatus) {
      where.fulfillmentStatus = fulfillmentStatus as FulfillmentStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    if (typeof hasShipment === 'boolean') {
      where.shiprocketShipmentId = hasShipment ? { not: null } : null;
    } else if (typeof hasShipment === 'string') {
      const flag = hasShipment === 'true';
      where.shiprocketShipmentId = flag ? { not: null } : null;
    }

    if (typeof hasLabel === 'boolean') {
      where.labelUrl = hasLabel ? { not: null } : null;
    } else if (typeof hasLabel === 'string') {
      const flag = hasLabel === 'true';
      where.labelUrl = flag ? { not: null } : null;
    }

    if (search) {
      const query = search as string;
      where.OR = [
        { orderNumber: { contains: query, mode: 'insensitive' } },
        { awbNumber: { contains: query, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          }
        },
        {
          addresses: {
            some: {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { city: { contains: query, mode: 'insensitive' } },
                { state: { contains: query, mode: 'insensitive' } }
              ]
            }
          }
        }
      ];
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput = {
      [typeof sortBy === 'string' ? sortBy : 'createdAt']:
        sortDirection === 'asc' ? 'asc' : 'desc'
    };

    const [orders, totalCount, statusCounts, paymentCounts] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true }
          },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: { title: true, images: { take: 1 } }
                  }
                }
              }
            }
          },
          fulfillment: {
            select: {
              status: true,
              updatedAt: true
            }
          },
          shipmentLogs: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              status: true,
              message: true,
              createdAt: true
            }
          }
        },
        orderBy,
        skip,
        take: Number(limit)
      }),
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.order.groupBy({
        by: ['paymentStatus'],
        _count: { paymentStatus: true }
      })
    ]);

    type OrderStatusGroupBy = Array<{ status: string; _count: { status: number | null } }>;
    type PaymentStatusGroupBy = Array<{ paymentStatus: string; _count: { paymentStatus: number | null } }>;
    const statusSummary = (statusCounts as OrderStatusGroupBy).reduce<Record<string, number>>(
      (acc: Record<string, number>, item) => {
        acc[item.status] = Number(item._count.status ?? 0);
        return acc;
      },
      {}
    );

    const paymentSummary = (paymentCounts as PaymentStatusGroupBy).reduce<Record<string, number>>(
      (acc: Record<string, number>, item) => {
        acc[item.paymentStatus] = Number(item._count.paymentStatus ?? 0);
        return acc;
      },
      {}
    );

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        },
        summary: {
          status: statusSummary,
          payment: paymentSummary
        }
      }
    });
  })
);

/**
 * PUT /api/admin/orders/:id/status
 * Update order status
 */
const ORDER_STATUS_INCLUDE = {
  user: {
    select: { name: true, email: true }
  },
  items: {
    include: {
      variant: {
        include: {
          product: {
            select: { title: true }
          }
        }
      }
    }
  }
} as const;

router.put('/orders/:id/status',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
        .required()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const id = req.params['id'] as string;
    const { status } = req.body as { status: OrderStatus };

    const order = await transitionOrderStatus(id, status, { include: ORDER_STATUS_INCLUDE });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  })
);

router.post('/orders/bulk',
  authenticateToken,
  requireAdmin,
  validate(bulkOrdersSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { orderIds, action, value } = req.body as {
      orderIds: string[];
      action: string;
      value?: string | null;
    };

    const results: Array<{ orderId: string; success: boolean; message?: string }> = [];

    const performPerOrder = async (
      orderId: string,
      handler: () => Promise<unknown>
    ) => {
      try {
        await handler();
        results.push({ orderId, success: true });
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        results.push({ orderId, success: false, message });
      }
    };

    switch (action) {
      case 'updateStatus': {
        if (!value) {
          throw new CustomError('Status value is required', 400);
        }
        if (!(Object.values(OrderStatus) as string[]).includes(value)) {
          throw new CustomError('Invalid order status', 400);
        }
        for (const orderId of orderIds) {
          await performPerOrder(orderId, () =>
            transitionOrderStatus(orderId, value as OrderStatus)
          );
        }
        break;
      }
      case 'updatePaymentStatus': {
        if (!value) {
          throw new CustomError('Payment status value is required', 400);
        }
        if (!(Object.values(PaymentStatus) as string[]).includes(value)) {
          throw new CustomError('Invalid payment status', 400);
        }
        for (const orderId of orderIds) {
          await performPerOrder(orderId, async () => {
            await prisma.order.update({
              where: { id: orderId },
              data: { paymentStatus: value as PaymentStatus }
            });
          });
        }
        break;
      }
      case 'updateFulfillmentStatus': {
        if (!value) {
          throw new CustomError('Fulfillment status value is required', 400);
        }
        const allowedFulfillmentStatuses: Array<'picked' | 'packed' | 'shipped' | 'delivered'> = [
          'picked',
          'packed',
          'shipped',
          'delivered'
        ];
        if (!allowedFulfillmentStatuses.includes(value as any)) {
          throw new CustomError('Invalid fulfillment status', 400);
        }
        const { errors } = await bulkUpdateFulfillmentStatus({
          orderIds,
          status: value as 'picked' | 'packed' | 'shipped' | 'delivered'
        });
        for (const orderId of orderIds) {
          const failure = errors.find((error) => error.orderId === orderId);
          if (failure) {
            results.push({ orderId, success: false, message: failure.error });
          } else {
            results.push({ orderId, success: true });
          }
        }
        break;
      }
      case 'cancel': {
        for (const orderId of orderIds) {
          await performPerOrder(orderId, () =>
            transitionOrderStatus(orderId, OrderStatus.cancelled)
          );
        }
        break;
      }
      case 'markPaid': {
        for (const orderId of orderIds) {
          await performPerOrder(orderId, async () => {
            await prisma.order.update({
              where: { id: orderId },
              data: { paymentStatus: PaymentStatus.paid }
            });
          });
        }
        break;
      }
      case 'markDelivered': {
        for (const orderId of orderIds) {
          await performPerOrder(orderId, () =>
            transitionOrderStatus(orderId, OrderStatus.delivered)
          );
        }
        break;
      }
      case 'generateLabels': {
        for (const orderId of orderIds) {
          await performPerOrder(orderId, async () => {
            await ensureShiprocketShipmentArtifacts(orderId);
          });
        }
        break;
      }
      default:
        throw new CustomError('Unsupported bulk action', 400);
    }

    const succeeded = results.filter((item) => item.success);
    const failed = results.filter((item) => !item.success);

    res.json({
      success: failed.length === 0,
      data: {
        summary: {
          total: orderIds.length,
          succeeded: succeeded.length,
          failed: failed.length
        },
        results
      }
    });
  })
);

/**
 * GET /api/admin/orders/:id/info-sheet
 * Get or generate product info sheet for an order
 */
router.get('/orders/:id/info-sheet',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const id = req.params['id'] as string;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        infoSheetUrl: true,
        infoSheetStatus: true,
        infoSheetGeneratedAt: true
      }
    });

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    // If already generated, return URL
    if (order.infoSheetUrl && order.infoSheetStatus === 'generated') {
      return res.json({
        success: true,
        data: {
          url: order.infoSheetUrl,
          status: order.infoSheetStatus,
          generatedAt: order.infoSheetGeneratedAt
        }
      });
    }

    // Generate if missing
    try {
      const result = await getOrGenerateInfoSheet(id);
      const updatedOrder = await prisma.order.findUnique({
        where: { id },
        select: {
          infoSheetUrl: true,
          infoSheetStatus: true,
          infoSheetGeneratedAt: true
        }
      });

      return res.json({
        success: true,
        data: {
          url: result,
          status: updatedOrder?.infoSheetStatus || 'generated',
          generatedAt: updatedOrder?.infoSheetGeneratedAt
        }
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      throw new CustomError(
        `Failed to generate info sheet: ${errorMessage}`,
        500
      );
    }
  })
);

/**
 * POST /api/admin/orders/:id/info-sheet/generate
 * Generate product info sheet for an order
 */
router.post('/orders/:id/info-sheet/generate',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const id = req.params['id'] as string;
    const { regenerate } = req.query;

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true }
    });

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    try {
      const result = regenerate === 'true'
        ? await regenerateProductInfoSheet(id)
        : await generateProductInfoSheet(id);

      const updatedOrder = await prisma.order.findUnique({
        where: { id },
        select: {
          infoSheetUrl: true,
          infoSheetStatus: true,
          infoSheetGeneratedAt: true
        }
      });

      res.json({
        success: true,
        message: 'Product info sheet generated successfully',
        data: {
          url: result.url,
          status: updatedOrder?.infoSheetStatus || 'generated',
          generatedAt: updatedOrder?.infoSheetGeneratedAt
        }
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      throw new CustomError(
        `Failed to generate info sheet: ${errorMessage}`,
        500
      );
    }
  })
);

/**
 * POST /api/admin/orders/info-sheets/bulk-generate
 * Bulk generate info sheets for multiple orders
 */
router.post('/orders/info-sheets/bulk-generate',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      orderIds: Joi.array().items(Joi.string().uuid()).min(1).required()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { orderIds } = req.body as { orderIds: string[] };

    const result = await bulkGenerateInfoSheets(orderIds);

    res.json({
      success: result.failed === 0,
      message: `Generated ${result.success} info sheets${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
      data: result
    });
  })
);

export default router;
