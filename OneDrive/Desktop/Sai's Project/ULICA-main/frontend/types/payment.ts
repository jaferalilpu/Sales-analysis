/**
 * Payment-related types for frontend
 */

export interface PaymentSession {
  id: string;
  redirectUrl?: string;
  orderId?: string;
}

export interface PaymentConfig {
  key?: string;
  razorpayKeyId?: string;
  amount?: number;
  orderId?: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationData {
  orderId: string;
  paymentId: string;
  signature: string;
  paymentMethod: string;
}

export interface CODOrderResponse {
  success: boolean;
  data?: {
    tempOrderId?: string;
    order?: {
      id: string;
    };
    paymentSession?: PaymentSession;
    paymentMethod?: string;
    paymentConfig?: PaymentConfig;
  };
  message?: string;
  error?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  data?: {
    orderId: string;
    verified: boolean;
  };
  message?: string;
  error?: string;
}

