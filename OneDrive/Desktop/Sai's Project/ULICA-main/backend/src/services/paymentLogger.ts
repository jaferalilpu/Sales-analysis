import prisma from '../prisma/client';

interface PaymentLogOptions {
  provider: 'razorpay' | 'phonepe' | 'upi' | string;
  orderId: string;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  status: string;
  amount: number;
  paymentMethod?: string | null;
  currency?: string;
  checksum?: string | null;
  metadata?: Record<string, unknown> | null;
  rawPayload?: unknown;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export async function logPaymentTransaction(options: PaymentLogOptions) {
  const {
    provider,
    orderId,
    providerOrderId,
    providerPaymentId,
    status,
    amount,
    paymentMethod,
    currency = 'INR',
    metadata,
    rawPayload,
    errorCode,
    errorMessage
  } = options;

  return prisma.paymentTransaction.create({
    data: {
      provider,
      orderId,
      ...(providerOrderId ? { providerOrderId } : {}),
      ...(providerPaymentId ? { providerPaymentId } : {}),
      status,
      amount,
      currency,
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(metadata ? { metadata: metadata as any } : {}),
      ...(rawPayload ? { rawPayload: rawPayload as any } : {}),
      ...(errorCode ? { errorCode } : {}),
      ...(errorMessage ? { errorMessage } : {})
    }
  });
}

