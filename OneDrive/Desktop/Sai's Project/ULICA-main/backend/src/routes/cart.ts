import * as express from 'express';
import prisma from '../prisma/client';
import { asyncHandler, notFoundError, CustomError } from '../middlewares/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { ExpressResponse } from '../types/express';

const router = express.Router();

/**
 * GET /api/cart
 * Get user's cart items
 */
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
        variant: {
          include: {
            images: {
              where: { isPrimary: true },
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant?.price ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

    res.json({
      success: true,
      data: {
        items: cartItems,
        subtotal,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  })
);

/**
 * POST /api/cart/add
 * Add item to cart
 */
router.post(
  '/add',
  authenticateToken,
  validate({}),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;
    const { variantId, quantity } = req.body;

    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        isActive: true,
        product: {
          isActive: true,
        },
      },
      include: {
        product: true,
      },
    });

    if (!variant) {
      throw notFoundError('Product variant not found');
    }

    if (variant.stockQty < quantity) {
      throw new Error('Insufficient stock');
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId: variant.productId,
        variantId: variant.id,
      },
    });

    let cartItem;
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (variant.stockQty < newQuantity) {
        throw new Error('Insufficient stock');
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: true,
          variant: true,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId: variant.productId,
          variantId: variant.id,
          quantity,
        },
        include: {
          product: true,
          variant: true,
        },
      });
    }

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cartItem },
    });
  })
);

/**
 * PUT /api/cart/update/:itemId
 * Update cart item quantity
 */
router.put(
  '/update/:itemId',
  authenticateToken,
  validate({}),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId) {
      throw new CustomError('Item ID is required', 400);
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!cartItem) {
      throw notFoundError('Cart item not found');
    }

    if (cartItem.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: cartItem.variantId },
      });

      if (!variant) {
        throw notFoundError('Product variant not found');
      }

      if (variant.stockQty < quantity) {
        throw new Error('Insufficient stock');
      }
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: true,
        variant: true,
      },
    });

    res.json({
      success: true,
      message: 'Cart item updated',
      data: { cartItem: updatedItem },
    });
  })
);

/**
 * DELETE /api/cart/remove/:itemId
 * Remove item from cart
 */
router.delete(
  '/remove/:itemId',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;
    const { itemId } = req.params;

    if (!itemId) {
      throw new CustomError('Item ID is required', 400);
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!cartItem) {
      throw notFoundError('Cart item not found');
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  })
);

/**
 * DELETE /api/cart/clear
 * Clear entire cart
 */
router.delete(
  '/clear',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;

    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  })
);

/**
 * GET /api/cart/count
 * Get cart item count
 */
router.get(
  '/count',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;

    const count = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });

    res.json({
      success: true,
      data: { count: count._sum.quantity || 0 },
    });
  })
);

export default router;
