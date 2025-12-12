// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { CustomError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export interface FulfillmentUpdate {
  orderId: string;
  status: 'picked' | 'packed' | 'shipped' | 'delivered';
  userId?: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
}

export interface BulkFulfillmentUpdate {
  orderIds: string[];
  status: 'picked' | 'packed' | 'shipped' | 'delivered';
  userId?: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
}

/**
 * Update order fulfillment status
 */
export async function updateFulfillmentStatus(update: FulfillmentUpdate) {
  const { orderId, status, userId, trackingNumber, carrier, notes } = update;

  // Get the order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { fulfillment: true }
  });

  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  // Check if order is in a valid state for the requested status
  if (!isValidStatusTransition(order.fulfillmentStatus, status)) {
    throw new CustomError(`Invalid status transition from ${order.fulfillmentStatus} to ${status}`, 400);
  }

  const now = new Date();
  const updateData: any = {
    fulfillmentStatus: status,
    updatedAt: now
  };

  // Set specific timestamps based on status
  switch (status) {
    case 'picked':
      updateData.pickedAt = now;
      break;
    case 'packed':
      updateData.packedAt = now;
      break;
    case 'shipped':
      updateData.shippedAt = now;
      updateData.trackingNumber = trackingNumber;
      break;
    case 'delivered':
      updateData.deliveredAt = now;
      break;
  }

  // Update order
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      },
      user: true
    }
  });

  // Update or create fulfillment record
  await prisma.orderFulfillment.upsert({
    where: { orderId },
    update: {
      status,
      pickedBy: status === 'picked' ? userId : undefined,
      packedBy: status === 'packed' ? userId : undefined,
      shippedBy: status === 'shipped' ? userId : undefined,
      pickedAt: status === 'picked' ? now : undefined,
      packedAt: status === 'packed' ? now : undefined,
      shippedAt: status === 'shipped' ? now : undefined,
      deliveredAt: status === 'delivered' ? now : undefined,
      trackingNumber: status === 'shipped' ? trackingNumber : undefined,
      carrier: status === 'shipped' ? carrier : undefined,
      notes: notes || undefined,
      updatedAt: now
    },
    create: {
      orderId,
      status,
      pickedBy: status === 'picked' ? userId : undefined,
      packedBy: status === 'packed' ? userId : undefined,
      shippedBy: status === 'shipped' ? userId : undefined,
      pickedAt: status === 'picked' ? now : undefined,
      packedAt: status === 'packed' ? now : undefined,
      shippedAt: status === 'shipped' ? now : undefined,
      deliveredAt: status === 'delivered' ? now : undefined,
      trackingNumber: status === 'shipped' ? trackingNumber : undefined,
      carrier: status === 'shipped' ? carrier : undefined,
      notes: notes || undefined
    }
  });

  return updatedOrder;
}

/**
 * Bulk update fulfillment status for multiple orders
 */
export async function bulkUpdateFulfillmentStatus(update: BulkFulfillmentUpdate) {
  const { orderIds, status, userId, trackingNumber, carrier, notes } = update;

  const results = [];
  const errors = [];

  for (const orderId of orderIds) {
    try {
      const result = await updateFulfillmentStatus({
        orderId,
        status,
        userId,
        trackingNumber,
        carrier,
        notes
      });
      results.push({ orderId, success: true, order: result });
    } catch (error) {
      errors.push({ orderId, success: false, error: error.message });
    }
  }

  return {
    success: results.length > 0,
    results,
    errors,
    summary: {
      total: orderIds.length,
      successful: results.length,
      failed: errors.length
    }
  };
}

/**
 * Get fulfillment status for an order
 */
export async function getFulfillmentStatus(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      fulfillment: true,
      items: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      },
      user: true
    }
  });

  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  return order;
}

/**
 * Get orders by fulfillment status
 */
export async function getOrdersByFulfillmentStatus(
  status: string,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: { fulfillmentStatus: status },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        },
        user: true,
        fulfillment: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.order.count({
      where: { fulfillmentStatus: status }
    })
  ]);

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Get fulfillment dashboard statistics
 */
export async function getFulfillmentStats() {
  const [
    totalOrders,
    unfulfilledOrders,
    pickedOrders,
    packedOrders,
    shippedOrders,
    deliveredOrders,
    recentFulfillments
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { fulfillmentStatus: 'unfulfilled' } }),
    prisma.order.count({ where: { fulfillmentStatus: 'picked' } }),
    prisma.order.count({ where: { fulfillmentStatus: 'packed' } }),
    prisma.order.count({ where: { fulfillmentStatus: 'shipped' } }),
    prisma.order.count({ where: { fulfillmentStatus: 'delivered' } }),
    prisma.order.findMany({
      where: {
        fulfillmentStatus: { in: ['picked', 'packed', 'shipped'] }
      },
      include: {
        user: true,
        fulfillment: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })
  ]);

  return {
    totalOrders,
    unfulfilledOrders,
    pickedOrders,
    packedOrders,
    shippedOrders,
    deliveredOrders,
    recentFulfillments,
    fulfillmentRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(2) : 0
  };
}

/**
 * Validate status transition
 */
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    'unfulfilled': ['picked'],
    'picked': ['packed'],
    'packed': ['shipped'],
    'shipped': ['delivered'],
    'delivered': [] // No transitions from delivered
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

/**
 * Generate shipping label (placeholder - integrate with shipping API)
 */
export async function generateShippingLabel(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      },
      user: true
    }
  });

  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  if (order.fulfillmentStatus === 'unfulfilled') {
    throw new CustomError('Order must be picked before generating shipping label', 400);
  }

  // TODO: Integrate with actual shipping API (Shiprocket, etc.)
  // For now, generate a placeholder label URL
  const labelUrl = `/shipping-labels/${orderId}-${Date.now()}.pdf`;
  
  // Update order with label URL
  await prisma.order.update({
    where: { id: orderId },
    data: { shippingLabelUrl: labelUrl }
  });

  return {
    orderId,
    labelUrl,
    trackingNumber: order.trackingNumber || `TRK${orderId.slice(-8).toUpperCase()}`
  };
}

/**
 * Bulk generate shipping labels
 */
export async function bulkGenerateShippingLabels(orderIds: string[]) {
  const results = [];
  const errors = [];

  for (const orderId of orderIds) {
    try {
      const result = await generateShippingLabel(orderId);
      results.push({ orderId, success: true, ...result });
    } catch (error) {
      errors.push({ orderId, success: false, error: error.message });
    }
  }

  return {
    success: results.length > 0,
    results,
    errors,
    summary: {
      total: orderIds.length,
      successful: results.length,
      failed: errors.length
    }
  };
}
