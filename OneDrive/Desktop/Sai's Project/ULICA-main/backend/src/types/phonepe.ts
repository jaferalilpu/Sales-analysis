/**
 * PhonePe-related types for backend
 */

export interface PhonePePaymentSession {
  merchantOrderId: string;
  transactionId: string;
  redirectUrl: string;
  qrCode?: string;
  upiDeepLink?: string;
}

export interface PhonePeResponse {
  success: boolean;
  data?: PhonePePaymentSession;
  error?: string;
}

