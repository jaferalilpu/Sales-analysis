import * as express from 'express';
import prisma from '../prisma/client';
import { asyncHandler, notFoundError } from '../middlewares/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { validate, addressSchemas } from '../middlewares/validation';
import { ExpressResponse } from '../types/express';
import { Prisma } from '@prisma/client';

const router = express.Router();

/**
 * GET /api/addresses
 * Get user's addresses
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: { addresses }
    });
  })
);

/**
 * POST /api/addresses
 * Create new address
 */
router.post('/',
  authenticateToken,
  validate(addressSchemas.create),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;
    const addressData = req.body;

    // If this is set as default, unset other defaults
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        ...addressData,
        userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: { address }
    });
  })
);

/**
 * GET /api/addresses/:id
 * Get address by ID
 */
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: {
        id: id as string,
        userId
      } as Prisma.AddressWhereInput
    });

    if (!address) {
      throw notFoundError('Address not found');
    }

    res.json({
      success: true,
      data: { address }
    });
  })
);

/**
 * PUT /api/addresses/:id
 * Update address
 */
router.put('/:id',
  authenticateToken,
  validate(addressSchemas.update),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const addressData = req.body;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id as string,
        userId
      } as Prisma.AddressWhereInput
    });

    if (!existingAddress) {
      throw notFoundError('Address not found');
    }

    // If this is set as default, unset other defaults
    if (addressData.isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id: id as string },
      data: addressData
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address }
    });
  })
);

/**
 * DELETE /api/addresses/:id
 * Delete address
 */
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: id as string,
        userId
      } as Prisma.AddressWhereInput
    });

    if (!address) {
      throw notFoundError('Address not found');
    }

    await prisma.address.delete({
      where: { id: id as string } as any
    });

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  })
);

/**
 * PUT /api/addresses/:id/set-default
 * Set address as default
 */
router.put('/:id/set-default',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: id as string,
        userId
      } as Prisma.AddressWhereInput
    });

    if (!address) {
      throw notFoundError('Address not found');
    }

    // Unset all other defaults
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    // Set this address as default
    const updatedAddress = await prisma.address.update({
      where: { id: id as string },
      data: { isDefault: true }
    });

    res.json({
      success: true,
      message: 'Address set as default',
      data: { address: updatedAddress }
    });
  })
);

export default router;
