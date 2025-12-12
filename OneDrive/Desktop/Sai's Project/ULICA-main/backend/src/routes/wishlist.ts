import * as express from 'express';
import prisma from '../prisma/client';
import { asyncHandler, CustomError, notFoundError } from '../middlewares/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { validate, wishlistSchemas } from '../middlewares/validation';

const router = express.Router();

/**
 * GET /api/wishlist
 * Get user's wishlist items
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.id;

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' }
            },
            variants: {
              where: { isActive: true },
              orderBy: { price: 'asc' }
            },
            _count: {
              select: { reviews: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average ratings and prices
    const itemsWithDetails = await Promise.all(
      wishlistItems.map(async (item) => {
        const reviews = await prisma.review.aggregate({
          where: { productId: item.product.id },
          _avg: { rating: true }
        });

        return {
          ...item,
          product: {
            ...item.product,
            averageRating: reviews._avg.rating || 0,
            reviewCount: item.product._count.reviews,
            minPrice: Math.min(...item.product.variants.map(v => v.price)),
            maxPrice: Math.max(...item.product.variants.map(v => v.price)),
            inStock: item.product.variants.some(v => v.stockQty > 0)
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        items: itemsWithDetails,
        totalItems: wishlistItems.length
      }
    });
  })
);

/**
 * POST /api/wishlist/add
 * Add product to wishlist
 */
router.post('/add',
  authenticateToken,
  validate(wishlistSchemas.addItem),
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.id;
    const { productId } = req.body;

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { 
        id: productId
      }
    });
    
    if (!product || !product.isActive) {
      throw notFoundError('Product not found or not available');
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId,
        productId: productId as string
      }
    });

    if (existingItem) {
      throw new CustomError('Product already in wishlist', 400);
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId
      },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true }
            },
            variants: {
              where: { isActive: true },
              orderBy: { price: 'asc' },
              take: 1
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: { wishlistItem }
    });
  })
);

/**
 * DELETE /api/wishlist/remove/:productId
 * Remove product from wishlist
 */
router.delete('/remove/:productId',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.id;
    const { productId } = req.params;

    // Check if wishlist item exists
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId,
        productId: productId as string
      }
    });

    if (!wishlistItem) {
      throw notFoundError('Product not found in wishlist');
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: { id: wishlistItem.id }
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  })
);

/**
 * DELETE /api/wishlist/clear
 * Clear entire wishlist
 */
router.delete('/clear',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.id;

    await prisma.wishlistItem.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Wishlist cleared'
    });
  })
);

/**
 * GET /api/wishlist/check/:productId
 * Check if product is in wishlist
 */
router.get('/check/:productId',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.id;
    const { productId } = req.params;

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId,
        productId: productId as string
      }
    });

    res.json({
      success: true,
      data: { isInWishlist: !!wishlistItem }
    });
  })
);

/**
 * GET /api/wishlist/count
 * Get wishlist item count
 */
router.get('/count',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.id;

    const count = await prisma.wishlistItem.count({
      where: { userId }
    });

    res.json({
      success: true,
      data: { count }
    });
  })
);

export default router;
