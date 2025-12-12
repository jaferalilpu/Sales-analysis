import express from 'express';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { ExpressResponse } from '../types/express';
import { Prisma } from '@prisma/client';
import Joi from 'joi';
import prisma from '../prisma/client';
import { ProductStatusService } from '../services/productStatusService';

const router = express.Router();

// Validation schemas
const createDropSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    bannerImage: Joi.string().uri().allow('').optional(), // External URL for banner image
    bannerVideo: Joi.string().uri().allow('').optional(), // External URL for banner video
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    productIds: Joi.array().items(Joi.string()).optional(),
    purchaseLimitPerCustomer: Joi.number().integer().min(1).allow(null).optional(),
    isPublished: Joi.boolean().optional()
  })
};

const updateDropSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    bannerImage: Joi.string().uri().allow('').optional(), // External URL for banner image
    bannerVideo: Joi.string().uri().allow('').optional(), // External URL for banner video
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    productIds: Joi.array().items(Joi.string()).optional(),
    purchaseLimitPerCustomer: Joi.number().integer().min(1).allow(null).optional(),
    isPublished: Joi.boolean().optional()
  })
};

/**
 * GET /api/drops/current
 * Get current live drop (public endpoint)
 */
router.get('/current',
  asyncHandler(async (_req: express.Request, res: ExpressResponse) => {
    const now = new Date();

    // First, update any upcoming drops that should be live now
    const liveUpdateResult = await prisma.drop.updateMany({
      where: {
        status: 'upcoming',
        startDate: { lte: now },
        endDate: { gte: now },
        isPublished: true
      },
      data: { status: 'live' }
    });

    // Also update any live drops that have passed their end date
    const archivedUpdateResult = await prisma.drop.updateMany({
      where: {
        status: 'live',
        endDate: { lt: now },
        isPublished: true
      },
      data: { status: 'archived' }
    });

    // Sync product status if any drop statuses changed
    if (liveUpdateResult.count > 0 || archivedUpdateResult.count > 0) {
      try {
        await ProductStatusService.syncProductStatus();
      } catch (syncError) {
        // Log but don't fail the request
        console.error('Error syncing product status:', syncError);
      }
    }

    // Find a drop that is published, has status 'live', and is currently active (within date range)
    // Only return drops with status 'live' - not 'upcoming' (even if dates match)
    // Also ensure the drop has at least one active product
    const drop = await prisma.drop.findFirst({
      where: {
        isPublished: true,
        status: 'live', // Only return drops explicitly marked as 'live'
        startDate: { lte: now },
        endDate: { gte: now },
        // Ensure drop has at least one active product
        dropProducts: {
          some: {
            product: {
              isActive: true
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        bannerImage: true,
        bannerVideo: true,
        startDate: true,
        endDate: true,
        status: true,
        purchaseLimitPerCustomer: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        dropProducts: {
          where: {
            product: {
              isActive: true // Only include active products
            }
          },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                compareAtPrice: true,
                category: true,
                sku: true,
                isActive: true,
                images: {
                  select: {
                    id: true,
                    url: true,
                    alt: true,
                    isPrimary: true,
                    sortOrder: true
                  },
                  orderBy: { sortOrder: 'asc' }
                },
                variants: {
                  select: {
                    id: true,
                    price: true,
                    compareAtPrice: true,
                    stockQty: true,
                    isActive: true
                  },
                  where: { isActive: true },
                  orderBy: { price: 'asc' }
                }
              }
            }
          }
        },
        _count: {
          select: {
            dropProducts: true,
            dropPurchases: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Additional validation: ensure drop exists and has products
    if (!drop || !drop.dropProducts || drop.dropProducts.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No active drop found'
      });
      return;
    }

    // Format products - images are already an array from the relation
    type DropProductWithImages = typeof drop.dropProducts[0];
    type ProductImageType = DropProductWithImages['product']['images'][0];

    // Filter out any inactive products (double-check)
    const activeDropProducts = drop.dropProducts.filter(
      (dp: DropProductWithImages) => dp.product.isActive === true
    );

    // If no active products, return 404
    if (activeDropProducts.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No active drop found'
      });
      return;
    }

    const formattedDrop = {
      ...drop,
      dropProducts: activeDropProducts.map((dp: DropProductWithImages) => ({
        ...dp,
        product: {
          ...dp.product,
          images: Array.isArray(dp.product.images)
            ? dp.product.images.map((img: ProductImageType) => ({
              url: typeof img === 'string' ? img : img.url,
              alt: typeof img === 'string' ? '' : (img.alt || (img as { altText?: string }).altText || ''),
              isPrimary: typeof img === 'string' ? false : (img.isPrimary || false)
            }))
            : []
        }
      }))
    };

    res.json({
      success: true,
      data: { drop: formattedDrop }
    });
  })
);

/**
 * GET /api/drops/archived
 * Get all archived drops (public endpoint)
 */
router.get('/archived', asyncHandler(async (_req: express.Request, res: ExpressResponse) => {
  const now = new Date();

  // Update ended drops to archived immediately
  await prisma.drop.updateMany({
    where: {
      status: { in: ['upcoming', 'live', 'ended'] },
      endDate: { lt: now },
      isPublished: true
    },
    data: { status: 'archived' }
  });

  const drops = await prisma.drop.findMany({
    where: {
      isPublished: true,
      status: 'archived'
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      bannerImage: true,
      startDate: true,
      endDate: true,
      status: true,
      purchaseLimitPerCustomer: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      dropProducts: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: {
                select: {
                  id: true,
                  url: true,
                  alt: true,
                  isPrimary: true,
                  sortOrder: true
                },
                orderBy: { sortOrder: 'asc' }
              }
            }
          }
        }
      },
      _count: {
        select: {
          dropProducts: true,
          dropPurchases: true
        }
      }
    },
    orderBy: { endDate: 'desc' }
  });

  // Format drops - transform images to proper format
  type DropWithProducts = typeof drops[0];
  type DropProductItem = DropWithProducts['dropProducts'][0];
  type ProductImage = DropProductItem['product']['images'][0];

  const formattedDrops = drops.map((drop: DropWithProducts) => ({
    ...drop,
    dropProducts: drop.dropProducts.map((dp: DropProductItem) => ({
      ...dp,
      product: {
        ...dp.product,
        images: Array.isArray(dp.product.images)
          ? dp.product.images.map((img: ProductImage) => ({
            url: img.url,
            alt: img.alt || '',
            isPrimary: img.isPrimary || false
          }))
          : []
      }
    }))
  }));

  res.json({
    success: true,
    data: { drops: formattedDrops }
  });
}));

