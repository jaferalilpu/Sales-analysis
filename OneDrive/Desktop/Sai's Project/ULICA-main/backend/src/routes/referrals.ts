// @ts-nocheck
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import Joi from 'joi';

const prisma = new PrismaClient();
import {
  generateReferralCode,
  getReferralSettings,
  updateReferralSettings,
  getUserReferralStats,
  getReferralLeaderboard,
  getAllReferrals,
  validateReferralCode,
  getUserByReferralCode
} from '../services/referralService';

const router = express.Router();

/**
 * GET /api/referrals/stats
 * Get user's referral statistics
 */
router.get('/stats',
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user.id;
    const stats = await getUserReferralStats(userId);

    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * GET /api/referrals/code
 * Get or generate user's referral code
 */
router.get('/code',
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user.id;
    
    // Check if user already has a referral code
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });

    let referralCode = user?.referralCode;
    
    if (!referralCode) {
      referralCode = await generateReferralCode(userId);
    }

    const baseUrl = process.env.FRONTEND_URL || 'https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app';
    const referralLink = `${baseUrl}/register?ref=${referralCode}`;

    res.json({
      success: true,
      data: {
        referralCode,
        referralLink
      }
    });
  })
);

/**
 * POST /api/referrals/validate
 * Validate a referral code
 */
router.post('/validate',
  validate({
    body: {
      code: Joi.string().required()
    }
  }),
  asyncHandler(async (req: any, res: any) => {
    const { code } = req.body;
    const isValid = await validateReferralCode(code);

    if (isValid) {
      const user = await getUserByReferralCode(code);
      res.json({
        success: true,
        data: {
          valid: true,
          referrer: user
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          valid: false
        }
      });
    }
  })
);

/**
 * GET /api/referrals/leaderboard
 * Get referral leaderboard
 */
router.get('/leaderboard',
  validate({
    query: {
      limit: Joi.number().integer().min(1).max(100).default(10)
    }
  }),
  asyncHandler(async (req: any, res: any) => {
    const { limit } = req.query;
    const leaderboard = await getReferralLeaderboard(limit);

    res.json({
      success: true,
      data: leaderboard
    });
  })
);

// Admin routes
/**
 * GET /api/referrals/admin/all
 * Get all referrals for admin
 */
router.get('/admin/all',
  authenticateToken,
  requireAdmin,
  validate({
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    }
  }),
  asyncHandler(async (req: any, res: any) => {
    const { page, limit } = req.query;
    const result = await getAllReferrals(page, limit);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * GET /api/referrals/admin/settings
 * Get referral settings
 */
router.get('/admin/settings',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: any, res: any) => {
    const settings = await getReferralSettings();

    res.json({
      success: true,
      data: settings
    });
  })
);

/**
 * PUT /api/referrals/admin/settings
 * Update referral settings
 */
router.put('/admin/settings',
  authenticateToken,
  requireAdmin,
  validate({
    body: {
      signupRewardPoints: Joi.number().integer().min(0),
      signupRewardAmount: Joi.number().integer().min(0),
      purchaseRewardPoints: Joi.number().integer().min(0),
      purchaseRewardAmount: Joi.number().integer().min(0),
      maxReferralsPerUser: Joi.number().integer().min(1).allow(null),
      isActive: Joi.boolean()
    }
  }),
  asyncHandler(async (req: any, res: any) => {
    const settings = req.body;
    const updatedSettings = await updateReferralSettings(settings);

    res.json({
      success: true,
      data: updatedSettings
    });
  })
);

/**
 * GET /api/referrals/admin/analytics
 * Get referral analytics
 */
router.get('/admin/analytics',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: any, res: any) => {
    const totalReferrals = await prisma.referral.count();
    const totalSignups = await prisma.referral.count({
      where: { status: 'joined' }
    });
    const totalPurchases = await prisma.referral.count({
      where: { status: 'purchased' }
    });
    const totalRewards = await prisma.referralReward.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true }
    });

    const conversionRate = totalReferrals > 0 ? (totalPurchases / totalReferrals) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalReferrals,
        totalSignups,
        totalPurchases,
        totalRewards: totalRewards._sum.amount || 0,
        conversionRate: Math.round(conversionRate * 100) / 100
      }
    });
  })
);

export default router;
