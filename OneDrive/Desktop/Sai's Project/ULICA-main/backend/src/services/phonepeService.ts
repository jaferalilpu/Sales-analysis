import * as crypto from 'crypto';
import { logger } from './loggerService';

export interface PhonePeOrderData {
  amount: number;
  orderId: string;
  customerId?: string;
  customerPhone?: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPincode?: string;
  customerCountry?: string;
}

export interface UPIOrderData extends PhonePeOrderData {
  upiId?: string;
  vpa?: string;
}

export interface PhonePeConfig {
  merchantId: string;
  saltKey: string;
  saltIndex: string;
  environment: 'sandbox' | 'production';
}

export interface PhonePeResponse {
  success: boolean;
  data?: {
    merchantOrderId: string;
    transactionId: string;
    redirectUrl: string;
    qrCode?: string;
    upiDeepLink?: string;
  };
  error?: string;
}

export interface PhonePeStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId?: string;
    amount: number;
    state: 'PENDING' | 'SUCCESS' | 'FAILED';
    responseCode: string;
    paymentInstrument?: {
      type: string;
      utr?: string;
    };
  };
}

// PhonePe configuration
const phonepeConfig: PhonePeConfig = {
  merchantId: process.env['PHONEPE_MERCHANT_ID']!,
  saltKey: process.env['PHONEPE_SALT_KEY']!,
  saltIndex: process.env['PHONEPE_SALT_INDEX']!,
  environment: (process.env['PHONEPE_ENVIRONMENT'] as 'sandbox' | 'production') || 'sandbox'
};

// PhonePe URLs
const PHONEPE_URLS = {
  sandbox: {
    base: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
    redirect: 'https://mercury-t2.phonepe.com/transact'
  },
  production: {
    base: 'https://api.phonepe.com/apis/pg-sandbox',
    redirect: 'https://mercury.phonepe.com/transact'
  }
};

/**
 * Create PhonePe order
 */
