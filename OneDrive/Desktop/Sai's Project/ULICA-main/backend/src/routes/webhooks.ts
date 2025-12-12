import * as express from 'express';
import crypto from 'crypto';
import { OrderStatus } from '@prisma/client';
import prisma from '../prisma/client';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
// import { verifyRazorpaySignature } from '../services/razorpayService';
import { verifyPhonePeResponse } from '../services/phonepeService';
import { transitionOrderStatus } from '../services/orderStatusService';
import { ensureShiprocketShipmentArtifacts } from '../modules/shiprocket/services/shippingService';
import { logger } from '../services/loggerService';
import { logPaymentTransaction } from '../services/paymentLogger';
import { generateProductInfoSheet } from '../services/productInfoSheetService';
import { ExpressResponse } from '../types/express';
import { RazorpayWebhookEvent, PhonePeWebhookData, ShiprocketWebhookData } from '../types/webhook';

const router = express.Router();

function scheduleShiprocketProvision(orderId: string) {
  setImmediate(async () => {
    try {
      await ensureShiprocketShipmentArtifacts(orderId);
    } catch (error) {
      await logger.warn('Automatic Shiprocket provisioning failed', {
        orderId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

/**
 * POST /api/webhooks/razorpay
 * Handle Razorpay webhooks
 */
router.post('/razorpay',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = req.body;

    // Verify webhook signature
    const webhookSecret = process.env['RAZORPAY_WEBHOOK_SECRET'];
    if (!webhookSecret) {
      throw new CustomError('Razorpay webhook secret not configured', 500);
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new CustomError('Invalid webhook signature', 400);
    }

    const event = JSON.parse(body.toString());

    // Log webhook (webhookLog model not in schema - using logger instead)
    await logger.info('Razorpay webhook received', {
      provider: 'razorpay',
      event: event.event,
      payload: JSON.stringify(event),
      signature: signature
    });

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        await handleRazorpayPaymentCaptured(event);
        break;
      case 'payment.failed':
        await handleRazorpayPaymentFailed(event);
        break;
      case 'order.paid':
        await handleRazorpayOrderPaid(event);
        break;
      default:
        await logger.info('Unhandled Razorpay event', { eventType: event.event });
    }

    res.json({ success: true, message: 'Webhook processed' });
  })
);

/**
 * POST /api/webhooks/phonepe
 * Handle PhonePe webhooks
 */
router.post('/phonepe',
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const { responseCode, state, checksum } = req.body;

    // Log webhook (webhookLog model not in schema - using logger instead)
    await logger.info('PhonePe webhook received', {
      provider: 'phonepe',
      event: 'payment_response',
      payload: JSON.stringify(req.body)
    });

    // Verify response
    const isValid = await verifyPhonePeResponse(req.body, checksum);

    if (isValid && responseCode === 'PAYMENT_SUCCESS' && state === 'COMPLETED') {
      await handlePhonePePaymentSuccess(req.body);
    } else {
      await handlePhonePePaymentFailed(req.body);
    }

    res.json({ success: true, message: 'Webhook processed' });
  })
);

/**
 * POST /api/webhooks/shiprocket
 * Handle Shiprocket webhooks
 */
router.post('/shiprocket',
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    // Log webhook (webhookLog model not in schema - using logger instead)
    await logger.info('Shiprocket webhook received', {
      provider: 'shiprocket',
      event: req.body.event_type || 'unknown',
      payload: JSON.stringify(req.body)
    });

    // Handle shipment updates
    if (req.body.event_type === 'shipment_status') {
      await handleShiprocketStatusUpdate(req.body);
    }

    res.json({ success: true, message: 'Webhook processed' });
  })
);

// Razorpay webhook handlers
async function handleRazorpayPaymentCaptured(event: RazorpayWebhookEvent) {
  const paymentEntity = event.payload.payment?.entity;
  if (!paymentEntity) {
    throw new Error('Payment entity missing in webhook payload');
  }
  const { payment } = { payment: paymentEntity };

  // Find order by payment ID via PaymentTransaction
  const paymentTransaction = await prisma.paymentTransaction.findFirst({
    where: { providerPaymentId: payment.id },
    include: { order: true }
  });

  const order = paymentTransaction?.order;

  if (order) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid'
        }
      });

      await transitionOrderStatus(order.id, 'confirmed', { client: tx });
    });

    // Update stock
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { variant: true }
    });

    for (const item of orderItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQty: {
              decrement: item.quantity
            }
          }
        });
      }
    }

    // Clear user's cart if logged in
    if (order.userId) {
      await (prisma as any).cartItem.deleteMany({
        where: { userId: order.userId }
      });
    }

    scheduleShiprocketProvision(order.id);

    // Auto-generate product info sheet after payment verification
    setImmediate(async () => {
      try {
        await generateProductInfoSheet(order.id);
      } catch (error) {
        await logger.warn('Automatic info sheet generation failed', {
          orderId: order.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  await logPaymentTransaction({
    provider: 'razorpay',
    orderId: order?.id ?? (payment.notes as any)?.['order_id'] ?? '',
    providerOrderId: payment.order_id,
    providerPaymentId: payment.id,
    status: 'captured',
    amount: payment.amount ?? 0,
    paymentMethod: payment.method,
    metadata: {
      event: 'payment.captured'
    },
    rawPayload: event
  });
}

async function handleRazorpayPaymentFailed(event: RazorpayWebhookEvent) {
  const paymentEntity = event.payload.payment?.entity;
  if (!paymentEntity) {
    throw new Error('Payment entity missing in webhook payload');
  }
  const { payment } = { payment: paymentEntity };

  // Find order by payment ID via PaymentTransaction
  const paymentTransaction = await prisma.paymentTransaction.findFirst({
    where: { providerPaymentId: payment.id },
    include: { order: true }
  });

  const order = paymentTransaction?.order;

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'failed'
      }
    });
  }

  await logPaymentTransaction({
    provider: 'razorpay',
    orderId: order?.id ?? (payment.notes as any)?.[' order_id'] ?? '',
    providerOrderId: payment.order_id,
    providerPaymentId: payment.id,
    status: 'failed',
    amount: payment.amount ?? 0,
    paymentMethod: payment.method,
    errorCode: payment.error_code ?? null,
    errorMessage: payment.error_description ?? null,
    metadata: {
      event: 'payment.failed'
    },
    rawPayload: event
  });
}

