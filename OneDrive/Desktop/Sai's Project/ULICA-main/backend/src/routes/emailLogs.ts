import { Router, Response } from 'express';
import prisma from '../prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { Middleware } from '../types/express';
import { Prisma } from '@prisma/client';

const router = Router();

const requireAdmin: Middleware = (req: AuthenticatedRequest, _res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new CustomError('Admin access required', 403);
  }
  next();
};

router.get(
  '/',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = Number(req.query['page'] ?? 1);
    const limit = Math.min(Number(req.query['limit'] ?? 20), 100);
    const status = req.query['status'] as string | undefined;
    const search = (req.query['search'] as string | undefined)?.trim();

    const where: Prisma.EmailLogWhereInput = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { to: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await prisma.$transaction([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.emailLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }),
);

router.post(
  '/:id/retry',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params['id'] as string;
    if (!id) {
      throw new CustomError('Email log ID is required', 400);
    }

    const log = await prisma.emailLog.findUnique({ where: { id } });

    if (!log) {
      throw new CustomError('Email log not found', 404);
    }

    const now = new Date();

    await prisma.emailLog.update({
      where: { id: id },
      data: {
        status: 'queued',
        scheduledRetryAt: now,
        lastError: null,
      },
    });

    res.json({
      success: true,
      message: 'Email queued for retry',
    });
  }),
);

export default router;