export async function createPhonePeOrder(data: PhonePeOrderData): Promise<PhonePeResponse> {
  const baseUrl = PHONEPE_URLS[phonepeConfig.environment].base;
  const redirectUrl = PHONEPE_URLS[phonepeConfig.environment].redirect;

  // Create payload
  const payload = {
    merchantId: phonepeConfig.merchantId,
    merchantTransactionId: data.orderId,
    merchantUserId: data.customerId || 'user',
    amount: data.amount * 100, // Convert to paise
    redirectUrl: `${process.env['FRONTEND_URL']}/payment/phonepe/callback`,
    redirectMode: 'POST',
    callbackUrl: `${process.env['BACKEND_URL']}/api/webhooks/phonepe`,
    mobileNumber: data.customerPhone,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerAddress: data.customerAddress,
    customerCity: data.customerCity,
    customerState: data.customerState,
    customerPincode: data.customerPincode,
    customerCountry: data.customerCountry || 'India',
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  };

  // Create checksum
  const payloadString = JSON.stringify(payload);
  const checksum = generatePhonePeChecksum(payloadString);

  // Create request payload
  const requestPayload = {
    request: btoa(payloadString)
  };

  try {
    const response = await fetch(`${baseUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'accept': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    const responseData = await response.json() as any;

    if (responseData.success) {
      return {
        success: true,
        data: {
          merchantOrderId: data.orderId,
          transactionId: responseData.data.transactionId,
          redirectUrl: `${redirectUrl}/${responseData.data.instrumentResponse.redirectInfo.url}`
        }
      };
    } else {
      return {
        success: false,
        error: responseData.message || 'PhonePe order creation failed'
      };
    }
  } catch (error) {
    await logger.error('PhonePe order creation failed', { error: error instanceof Error ? error.message : String(error), orderId: data.orderId });
    return {
      success: false,
      error: 'Failed to create PhonePe order'
    };
  }
}

/**
 * Create UPI payment order
 */
export async function createUPIOrder(data: UPIOrderData): Promise<PhonePeResponse> {
  const baseUrl = PHONEPE_URLS[phonepeConfig.environment].base;

  // Create payload for UPI
  const payload = {
    merchantId: phonepeConfig.merchantId,
    merchantTransactionId: data.orderId,
    merchantUserId: data.customerId || 'user',
    amount: data.amount * 100, // Convert to paise
    redirectUrl: `${process.env['FRONTEND_URL']}/payment/upi/callback`,
    redirectMode: 'POST',
    callbackUrl: `${process.env['BACKEND_URL']}/api/webhooks/phonepe`,
    mobileNumber: data.customerPhone,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    paymentInstrument: {
      type: 'UPI_INTENT',
      targetApp: data.upiId ? 'UPI_INTENT' : 'UPI_COLLECT',
      vpa: data.vpa || data.upiId
    }
  };

  // Create checksum
  const payloadString = JSON.stringify(payload);
  const checksum = generatePhonePeChecksum(payloadString);

  // Create request payload
  const requestPayload = {
    request: btoa(payloadString)
  };

  try {
    const response = await fetch(`${baseUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'accept': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    const responseData = await response.json() as any;

    if (responseData.success) {
      return {
        success: true,
        data: {
          merchantOrderId: data.orderId,
          transactionId: responseData.data.transactionId,
          redirectUrl: responseData.data.instrumentResponse.redirectInfo.url,
          upiDeepLink: responseData.data.instrumentResponse.redirectInfo.url,
          qrCode: responseData.data.instrumentResponse.redirectInfo.qrCode
        }
      };
    } else {
      return {
        success: false,
        error: responseData.message || 'UPI order creation failed'
      };
    }
  } catch (error) {
    await logger.error('UPI order creation failed', { error: error instanceof Error ? error.message : String(error), orderId: data.orderId });
    return {
      success: false,
      error: 'Failed to create UPI order'
    };
  }
}

/**
 * Generate PhonePe checksum
 */
function generatePhonePeChecksum(payloadString: string): string {
  const checksumString = payloadString + phonepeConfig.saltKey;
  const checksum = crypto.createHash('sha256').update(checksumString).digest('hex');
  return checksum + '###' + phonepeConfig.saltIndex;
}

/**
 * Verify PhonePe response
 */
export async function verifyPhonePeResponse(response: PhonePeResponse | Record<string, unknown>, providedChecksum?: string): Promise<boolean> {
  try {
    if (!providedChecksum) {
      await logger.error('PhonePe verification failed: checksum missing');
      return false;
    }

    const { data } = response;
    if (!data) {
      await logger.error('PhonePe verification failed: response data missing');
      return false;
    }

    const payloadString = typeof data === 'string' ? data : JSON.stringify(data);
    const expectedChecksum = generatePhonePeChecksum(payloadString);

    if (expectedChecksum !== providedChecksum) {
      await logger.error('PhonePe verification failed: checksum mismatch');
      return false;
    }

    if (typeof response === 'object' && 'code' in response) {
      return (response as { code?: string; responseCode?: string }).code === 'PAYMENT_SUCCESS' || 
             (response as { code?: string; responseCode?: string }).responseCode === 'PAYMENT_SUCCESS';
    }
    return false;
  } catch (error) {
    await logger.error('PhonePe response verification failed', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

/**
 * Get PhonePe public configuration
 */
export function getPhonePePublicConfig() {
  return {
    merchantId: phonepeConfig.merchantId,
    environment: phonepeConfig.environment
  };
}

/**
 * Check PhonePe payment status
 */
export async function checkPhonePePaymentStatus(merchantTransactionId: string): Promise<PhonePeStatusResponse> {
  const baseUrl = PHONEPE_URLS[phonepeConfig.environment].base;
  
  const checksumString = `/pg/v1/status/${phonepeConfig.merchantId}/${merchantTransactionId}${phonepeConfig.saltKey}`;
  const checksum = crypto.createHash('sha256').update(checksumString).digest('hex');
  const xVerify = checksum + '###' + phonepeConfig.saltIndex;

  try {
    const response = await fetch(`${baseUrl}/pg/v1/status/${phonepeConfig.merchantId}/${merchantTransactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': phonepeConfig.merchantId,
        'accept': 'application/json'
      }
    });

    const responseData = await response.json() as PhonePeStatusResponse;
    return responseData;
  } catch (error) {
    await logger.error('PhonePe status check failed', { error: error instanceof Error ? error.message : String(error), merchantTransactionId });
    throw new Error('Failed to check PhonePe payment status');
  }
}