async function handleRazorpayOrderPaid(event: RazorpayWebhookEvent) {
  const orderEntity = event.payload.order?.entity;
  if (!orderEntity) {
    throw new Error('Order entity missing in webhook payload');
  }
  const { order } = { order: orderEntity };

  // Find order by gateway order ID via PaymentTransaction
  const paymentTransaction = await prisma.paymentTransaction.findFirst({
    where: { providerOrderId: order.id },
    include: { order: true }
  });

  const dbOrder = paymentTransaction?.order;

  if (dbOrder) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: dbOrder.id },
        data: {
          paymentStatus: 'paid'
        }
      });

      await transitionOrderStatus(dbOrder.id, 'confirmed', { client: tx });
    });

    scheduleShiprocketProvision(dbOrder.id);

    // Auto-generate product info sheet after payment verification
    setImmediate(async () => {
      try {
        await generateProductInfoSheet(dbOrder.id);
      } catch (error) {
        await logger.warn('Automatic info sheet generation failed', {
          orderId: dbOrder.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  if (dbOrder?.id) {
    await logPaymentTransaction({
      provider: 'razorpay',
      orderId: dbOrder.id,
      providerOrderId: order.id,
      status: 'order_paid',
      amount: order.amount ?? 0,
      paymentMethod: 'razorpay',
      metadata: {
        event: 'order.paid'
      },
      rawPayload: event
    });
  }
}

// PhonePe webhook handlers
async function handlePhonePePaymentSuccess(data: PhonePeWebhookData) {
  const { merchantTransactionId } = data;

  // Find order by gateway order ID via PaymentTransaction
  const paymentTransaction = await prisma.paymentTransaction.findFirst({
    where: { providerOrderId: merchantTransactionId },
    include: { order: true }
  });

  const order = paymentTransaction?.order;

  if (order) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid'
        }
      });

      await transitionOrderStatus(order.id, 'confirmed', { client: tx });
    });

    // Update stock and clear cart (same as Razorpay)
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { variant: true }
    });

    for (const item of orderItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQty: {
              decrement: item.quantity
            }
          }
        });
      }
    }

    if (order.userId) {
      await (prisma as any).cartItem.deleteMany({
        where: { userId: order.userId }
      });
    }

    scheduleShiprocketProvision(order.id);

    // Auto-generate product info sheet after payment verification
    setImmediate(async () => {
      try {
        await generateProductInfoSheet(order.id);
      } catch (error) {
        await logger.warn('Automatic info sheet generation failed', {
          orderId: order.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  await logPaymentTransaction({
    provider: 'phonepe',
    orderId: order?.id ?? merchantTransactionId,
    providerOrderId: merchantTransactionId,
    providerPaymentId: data.transactionId,
    status: 'success',
    amount: Number(data.amount ?? 0),
    paymentMethod: data.paymentInstrument?.type || 'unknown',
    metadata: {
      responseCode: data.responseCode,
      state: data.state
    },
    rawPayload: data
  });
}

async function handlePhonePePaymentFailed(data: PhonePeWebhookData) {
  const { merchantTransactionId } = data;

  // Find order by gateway order ID via PaymentTransaction
  const paymentTransaction = await prisma.paymentTransaction.findFirst({
    where: { providerOrderId: merchantTransactionId },
    include: { order: true }
  });

  const order = paymentTransaction?.order;

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'failed'
      }
    });
  }

  await logPaymentTransaction({
    provider: 'phonepe',
    orderId: order?.id ?? merchantTransactionId,
    providerOrderId: merchantTransactionId,
    providerPaymentId: data.transactionId,
    status: 'failed',
    amount: Number(data.amount ?? 0),
    paymentMethod: data.paymentInstrument?.type || 'unknown',
    errorCode: data.responseCode,
    errorMessage: data.state,
    metadata: {
      responseCode: data.responseCode,
      state: data.state
    },
    rawPayload: data
  });
}

// Shiprocket webhook handlers
async function handleShiprocketStatusUpdate(data: ShiprocketWebhookData) {
  const { awb_code, status } = data;

  // Find order by tracking number via OrderFulfillment or trackingUrl
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { trackingUrl: { contains: awb_code || '' } },
        { fulfillment: { trackingNumber: awb_code || '' } }
      ]
    }
  });

  if (order) {
    const normalized = typeof status === 'string' ? status.trim().toUpperCase() : '';
    const statusMap: Partial<Record<string, OrderStatus>> = {
      PICKED_UP: 'processing',
      IN_TRANSIT: 'shipped',
      DELIVERED: 'delivered',
      RTO: 'returned',
      RTO_DELIVERED: 'returned',
    };

    const mappedStatus = statusMap[normalized];

    if (mappedStatus && mappedStatus !== order.status) {
      try {
        await transitionOrderStatus(order.id, mappedStatus);
      } catch (error) {
        logger.warn(`Shiprocket webhook status transition blocked for order ${order.id}`, { orderId: order.id, error: error instanceof Error ? error.message : String(error) }).catch(() => { });
      }
    }
  }
}

export default router;