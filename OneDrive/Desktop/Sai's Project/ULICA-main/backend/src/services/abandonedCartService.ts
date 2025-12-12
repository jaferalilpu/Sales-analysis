import { PrismaClient, CartItem } from '@prisma/client';
import { CustomError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export interface AbandonedCartData {
  userId: string; // Required - must have userId
  items: any[];
  totalAmount: number;
}

export interface AbandonedCartReminder {
  id: string;
  email: string;
  items: any[];
  totalAmount: number;
  lastActivity: Date;
  reminderSent: number;
  recovered: boolean;
}

/**
 * Track abandoned cart
 */
export async function trackAbandonedCart(data: AbandonedCartData) {
  const { userId, items, totalAmount } = data;

  if (!userId) {
    throw new CustomError('userId is required for abandoned cart tracking', 400);
  }

  // Check if cart already exists
  const existingCart = await prisma.abandonedCart.findFirst({
    where: {
      userId,
      recovered: false
    }
  });

  if (existingCart) {
    // Update existing cart (updatedAt will be automatically updated)
    return await prisma.abandonedCart.update({
      where: { id: existingCart.id },
      data: {
        items: items as CartItem[],
        totalAmount
      }
    });
  } else {
    // Create new abandoned cart
    return await prisma.abandonedCart.create({
      data: {
        userId,
        items: items as CartItem[],
        totalAmount
      }
    });
  }
}

/**
 * Get abandoned carts for email campaigns
 * Note: reminderSent tracking is not available in current schema
 */
export async function getAbandonedCartsForReminder(
  hoursSinceLastActivity: number = 24,
  _maxReminders: number = 3
) {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursSinceLastActivity);

  const carts = await prisma.abandonedCart.findMany({
    where: {
      recovered: false,
      updatedAt: { lte: cutoffTime }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { updatedAt: 'asc' }
  });

  return carts.map(cart => ({
    ...cart,
    items: typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items
  }));
}

/**
 * Mark cart as recovered
 */
export async function markCartAsRecovered(cartId: string) {
  return await prisma.abandonedCart.update({
    where: { id: cartId },
    data: {
      recovered: true
      // updatedAt will be automatically updated
    }
  });
}

/**
 * Increment reminder count
 * Note: reminderSent field is not available in current schema
 * This function is kept for API compatibility but does nothing
 */
export async function incrementReminderCount(cartId: string) {
  // Schema doesn't support reminderSent, so we just return the cart
  return await prisma.abandonedCart.findUnique({
    where: { id: cartId }
  });
}

/**
 * Get abandoned cart statistics
 */
export async function getAbandonedCartStats() {
  const [
    totalAbandonedCarts,
    recoveredCarts,
    pendingCarts,
    recentAbandonments
  ] = await Promise.all([
    prisma.abandonedCart.count(),
    prisma.abandonedCart.count({ where: { recovered: true } }),
    prisma.abandonedCart.count({ where: { recovered: false } }),
    prisma.abandonedCart.findMany({
      where: { recovered: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })
  ]);

  const recoveryRate = totalAbandonedCarts > 0 ?
    ((recoveredCarts / totalAbandonedCarts) * 100).toFixed(2) : 0;

  return {
    totalAbandonedCarts,
    recoveredCarts,
    pendingCarts,
    recentAbandonments: recentAbandonments.map(cart => ({
      ...cart,
      items: typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items
    })),
    recoveryRate: typeof recoveryRate === 'string' ? parseFloat(recoveryRate) : recoveryRate
  };
}

/**
 * Get abandoned cart by ID
 */
export async function getAbandonedCart(cartId: string) {
  const cart = await prisma.abandonedCart.findUnique({
    where: { id: cartId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  if (!cart) {
    throw new CustomError('Abandoned cart not found', 404);
  }

  return {
    ...cart,
    items: typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items
  };
}

/**
 * Delete old abandoned carts (cleanup)
 */
export async function cleanupOldAbandonedCarts(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.abandonedCart.deleteMany({
    where: {
      recovered: true,
      updatedAt: { lte: cutoffDate }
    }
  });

  return result;
}

/**
 * Get abandoned cart recovery campaigns
 * Note: reminderSent field is not available in current schema
 * Returns basic stats grouped by recovery status
 */
export async function getRecoveryCampaigns() {
  const [recovered, pending] = await Promise.all([
    prisma.abandonedCart.groupBy({
      by: ['recovered'],
      where: { recovered: true },
      _count: { id: true },
      _avg: { totalAmount: true }
    }),
    prisma.abandonedCart.groupBy({
      by: ['recovered'],
      where: { recovered: false },
      _count: { id: true },
      _avg: { totalAmount: true }
    })
  ]);

  return [
    ...recovered.map(campaign => ({
      reminderCount: 0, // Not available in schema
      cartCount: campaign._count.id,
      averageValue: campaign._avg.totalAmount || 0
    })),
    ...pending.map(campaign => ({
      reminderCount: 0, // Not available in schema
      cartCount: campaign._count.id,
      averageValue: campaign._avg.totalAmount || 0
    }))
  ];
}

/**
 * Send recovery email (placeholder - integrate with email service)
 */
export async function sendRecoveryEmail(cartId: string, templateType: 'first' | 'second' | 'final') {
  const cart = await getAbandonedCart(cartId);

  // TODO: Integrate with actual email service
  // For now, just increment reminder count (no-op in current schema)
  await incrementReminderCount(cartId);

  const userEmail = cart.user?.email || '';

  return {
    cartId,
    email: userEmail,
    templateType,
    sent: true,
    sentAt: new Date()
  };
}

/**
 * Bulk send recovery emails
 */
export async function bulkSendRecoveryEmails(cartIds: string[], templateType: 'first' | 'second' | 'final') {
  const results = [];
  const errors = [];

  for (const cartId of cartIds) {
    try {
      const result = await sendRecoveryEmail(cartId, templateType);
      results.push({ success: true, ...result });
    } catch (error: any) {
      errors.push({ cartId, success: false, error: error?.message || 'Unknown error' });
    }
  }

  return {
    success: results.length > 0,
    results,
    errors,
    summary: {
      total: cartIds.length,
      successful: results.length,
      failed: errors.length
    }
  };
}
