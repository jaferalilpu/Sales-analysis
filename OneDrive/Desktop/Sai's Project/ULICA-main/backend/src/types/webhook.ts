/**
 * Webhook-related types for backend
 */

export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        invoice_id: string | null;
        international: boolean;
        method: string;
        amount_refunded: number;
        refund_status: string | null;
        captured: boolean;
        description: string;
        card_id: string | null;
        bank: string | null;
        wallet: string | null;
        vpa: string | null;
        email: string;
        contact: string;
        notes: Record<string, unknown>;
        fee: number;
        tax: number;
        error_code: string | null;
        error_description: string | null;
        error_source: string | null;
        error_step: string | null;
        error_reason: string | null;
        acquirer_data: Record<string, unknown>;
        created_at: number;
      };
    };
    order?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        receipt: string;
        offer_id: string | null;
        status: string;
        attempts: number;
        notes: Record<string, unknown>;
        created_at: number;
      };
    };
  };
  created_at: number;
}

export interface PhonePeWebhookData {
  merchantId: string;
  merchantTransactionId: string;
  transactionId: string;
  amount: number;
  state: string;
  responseCode: string;
  paymentInstrument: {
    type: string;
    utr?: string;
    pgTransactionId?: string;
  };
}

export interface ShiprocketWebhookData {
  shipment_id: string;
  status: string;
  status_code: string;
  awb_code?: string;
  courier_name?: string;
  tracking_data?: {
    track_url?: string;
    shipment_track?: Array<{
      current_status: string;
      current_status_code: string;
      current_timestamp: string;
    }>;
  };
}

