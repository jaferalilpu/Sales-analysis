// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReferralStats {
  totalReferrals: number;
  totalRewards: number;
  pendingRewards: number;
  referrals: Array<{
    id: string;
    referredUser: {
      id: string;
      name: string;
      email: string;
      createdAt: Date;
    };
    status: string;
    signupReward: number;
    purchaseReward: number;
    totalReward: number;
    createdAt: Date;
  }>;
}

export interface ReferralSettings {
  signupRewardPoints: number;
  signupRewardAmount: number;
  purchaseRewardPoints: number;
  purchaseRewardAmount: number;
  maxReferralsPerUser?: number;
  isActive: boolean;
}

/**
 * Generate a unique referral code for a user
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Generate code based on user info + random string
  const userName = user.firstName ? `${user.firstName}${user.lastName || ''}`.replace(/\s+/g, '') : '';
  const baseCode = userName ? 
    userName.toUpperCase().substring(0, 4) : 
    user.email.substring(0, 4).toUpperCase();
  
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  let code = `ULICA${baseCode}${randomSuffix}`;

  // Ensure uniqueness
  let counter = 1;
  while (await prisma.referral.findFirst({ where: { code: code } })) {
    code = `ULICA${baseCode}${randomSuffix}${counter}`;
    counter++;
  }

  return code;
}

/**
 * Get or create referral settings
 */
export async function getReferralSettings() {
  // Default referral settings
  return {
    signupRewardPoints: 100,
    signupRewardAmount: 0,
    purchaseRewardPoints: 500,
    purchaseRewardAmount: 0,
    maxReferralsPerUser: 10,
    isActive: true
  };
}

/**
 * Update referral settings
 */
export async function updateReferralSettings(settings: Partial<ReferralSettings>) {
  // Settings are now hardcoded - in a real app, store in database
  return getReferralSettings();
}

/**
 * Process referral when user signs up
 */
export async function processReferralSignup(referredUserId: string, code?: string): Promise<void> {
  if (!code) return;

  const settings = await getReferralSettings();
  if (!settings.isActive) return;

  // Find referrer by code
  const referral = await prisma.referral.findFirst({
    where: { code: code.toUpperCase() },
    include: { referrer: true }
  });
  
  if (!referral) return;
  const referrer = referral.referrer;

  if (!referrer) return;

  // Check if user is trying to refer themselves
  if (referrer.id === referredUserId) return;

  // Check max referrals limit
  if (settings.maxReferralsPerUser) {
    const referralCount = await prisma.referral.count({
      where: { referrerId: referrer.id }
    });
    
    if (referralCount >= settings.maxReferralsPerUser) return;
  }

  // Create referral record
  const newReferral = await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      referredId: referredUserId,
      signupReward: settings.signupRewardPoints,
      purchaseReward: settings.purchaseRewardPoints,
      totalReward: settings.signupRewardPoints
    }
  });

  // Create reward record for referrer
  if (settings.signupRewardPoints > 0 || settings.signupRewardAmount > 0) {
    await prisma.referralReward.create({
      data: {
        userId: referrer.id,
        referralId: referral.id,
        type: 'signup',
        amount: settings.signupRewardAmount || settings.signupRewardPoints,
        description: `Referral signup reward for ${code}`,
        status: 'approved'
      }
    });
  }

  // Update user's referredBy field
  await prisma.user.update({
    where: { id: referredUserId },
    data: { referredBy: referrer.id }
  });
}

/**
 * Process referral when user makes first purchase
 */
export async function processReferralPurchase(userId: string, orderAmount: number): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { referredUser: true }
  });

  if (!user || !user.referredUser) return;

  const settings = await getReferralSettings();
  if (!settings.isActive) return;

  // Check if this is the user's first order
  const orderCount = await prisma.order.count({
    where: { userId, paymentStatus: 'paid' }
  });

  if (orderCount > 1) return; // Not first order

  // Update referral status
  await prisma.referral.update({
    where: { id: user.referredUser.id },
    data: {
      status: 'purchased',
      totalReward: {
        increment: settings.purchaseRewardPoints
      }
    }
  });

  // Create reward record for referrer
  if (settings.purchaseRewardPoints > 0 || settings.purchaseRewardAmount > 0) {
    await prisma.referralReward.create({
      data: {
        userId: user.referredUser.referrerId,
        referralId: user.referredUser.id,
        type: 'purchase',
        amount: settings.purchaseRewardAmount || settings.purchaseRewardPoints,
        description: `Referral purchase reward for first order`,
        status: 'approved'
      }
    });
  }
}

/**
 * Get user's referral statistics
 */
export async function getUserReferralStats(userId: string): Promise<ReferralStats> {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: {
      referredUser: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalRewards = await prisma.referralReward.aggregate({
    where: { 
      userId,
      status: 'approved'
    },
    _sum: { amount: true }
  });

  const pendingRewards = await prisma.referralReward.aggregate({
    where: { 
      userId,
      status: 'pending'
    },
    _sum: { amount: true }
  });

  return {
    totalReferrals: referrals.length,
    totalRewards: totalRewards._sum.amount || 0,
    pendingRewards: pendingRewards._sum.amount || 0,
    referrals: referrals.map(ref => ({
      id: ref.id,
      referredUser: ref.referredUser,
      status: ref.status,
      signupReward: ref.signupReward,
      purchaseReward: ref.purchaseReward,
      totalReward: ref.totalReward,
      createdAt: ref.createdAt
    }))
  };
}

/**
 * Get referral leaderboard
 */
export async function getReferralLeaderboard(limit: number = 10) {
  const leaderboard = await prisma.referral.groupBy({
    by: ['referrerId'],
    _count: { id: true },
    _sum: { totalReward: true },
    orderBy: {
      _count: { id: 'desc' }
    },
    take: limit
  });

  const leaderboardWithUsers = await Promise.all(
    leaderboard.map(async (item) => {
      const user = await prisma.user.findUnique({
        where: { id: item.referrerId },
        select: { id: true, name: true, email: true }
      });

      return {
        user,
        referralCount: item._count.id,
        totalRewards: item._sum.totalReward || 0
      };
    })
  );

  return leaderboardWithUsers;
}

/**
 * Get all referrals for admin
 */
export async function getAllReferrals(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const referrals = await prisma.referral.findMany({
    skip,
    take: limit,
    include: {
      referrer: {
        select: { id: true, name: true, email: true }
      },
      referredUser: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.referral.count();

  return {
    referrals,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Validate referral code
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { code: code.toUpperCase() }
  });

  return !!user;
}

/**
 * Get user by referral code
 */
export async function getUserByReferralCode(code: string) {
  const referral = await prisma.referral.findFirst({
    where: { code: code.toUpperCase() },
    include: { referrer: true }
  });
  
  return referral?.referrer || null;
}
