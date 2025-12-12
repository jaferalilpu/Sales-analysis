/**
 * Payment-related types for backend
 */

export interface RazorpayPaymentConfig {
  key: string;
  orderId: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface PhonePePaymentConfig {
  merchantId: string;
  redirectUrl: string;
  transactionId: string;
  qrCode?: string;
  upiDeepLink?: string;
}

export type PaymentConfig = RazorpayPaymentConfig | PhonePePaymentConfig;

