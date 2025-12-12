import * as express from 'express';
import { OrderStatus } from '@prisma/client';
import prisma from '../prisma/client';
import { asyncHandler, notFoundError, CustomError } from '../middlewares/errorHandler';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import Joi from 'joi';
import { Prisma } from '@prisma/client';
import { transitionOrderStatus } from '../services/orderStatusService';
import { ExpressResponse } from '../types/express';

const router = express.Router();

/**
 * GET /api/orders
 * Get user's orders
 */
router.get('/',
  authenticateToken,
  validate({
    query: {
      page: require('joi').number().integer().min(1).default(1),
      limit: require('joi').number().integer().min(1).max(50).default(10),
      status: require('joi').string().optional(),
      paymentStatus: require('joi').string().optional()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status, paymentStatus } = req.query;

    // Build where clause
    const where: Prisma.OrderWhereInput = { userId };
    if (status) where.status = String(status) as any;
    if (paymentStatus) where.paymentStatus = String(paymentStatus) as any;

    // Get total count
    const totalCount = await prisma.order.count({ where });

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      }
    });
  })
);

/**
 * GET /api/orders/:id
 * Get order by ID
 */
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;
    const id = req.params['id'];

    const order = await prisma.order.findFirst({
      where: {
        id: id as string,
        userId
      } as Prisma.OrderWhereInput,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      throw notFoundError('Order not found');
    }

    res.json({
      success: true,
      data: { order }
    });
  })
);

/**
 * POST /api/orders
 * Create new order
 */
router.post('/',
  optionalAuth,
  validate({}),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const {
      items,
      couponCode,
      email,
      phone,
      notes
    } = req.body;

    const userId = req.user?.id;

    // Validate and calculate order totals
    const { orderItems, subtotal, discountAmount, shippingAmount, taxAmount, totalAmount } =
      await calculateOrderTotals(items, couponCode);

    // Check stock availability
    await validateStockAvailability(orderItems);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        ...(userId && { userId }),
        email: email || req.user?.email,
        phone: phone || req.user?.phone,
        totalAmount,
        subtotalAmount: subtotal,
        shippingAmount,
        taxAmount,
        discountAmount,
        status: 'pending',
        paymentStatus: 'pending',
        notes,
        items: {
          create: orderItems.map((item: any) => ({
            variantId: item.variantId,
            qty: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      } as any,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  })
);

/**
 * PUT /api/orders/:id/status
 * Update order status (admin only)
 */
router.put('/:id/status',
  authenticateToken,
  validate({
    body: Joi.object({
      status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
        .required(),
      trackingNumber: Joi.string().allow('', null),
      notes: Joi.string().allow('', null)
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    if (req.user!.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body as {
      status: OrderStatus;
      trackingNumber?: string | null;
      notes?: string | null;
    };

    const ORDER_DETAIL_INCLUDE = {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true }
                  }
                }
              }
            }
          }
        }
      },
      user: {
        select: {
          name: true,
          email: true,
          phone: true
        }
      }
    } as const;

    if (!id) {
      throw new CustomError('Order ID is required', 400);
    }

    const order = await prisma.$transaction(async (tx) => {
      await transitionOrderStatus(id, status, { client: tx });

      if (trackingNumber !== undefined || notes !== undefined) {
        // Update tracking in OrderFulfillment if it exists, otherwise update Order.trackingUrl
        if (trackingNumber !== undefined) {
          await tx.orderFulfillment.upsert({
            where: { orderId: id },
            update: {
              trackingNumber: trackingNumber ?? null
            },
            create: {
              orderId: id,
              trackingNumber: trackingNumber ?? null
            }
          });
        }
        if (notes !== undefined) {
          await tx.order.update({
            where: { id },
            data: {
              notes: notes ?? null
            }
          });
        }
      }

      return tx.order.findUniqueOrThrow({
        where: { id: id as string },
        include: ORDER_DETAIL_INCLUDE
      });
    });

    res.json({
      success: true,
      message: 'Order status updated',
      data: { order }
    });
  })
);

/**
 * GET /api/orders/tracking/:orderNumber
 * Track order by order number
 */
router.get('/tracking/:orderNumber',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber as string },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw notFoundError('Order not found');
    }

    // If user is logged in, check if order belongs to them
    if (req.user && order.userId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    res.json({
      success: true,
      data: { order }
    });
  })
);

// Helper functions
async function calculateOrderTotals(items: Array<{ variantId: string; quantity: number }>, couponCode?: string) {
  let subtotal = 0;
  let discountAmount = 0;
  let shippingAmount = 0;
  let taxAmount = 0;

  const orderItems = [];

  // Calculate subtotal and validate items
  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true }
    });

    if (!variant || !variant.isActive) {
      throw new CustomError(`Invalid product variant: ${item.variantId}`, 400);
    }

    if (variant.stockQty < item.quantity) {
      throw new CustomError(`Insufficient stock for ${variant.product.title}`, 400);
    }

    const itemTotal = variant.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: variant.price,
      totalPrice: itemTotal
    });
  }

  // Apply coupon discount
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: couponCode,
        isActive: true,
        AND: [
          {
            OR: [
              { startsAt: null },
              { startsAt: { lte: new Date() } }
            ]
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: new Date() } }
            ]
          }
        ]
      } as any
    });

    if (coupon && subtotal >= (coupon.minimumAmount || 0)) {
      if (coupon.type === 'percentage') {
        discountAmount = Math.min(
          (subtotal * coupon.value) / 100,
          coupon.maximumDiscount || Infinity
        );
      } else if (coupon.type === 'flat') {
        discountAmount = coupon.value;
      }
    }
  }

  // Calculate shipping (simplified - you can integrate with shipping APIs)
  shippingAmount = subtotal > 100000 ? 0 : 5000; // Free shipping above ₹1000

  // Calculate tax (simplified - 18% GST)
  const taxableAmount = subtotal - discountAmount;
  taxAmount = Math.round(taxableAmount * 0.18);

  const totalAmount = subtotal - discountAmount + shippingAmount + taxAmount;

  return {
    orderItems,
    subtotal,
    discountAmount,
    shippingAmount,
    taxAmount,
    totalAmount
  };
}

async function validateStockAvailability(orderItems: Array<{ variantId: string; quantity: number }>) {
  for (const item of orderItems) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId }
    });

    if (!variant || variant.stockQty < item.quantity) {
      throw new CustomError(`Insufficient stock for variant ${item.variantId}`, 400);
    }
  }
}

export default router;