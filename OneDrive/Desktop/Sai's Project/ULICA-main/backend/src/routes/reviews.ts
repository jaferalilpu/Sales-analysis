import * as express from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { sanitizeInput, preventSQLInjection } from '../middlewares/security';
import * as Joi from 'joi';

const router = express.Router();

// Validation schemas
const createReviewSchema = {
  body: Joi.object({
    productId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    title: Joi.string().required(),
    comment: Joi.string().required(),
  })
};

// Get all reviews (Admin only)
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { status, productId, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.ReviewWhereInput = {};

    if (status === 'approved') {
      where.isApproved = true;
    } else if (status === 'pending' || status === 'rejected') {
      where.isApproved = false;
    }

    if (productId) {
      where.productId = String(productId) as any;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      productId: review.productId,
      productName: review.product.title,
      userId: review.userId,
      userName: review.user.firstName ? `${review.user.firstName} ${review.user.lastName || ''}`.trim() : 'Anonymous',
      userEmail: review.user.email,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isApproved: review.isApproved,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  })
);

// Get single review (Admin only)
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const id = req.params['id'];
    if (!id) {
      throw new CustomError('Review ID is required', 400);
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!review) {
      throw new CustomError('Review not found', 404);
    }

    res.json({
      success: true,
      data: {
        review: {
          id: review.id,
          productId: review.productId,
          productName: review.product.title,
          userId: review.userId,
          userName: review.user.firstName ? `${review.user.firstName} ${review.user.lastName || ''}`.trim() : 'Anonymous',
          userEmail: review.user.email,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isApproved: review.isApproved,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        },
      },
    });
  })
);

// Approve review (Admin only)
router.patch(
  '/:id/approve',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const id = req.params['id'];
    if (!id) {
      throw new CustomError('Review ID is required', 400);
    }

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new CustomError('Review not found', 404);
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { isApproved: true },
    });

    res.json({
      success: true,
      message: 'Review approved successfully',
      data: { review: updatedReview },
    });
  })
);

// Reject review (Admin only)
router.patch(
  '/:id/reject',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const id = req.params['id'];
    if (!id) {
      throw new CustomError('Review ID is required', 400);
    }

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new CustomError('Review not found', 404);
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { isApproved: false },
    });

    res.json({
      success: true,
      message: 'Review rejected successfully',
      data: { review: updatedReview },
    });
  })
);

// Delete review (Admin only)
router.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const id = req.params['id'];
    if (!id) {
      throw new CustomError('Review ID is required', 400);
    }

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new CustomError('Review not found', 404);
    }

    await prisma.review.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  })
);

// Create review (Customer)
router.post(
  '/',
  authenticateToken,
  sanitizeInput,
  preventSQLInjection,
  validate(createReviewSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user!.id;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new CustomError('Product not found', 404);
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingReview) {
      throw new CustomError('You have already reviewed this product', 400);
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId,
        status: 'delivered',
        items: {
          some: {
            productId,
          },
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title,
        comment,
        isApproved: false // Pending approval
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review,
        verifiedPurchase: !!hasPurchased
      },
    });
  })
);

export default router;