/**
 * GET /api/drops
 * Get all published drops (public endpoint)
 * Note: This is skipped when accessed via /api/admin/drops (which uses the admin route below)
 */
router.get('/',
  (req: AuthenticatedRequest, _res: express.Response, next: express.NextFunction) => {
    // Skip this route if accessed via admin path (will be handled by admin route)
    if (req.originalUrl?.includes('/api/admin/drops') && !req.originalUrl?.includes('/current')) {
      return next('route'); // Skip to next matching route
    }
    next();
  },
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const status = req.query['status']; // optional filter
    const now = new Date();

    // First, update any upcoming drops that should be live or ended now
    await prisma.drop.updateMany({
      where: {
        status: 'upcoming',
        startDate: { lte: now },
        endDate: { gte: now },
        isPublished: true
      },
      data: { status: 'live' }
    });

    // Update ended drops to archived immediately (no 30-day wait)
    await prisma.drop.updateMany({
      where: {
        status: { in: ['upcoming', 'live'] },
        endDate: { lt: now },
        isPublished: true
      },
      data: { status: 'archived' }
    });

    // Also archive any legacy "ended" drops
    await prisma.drop.updateMany({
      where: {
        status: 'ended',
        endDate: { lt: now },
        isPublished: true
      },
      data: { status: 'archived' }
    });

    const where: Prisma.DropWhereInput = {
      isPublished: true
    };

    // Default to upcoming drops if no status filter is provided
    if (status) {
      where.status = String(status) as any;
      // When filtering by status, also check dates to ensure accuracy
      if (status === 'upcoming') {
        where.startDate = { gt: now }; // Upcoming drops haven't started yet
      } else if (status === 'live') {
        where.startDate = { lte: now }; // Live drops have started
        where.endDate = { gte: now }; // And haven't ended
      } else if (status === 'ended') {
        // Legacy support: ended drops are now archived immediately
        // But we still support querying by "ended" for backward compatibility
        where.endDate = { lt: now };
      } else if (status === 'archived') {
        // Archived drops: no date filtering needed, just show all archived
        // (archived status is managed by the scheduled job)
      }
    } else {
      // Default to upcoming drops - show drops that haven't started yet
      // Check by actual dates, not just status (in case status wasn't updated correctly)
      where.startDate = { gt: now }; // Only show drops that haven't started yet
      // Also filter by status to be safe
      where.status = { in: ['upcoming', 'live'] }; // Include both in case status wasn't updated
    }

    const drops = await prisma.drop.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        bannerImage: true,
        bannerVideo: true,
        startDate: true,
        endDate: true,
        status: true,
        purchaseLimitPerCustomer: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        dropProducts: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true
              }
            }
          }
        },
        _count: {
          select: {
            dropProducts: true,
            dropPurchases: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { drops }
    });
  })
);

