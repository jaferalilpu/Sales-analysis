import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { logger } from './loggerService';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env['RAZORPAY_KEY_ID']!,
  key_secret: process.env['RAZORPAY_KEY_SECRET']!
});

export interface RazorpayOrderData {
  amount: number;
  orderId: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
}

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder(data: RazorpayOrderData) {
  const options = {
    amount: data.amount, // Amount in paise
    currency: 'INR',
    receipt: data.orderId,
    notes: {
      customerId: data.customerId || '',
      customerEmail: data.customerEmail || '',
      customerPhone: data.customerPhone || ''
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    await logger.error('Razorpay order creation failed', { error: error instanceof Error ? error.message : String(error), orderId: data.orderId });
    throw new Error('Failed to create Razorpay order');
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env['RAZORPAY_WEBHOOK_SECRET']!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Get Razorpay public key
 */
export function getRazorpayPublicKey(): string {
  return process.env['RAZORPAY_KEY_ID']!;
}

/**
 * Fetch Razorpay order details
 */
export async function getRazorpayOrder(orderId: string) {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    await logger.error('Failed to fetch Razorpay order', { error: error instanceof Error ? error.message : String(error), orderId });
    throw new Error('Failed to fetch Razorpay order');
  }
}

/**
 * Fetch Razorpay payment details
 */
export async function getRazorpayPayment(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    await logger.error('Failed to fetch Razorpay payment', { error: error instanceof Error ? error.message : String(error), paymentId });
    throw new Error('Failed to fetch Razorpay payment');
  }
}

/**
 * Refund Razorpay payment
 */
export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number,
  notes?: Record<string, unknown>
) {
  const options: { payment_id: string; notes: Record<string, unknown>; amount?: number } = {
    payment_id: paymentId,
    notes: notes || {}
  };

  if (amount) {
    options.amount = amount;
  }

  try {
    const refund = await razorpay.payments.refund(paymentId, options as any);
    return refund;
  } catch (error) {
    await logger.error('Razorpay refund failed', { error: error instanceof Error ? error.message : String(error), paymentId, amount });
    throw new Error('Failed to process Razorpay refund');
  }
}