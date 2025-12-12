import type { Prisma, PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';
import prisma from '../prisma/client';
import { CustomError } from '../middlewares/errorHandler';
import { sendEmail } from './emailService';
import { getOrderShippedEmailTemplate, getOrderDeliveredEmailTemplate } from './emailTemplates';

type PrismaTransactionClient = Prisma.TransactionClient;

type PrismaClientLike = PrismaClient | PrismaTransactionClient;

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  confirmed: ['processing', 'shipped', 'delivered', 'cancelled'],
  processing: ['shipped', 'delivered', 'cancelled'],
  shipped: ['delivered', 'returned', 'cancelled'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

const STATUS_WEIGHTS: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  returned: 5,
  cancelled: 6,
};

export interface OrderStatusTransitionOptions {
  client?: PrismaClientLike;
  include?: Prisma.OrderInclude;
  allowRegression?: boolean;
}

function getClient(client?: PrismaClientLike): PrismaClientLike {
  return client ?? prisma;
}

function canTransition(current: OrderStatus, next: OrderStatus, allowRegression = false): boolean {
  if (current === next) {
    return true;
  }

  if (allowRegression) {
    return true;
  }

  const allowedTargets = ORDER_STATUS_TRANSITIONS[current] ?? [];
  if (allowedTargets.includes(next)) {
    return true;
  }

  // Allow forward jumps if they respect ordering (e.g., pending -> shipped)
  const currentWeight = STATUS_WEIGHTS[current];
  const nextWeight = STATUS_WEIGHTS[next];

  return nextWeight >= currentWeight && next !== 'pending';
}

function requirePaymentForStatus(paymentStatus: PaymentStatus, targetStatus: OrderStatus) {
  if (targetStatus === 'delivered' && paymentStatus !== 'paid') {
    throw new CustomError('Order cannot be marked as delivered before payment is captured.', 400);
  }
}

function buildOrderUpdatePayload(
  currentOrder: { shippedAt?: Date | null; deliveredAt?: Date | null },
  targetStatus: OrderStatus
) {
  const now = new Date();
  const updateData: Prisma.OrderUpdateArgs['data'] = {
    status: targetStatus,
  };

  if (targetStatus === 'shipped' && !currentOrder.shippedAt) {
    updateData.shippedAt = now;
  }

  if (targetStatus === 'delivered' && !currentOrder.deliveredAt) {
    updateData.deliveredAt = now;
  }

  if (targetStatus === 'returned') {
    updateData.isReturned = true;
  }

  return { updateData, timestamp: now };
}

export async function transitionOrderStatus(
  orderId: string,
  targetStatus: OrderStatus,
  options: OrderStatusTransitionOptions = {}
) {
  const client = getClient(options.client);

  const currentOrder = await client.order.findUnique({
    where: { id: orderId },
    include: (options.include ?? null) as any,
  });

  if (!currentOrder) {
    throw new CustomError('Order not found', 404);
  }

  const currentStatus = currentOrder.status as OrderStatus;

  if (currentStatus === targetStatus) {
    return currentOrder;
  }

  if (currentStatus === 'cancelled' || currentStatus === 'returned') {
    throw new CustomError(`Order already ${currentStatus}; status changes are not permitted.`, 400);
  }

  if (!canTransition(currentStatus, targetStatus, options.allowRegression)) {
    throw new CustomError(
      `Invalid order status transition from ${currentStatus} to ${targetStatus}.`,
      400
    );
  }

  requirePaymentForStatus(currentOrder.paymentStatus as PaymentStatus, targetStatus);

  const { updateData } = buildOrderUpdatePayload(currentOrder, targetStatus);

  const updatedOrder = await client.order.update({
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
      user: {
        select: {
          email: true,
          name: true
        }
      }
    } as any,
  });

  // Send status update emails
  try {
    // Get user email from relation if included
    const user = (updatedOrder as any)['user'] as { email?: string; name?: string } | undefined;
    const userEmail = user?.email || '';
    const userName = user?.name || 'Customer';
    
    if (targetStatus === 'shipped' && updatedOrder.trackingUrl && updatedOrder.awbNumber) {
      const shippedEmailHtml = getOrderShippedEmailTemplate(
        updatedOrder.orderNumber || `ULC-${updatedOrder.id.slice(0, 8).toUpperCase()}`,
        updatedOrder.trackingUrl,
        updatedOrder.awbNumber,
        userName
      );
      
      if (userEmail) {
        await sendEmail(
          userEmail,
          `Your Order Has Shipped - ${updatedOrder.orderNumber}`,
          shippedEmailHtml,
          'ULICA',
          {
            template: 'order-shipped',
            metadata: {
              orderId: updatedOrder.id,
              orderNumber: updatedOrder.orderNumber,
              type: 'order-shipped',
            }
          }
        );
      }
    } else if (targetStatus === 'delivered') {
      const deliveredEmailHtml = getOrderDeliveredEmailTemplate(
        updatedOrder.orderNumber || `ULC-${updatedOrder.id.slice(0, 8).toUpperCase()}`,
        userName
      );
      
      if (userEmail) {
        await sendEmail(
          userEmail,
          `Your Order Has Been Delivered - ${updatedOrder.orderNumber}`,
          deliveredEmailHtml,
          'ULICA',
          {
            template: 'order-delivered',
            metadata: {
              orderId: updatedOrder.id,
              orderNumber: updatedOrder.orderNumber,
              type: 'order-delivered',
            }
          }
        );
      }
    }
  } catch (error) {
    // Don't fail the status transition if email fails
  }

  return updatedOrder;
}