/**
 * GET /api/admin/drops
 * Get all drops with pagination and filters (admin only)
 * Note: This route only works when router is mounted at /api/admin/drops
 */
router.get('/',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const page = parseInt(String(req.query['page'] || '1'));
    const limit = parseInt(String(req.query['limit'] || '10'));
    const skip = (page - 1) * limit;
    const search = req.query['search'];
    const status = req.query['status'];

    const where: Prisma.DropWhereInput = {};

    if (search) {
      const searchStr = String(search);
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { description: { contains: searchStr, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = String(status) as any;
    }

    const [drops, total] = await Promise.all([
      prisma.drop.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          bannerImage: true,
          startDate: true,
          endDate: true,
          status: true,
          purchaseLimitPerCustomer: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
          dropProducts: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true
                }
              }
            }
          },
          _count: {
            select: {
              dropProducts: true,
              dropPurchases: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.drop.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        drops,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

/**
 * POST /api/admin/drops
 * Create new drop
 */
router.post('/',
  authenticateToken,
  requireAdmin,
  validate(createDropSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const {
      name,
      description,
      bannerImage,
      bannerVideo,
      startDate,
      endDate,
      productIds,
      purchaseLimitPerCustomer,
      isPublished
    } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Determine initial status based on dates
    const now = new Date();
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    let initialStatus: 'upcoming' | 'live' | 'ended' = 'upcoming';
    if (endDateObj < now) {
      initialStatus = 'ended';
    } else if (startDateObj <= now && endDateObj >= now) {
      initialStatus = 'live';
    }

    // Create drop with products
    const drop = await prisma.$transaction(async (tx) => {
      // Create drop
      const newDrop = await tx.drop.create({
        data: {
          name,
          slug,
          description,
          bannerImage: bannerImage || null,
          bannerVideo: bannerVideo || null,
          startDate: startDateObj,
          endDate: endDateObj,
          purchaseLimitPerCustomer,
          isPublished: isPublished || false,
          status: initialStatus
        }
      });

      // Add products to drop
      if (productIds && productIds.length > 0) {
        await tx.dropProduct.createMany({
          data: productIds.map((productId: string) => ({
            dropId: newDrop.id,
            productId
          }))
        });
      }

      return newDrop;
    });

    // Sync product status after drop creation (if drop is live and published)
    if (drop.status === 'live' && drop.isPublished && productIds && productIds.length > 0) {
      try {
        await ProductStatusService.syncProductStatusForProducts(productIds);
      } catch (syncError) {
        // Log but don't fail the drop creation
        console.error('Error syncing product status after drop creation:', syncError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Drop created successfully',
      data: { drop }
    });
  })
);

/**
 * GET /api/admin/drops/:id
 * Get drop by ID
 */
router.get('/:id',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { id } = req.params;

    const drop = await prisma.drop.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        bannerImage: true,
        bannerVideo: true,
        startDate: true,
        endDate: true,
        status: true,
        purchaseLimitPerCustomer: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        dropProducts: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true
              }
            }
          }
        },
        _count: {
          select: {
            dropProducts: true,
            dropPurchases: true
          }
        }
      }
    });

    if (!drop) {
      res.status(404).json({
        success: false,
        error: 'Drop not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { drop }
    });
  })
);

/**
 * PUT /api/admin/drops/:id
 * Update drop
 */
