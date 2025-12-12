import * as express from 'express';
import prisma from '../prisma/client';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { sanitizeInput, preventSQLInjection } from '../middlewares/security';
import * as Joi from 'joi';

const router = express.Router();

// Validation schemas
const createCouponSchema = {
  body: Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().optional(),
    type: Joi.string().valid('percentage', 'fixed').required(),
    value: Joi.number().min(0).required(),
    minAmount: Joi.number().min(0).optional(),
    maxDiscount: Joi.number().min(0).optional(),
    usageLimit: Joi.number().min(0).optional(),
    validFrom: Joi.date().required(),
    validUntil: Joi.date().required(),
  })
};

const updateCouponSchema = {
  body: Joi.object({
    code: Joi.string().optional(),
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    type: Joi.string().valid('percentage', 'fixed').optional(),
    value: Joi.number().min(0).optional(),
    minAmount: Joi.number().min(0).optional(),
    maxDiscount: Joi.number().min(0).optional(),
    usageLimit: Joi.number().min(0).optional(),
    validFrom: Joi.date().optional(),
    validUntil: Joi.date().optional(),
    isActive: Joi.boolean().optional(),
  })
};

// Get all coupons (Admin only)
router.get('/',
  authenticateToken,
  asyncHandler(async (_req: AuthenticatedRequest, res: express.Response) => {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formattedCoupons = coupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumAmount: coupon.minimumAmount,
      maximumDiscount: coupon.maximumDiscount,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      isActive: coupon.isActive,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      createdAt: coupon.createdAt,
    }));

    res.json({
      success: true,
      data: {
        coupons: formattedCoupons,
      },
    });
  })
);

// Get single coupon (Admin only)
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const id = req.params['id'] as string;

    if (!id) {
      throw new CustomError('Coupon ID is required', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new CustomError('Coupon not found', 404);
    }

    res.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          minimumAmount: coupon.minimumAmount,
          maximumDiscount: coupon.maximumDiscount,
          usageLimit: coupon.usageLimit,
          usedCount: coupon.usedCount,
          isActive: coupon.isActive,
          startsAt: coupon.startsAt,
          expiresAt: coupon.expiresAt,
          createdAt: coupon.createdAt,
        },
      },
    });
  })
);

// Create new coupon (Admin only)
router.post('/',
  authenticateToken,
  sanitizeInput,
  preventSQLInjection,
  validate(createCouponSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const {
      code,
      name,
      description,
      type,
      value,
      minAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      throw new CustomError('Coupon code already exists', 400);
    }

    // Validate date range
    if (new Date(validFrom) >= new Date(validUntil)) {
      throw new CustomError('Valid until date must be after valid from date', 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        type,
        value,
        minimumAmount: minAmount,
        maximumDiscount: maxDiscount,
        usageLimit,
        startsAt: new Date(validFrom),
        expiresAt: new Date(validUntil),
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon },
    });
  })
);

// Update coupon (Admin only)
router.put('/:id',
  authenticateToken,
  sanitizeInput,
  preventSQLInjection,
  validate(updateCouponSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new CustomError('Coupon ID is required', 400);
    }

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      throw new CustomError('Coupon not found', 404);
    }

    // Check if new code conflicts with existing coupons
    if (updateData.code && updateData.code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: updateData.code.toUpperCase() },
      });

      if (codeExists) {
        throw new CustomError('Coupon code already exists', 400);
      }
      updateData.code = updateData.code.toUpperCase();
    }

    // Validate date range if both dates are provided
    if (updateData.validFrom && updateData.validUntil) {
      if (new Date(updateData.validFrom) >= new Date(updateData.validUntil)) {
        throw new CustomError('Valid until date must be after valid from date', 400);
      }
    }

    // Map field names from API to Prisma schema
    const prismaUpdateData: any = { ...updateData };
    if (updateData.minAmount !== undefined) {
      prismaUpdateData.minimumAmount = updateData.minAmount;
      delete prismaUpdateData.minAmount;
    }
    if (updateData.maxDiscount !== undefined) {
      prismaUpdateData.maximumDiscount = updateData.maxDiscount;
      delete prismaUpdateData.maxDiscount;
    }
    if (updateData.validFrom !== undefined) {
      prismaUpdateData.startsAt = new Date(updateData.validFrom);
      delete prismaUpdateData.validFrom;
    }
    if (updateData.validUntil !== undefined) {
      prismaUpdateData.expiresAt = new Date(updateData.validUntil);
      delete prismaUpdateData.validUntil;
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: prismaUpdateData,
    });

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon },
    });
  })
);

// Patch coupon (Admin only) - for partial updates like status changes
router.patch('/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const id = req.params['id'] as string;
    const updateData = req.body;

    if (!id) {
      throw new CustomError('Coupon ID is required', 400);
    }

    if (!id) {
      throw new CustomError('Coupon ID is required', 400);
    }

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      throw new CustomError('Coupon not found', 404);
    }

    // Map field names if needed
    const prismaUpdateData: any = { ...updateData };
    if (updateData.minAmount !== undefined) {
      prismaUpdateData.minimumAmount = updateData.minAmount;
      delete prismaUpdateData.minAmount;
    }
    if (updateData.maxDiscount !== undefined) {
      prismaUpdateData.maximumDiscount = updateData.maxDiscount;
      delete prismaUpdateData.maxDiscount;
    }
    if (updateData.validFrom !== undefined) {
      prismaUpdateData.startsAt = new Date(updateData.validFrom);
      delete prismaUpdateData.validFrom;
    }
    if (updateData.validUntil !== undefined) {
      prismaUpdateData.expiresAt = new Date(updateData.validUntil);
      delete prismaUpdateData.validUntil;
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: prismaUpdateData,
    });

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon },
    });
  })
);

// Delete coupon (Admin only)
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { id } = req.params;

    if (!id) {
      throw new CustomError('Coupon ID is required', 400);
    }

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      throw new CustomError('Coupon not found', 404);
    }

    await prisma.coupon.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  })
);

export default router;