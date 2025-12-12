import { Router, Response } from 'express';
import prisma from '../prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { Prisma } from '@prisma/client';
import Joi from 'joi';

const router = Router();

const customersQuerySchema = {
  query: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    search: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
    minOrders: Joi.number().min(0).optional(),
    maxOrders: Joi.number().min(0).optional(),
    minSpend: Joi.number().min(0).optional(),
    maxSpend: Joi.number().min(0).optional(),
  }),
};

router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'admin') {
      throw new CustomError('Admin access required', 403);
    }

    // Validate query parameters
    validate(customersQuerySchema)(req, res, () => { });
    if (res.headersSent) return; // Validation failed, response already sent

    const { page, limit, search, status, minOrders, maxOrders, minSpend, maxSpend } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.UserWhereInput = { role: 'customer' };

    if (search) {
      const searchStr = String(search);
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
        { phone: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.isActive = status === 'active';
    }

    const baseQuery = prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        orders: {
          select: {
            totalAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    const [customersRaw, totalCount, totals] = await prisma.$transaction([
      baseQuery,
      prisma.user.count({ where }),
      prisma.order.aggregate({
        where: { user: { role: 'customer' } },
        _sum: { totalAmount: true },
        _count: true,
      }),
    ]);

    const customers = customersRaw
      .map((customer) => {
        const orderCount = customer.orders.length;
        const totalSpend = customer.orders.reduce((sum: number, order: { totalAmount: number | null }) => sum + (order.totalAmount || 0), 0);

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          isActive: customer.isActive,
          createdAt: customer.createdAt,
          orderCount,
          totalSpend,
        };
      })
      .filter((customer) => {
        if (typeof minOrders === 'number' && customer.orderCount < minOrders) return false;
        if (typeof maxOrders === 'number' && customer.orderCount > maxOrders) return false;
        if (typeof minSpend === 'number' && customer.totalSpend < minSpend) return false;
        if (typeof maxSpend === 'number' && customer.totalSpend > maxSpend) return false;
        return true;
      });

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum),
        },
        metrics: {
          totalCustomers: totalCount,
          totalOrders: totals._count,
          totalRevenue: totals._sum.totalAmount ?? 0,
        },
      },
    });
  }),
);

router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'admin') {
      throw new CustomError('Admin access required', 403);
    }

    const id = req.params['id'] as string;
    if (!id) {
      throw new CustomError('Customer ID is required', 400);
    }

    const customer = await prisma.user.findFirst({
      where: { id, role: 'customer' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
            createdAt: true,
          },
          take: 20,
        },
        addresses: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });

    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }

    const totalSpend = customer.orders.reduce(
      (sum, order) => sum + (order.totalAmount ?? 0),
      0,
    );

    res.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          isActive: customer.isActive,
          createdAt: customer.createdAt,
          orderCount: customer._count.orders,
          reviewCount: customer._count.reviews,
          totalSpend,
          recentOrders: customer.orders,
          addresses: customer.addresses,
        },
      },
    });
  }),
);

export default router;

