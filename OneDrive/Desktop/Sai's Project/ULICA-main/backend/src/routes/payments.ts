import * as express from 'express';
import Joi from 'joi';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import {
  createPhonePeOrder,
  createUPIOrder,
  checkPhonePePaymentStatus,
  verifyPhonePeResponse,
  PhonePeResponse,
  PhonePeOrderData,
  UPIOrderData
} from '../services/phonepeService';
import {
  createRazorpayOrder,
  verifyRazorpaySignature
} from '../services/razorpayService';

const router = express.Router();

// Validation schemas
const createPaymentSchema = {
  body: Joi.object({
    amount: Joi.number().positive().required(),
    orderId: Joi.string().required(),
    paymentMethod: Joi.string().valid('razorpay', 'phonepe', 'upi').required(),
    customerDetails: Joi.object({
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      pincode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional(),
    upiDetails: Joi.object({
      upiId: Joi.string().optional(),
      vpa: Joi.string().optional()
    }).optional()
  })
};

const verifyPaymentSchema = {
  body: Joi.object({
    paymentId: Joi.string().required(),
    orderId: Joi.string().required(),
    paymentMethod: Joi.string().valid('razorpay', 'phonepe', 'upi').required(),
    signature: Joi.string().optional(),
    response: Joi.object().optional()
  })
};

/**
 * POST /api/payments/create
 * Create payment order
 */
router.post('/create',
  authenticateToken,
  validate(createPaymentSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const { amount, orderId, paymentMethod, customerDetails, upiDetails } = req.body as {
      amount: number;
      orderId: string;
      paymentMethod: 'razorpay' | 'phonepe' | 'upi';
      customerDetails?: Record<string, any>;
      upiDetails?: Record<string, any>;
    };

    try {
      if (paymentMethod === 'razorpay') {
        const order = await createRazorpayOrder({
          amount: Math.round(amount * 100), // paise
          orderId,
          ...(req.user?.id && { customerId: req.user.id }),
          ...(customerDetails?.['email'] && { customerEmail: customerDetails['email'] }),
          ...(customerDetails?.['phone'] && { customerPhone: customerDetails['phone'] })
        });

        return res.json({
          success: true,
          data: {
            provider: 'razorpay',
            order
          }
        });
      }

      const phonePePayload: PhonePeOrderData = {
        amount,
        orderId,
        ...(req.user?.id && { customerId: req.user.id }),
        ...(customerDetails?.['name'] && { customerName: customerDetails['name'] }),
        ...(customerDetails?.['email'] && { customerEmail: customerDetails['email'] }),
        ...(customerDetails?.['phone'] && { customerPhone: customerDetails['phone'] }),
        ...(customerDetails?.['address'] && { customerAddress: customerDetails['address'] }),
        ...(customerDetails?.['city'] && { customerCity: customerDetails['city'] }),
        ...(customerDetails?.['state'] && { customerState: customerDetails['state'] }),
        ...(customerDetails?.['pincode'] && { customerPincode: customerDetails['pincode'] }),
        ...(customerDetails?.['country'] && { customerCountry: customerDetails['country'] })
      };

      let paymentResponse: PhonePeResponse;

      if (paymentMethod === 'phonepe') {
        paymentResponse = await createPhonePeOrder(phonePePayload);
      } else if (paymentMethod === 'upi') {
        const upiPayload: UPIOrderData = {
          ...phonePePayload,
          ...(upiDetails?.['upiId'] && { upiId: upiDetails['upiId'] }),
          ...(upiDetails?.['vpa'] && { vpa: upiDetails['vpa'] })
        };
        paymentResponse = await createUPIOrder(upiPayload);
      } else {
        throw new CustomError('Invalid payment method', 400);
      }

      if (!paymentResponse.success || !paymentResponse.data) {
        throw new CustomError(paymentResponse.error || 'Payment creation failed', 400);
      }

      res.json({
        success: true,
        data: {
          provider: paymentMethod,
          ...paymentResponse.data
        }
      });
    } catch (error) {
      throw new CustomError('Failed to create payment', 500);
    }
  })
);

/**
 * POST /api/payments/verify
 * Verify payment
 */
router.post('/verify',
  authenticateToken,
  validate(verifyPaymentSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const { paymentId, orderId, paymentMethod, signature, response } = req.body as {
      paymentId: string;
      orderId: string;
      paymentMethod: 'razorpay' | 'phonepe' | 'upi';
      signature?: string;
      response?: Record<string, any>;
    };

    try {
      let verificationResult = false;

      switch (paymentMethod) {
        case 'razorpay':
          if (!signature) {
            throw new CustomError('Signature is required for Razorpay verification', 400);
          }
          verificationResult = verifyRazorpaySignature(orderId, paymentId, signature);
          break;

        case 'phonepe':
        case 'upi':
          if (!response) {
            throw new CustomError('Response is required for PhonePe/UPI verification', 400);
          }
          verificationResult = await verifyPhonePeResponse(response, signature);
          break;

        default:
          throw new CustomError('Invalid payment method', 400);
      }

      if (verificationResult) {
        res.json({
          success: true,
          message: 'Payment verified successfully',
          data: {
            paymentId,
            orderId,
            status: 'verified',
            method: paymentMethod
          }
        });
      } else {
        throw new CustomError('Payment verification failed', 400);
      }
    } catch (error) {
      throw new CustomError('Failed to verify payment', 500);
    }
  })
);

/**
 * GET /api/payments/status/:orderId
 * Check payment status
 */
router.get('/status/:orderId',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const orderId = req.params['orderId'];
    if (!orderId) {
      throw new CustomError('Order ID is required', 400);
    }
    const paymentMethod = typeof req.query['paymentMethod'] === 'string'
      ? req.query['paymentMethod']
      : undefined;

    try {
      let status: string;

      if (paymentMethod === 'phonepe' || paymentMethod === 'upi') {
        const response = await checkPhonePePaymentStatus(orderId);
        status = response.data?.state || 'PENDING';
      } else {
        // For Razorpay, you would need to implement status check
        status = 'PENDING';
      }

      res.json({
        success: true,
        data: {
          orderId,
          method: paymentMethod,
          status
        }
      });
    } catch (error) {
      throw new CustomError('Failed to check payment status', 500);
    }
  })
);

export default router;