router.put('/:id',
  authenticateToken,
  requireAdmin,
  validate(updateDropSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { id } = req.params;
    const {
      name,
      description,
      bannerImage,
      bannerVideo,
      startDate,
      endDate,
      productIds,
      purchaseLimitPerCustomer,
      isPublished
    } = req.body;

    // Get current drop to check existing dates
    const currentDrop = await prisma.drop.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        bannerImage: true,
        bannerVideo: true,
        startDate: true,
        endDate: true,
        status: true,
        purchaseLimitPerCustomer: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!currentDrop) {
      res.status(404).json({
        success: false,
        error: 'Drop not found'
      });
      return;
    }

    // Use updated dates or keep existing ones
    const startDateObj = startDate ? new Date(startDate) : currentDrop.startDate;
    const endDateObj = endDate ? new Date(endDate) : currentDrop.endDate;

    // Determine status based on dates if dates are being updated
    const now = new Date();
    let statusUpdate: 'upcoming' | 'live' | 'ended' | undefined;
    if (startDate || endDate) {
      if (endDateObj < now) {
        statusUpdate = 'ended';
      } else if (startDateObj <= now && endDateObj >= now) {
        statusUpdate = 'live';
      } else {
        statusUpdate = 'upcoming';
      }
    }

    // Generate slug from name if name is provided
    const updateData: Prisma.DropUpdateInput = {
      description,
      bannerImage: bannerImage !== undefined ? (bannerImage || null) : undefined,
        bannerVideo: bannerVideo !== undefined ? (bannerVideo || null) : undefined,
      startDate: startDate ? startDateObj : (undefined as any),
      endDate: endDate ? endDateObj : (undefined as any),
      purchaseLimitPerCustomer,
      isPublished
    };

    // Add status update if dates changed
    if (statusUpdate !== undefined) {
      updateData.status = statusUpdate;
    }

    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      updateData.name = name;
      updateData.slug = slug;
    }

    const drop = await prisma.$transaction(async (tx) => {
      // Update drop
      const updatedDrop = await tx.drop.update({
        where: { id: id as string },
        data: updateData,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          bannerImage: true,
          startDate: true,
          endDate: true,
          status: true,
          purchaseLimitPerCustomer: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Update products if provided
      if (productIds !== undefined) {
        // Remove existing products
        await tx.dropProduct.deleteMany({
          where: { dropId: id as string }
        });

        // Add new products
        if (productIds.length > 0) {
          await tx.dropProduct.createMany({
            data: productIds.map((productId: string) => ({
              dropId: id,
              productId
            }))
          });
        }
      }

      return updatedDrop;
    });

    // Sync product status after drop update
    // Sync all products if status changed or products changed
    try {
      if (statusUpdate !== undefined || productIds !== undefined) {
        // If products were changed, sync those specific products
        if (productIds !== undefined && productIds.length > 0) {
          await ProductStatusService.syncProductStatusForProducts(productIds);
        } else {
          // Otherwise sync products for this drop
          await ProductStatusService.syncProductStatusForDrop(drop.id);
        }
        // Also do a full sync to handle products removed from drop
        await ProductStatusService.syncProductStatus();
      }
    } catch (syncError) {
      // Log but don't fail the drop update
      console.error('Error syncing product status after drop update:', syncError);
    }

    res.json({
      success: true,
      message: 'Drop updated successfully',
      data: { drop }
    });
  })
);

/**
 * DELETE /api/admin/drops/:id
 * Delete drop
 */
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { id } = req.params;

    // Check if drop exists
    const existingDrop = await prisma.drop.findUnique({
      where: { id: id as string },
      select: { id: true }
    });

    if (!existingDrop) {
      res.status(404).json({
        success: false,
        error: 'Drop not found'
      });
      return;
    }

    // Get product IDs before deleting drop
    let productIds: string[] = [];
    try {
      const dropProducts = await prisma.dropProduct.findMany({
        where: { dropId: id as string },
        select: { productId: true }
      });
      productIds = dropProducts.map(dp => dp.productId);
    } catch (error) {
      // Log but continue with deletion
      console.error('Error fetching drop products:', error);
    }

    // Delete the drop (dropProducts and dropPurchases will be deleted via CASCADE)
    await prisma.drop.delete({
      where: { id: id as string }
    });

    // Send response immediately
    res.json({
      success: true,
      message: 'Drop deleted successfully'
    });

    // Sync product status after drop deletion (in background, don't block response)
    // Use setImmediate to ensure response is sent first
    setImmediate(async () => {
      try {
        if (productIds.length > 0) {
          // Sync specific products first
          await ProductStatusService.syncProductStatusForProducts(productIds);
        }
        // Always do a full sync to ensure consistency
        await ProductStatusService.syncProductStatus();
      } catch (syncError) {
        // Log but don't fail the drop deletion (response already sent)
        console.error('Error syncing product status after drop deletion:', syncError);
        // Also log via logger service if available
        try {
          const { logger } = await import('../services/loggerService');
          await logger.error('ProductStatusService: Error syncing after drop deletion', {
            error: syncError instanceof Error ? syncError.message : String(syncError),
            dropId: id,
            productIds: productIds.length
          });
        } catch (logError) {
          // Ignore logger errors
        }
      }
    });
  })
);

export default router;
