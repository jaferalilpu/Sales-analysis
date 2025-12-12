import express from 'express';
import prisma from '../prisma/client';
import { asyncHandler, CustomError, notFoundError } from '../middlewares/errorHandler';
import { optionalAuth, AuthenticatedRequest } from '../middlewares/auth';
import { validate, orderSchemas } from '../middlewares/validation';
import { createRazorpayOrder, getRazorpayPublicKey, verifyRazorpaySignature } from '../services/razorpayService';
import { createPhonePeOrder, createUPIOrder, getPhonePePublicConfig, verifyPhonePeResponse } from '../services/phonepeService';
import { processReferralPurchase } from '../services/referralService';
import { transitionOrderStatus } from '../services/orderStatusService';
import { logPaymentTransaction } from '../services/paymentLogger';
import { sendEmail } from '../services/emailService';
import { getOrderConfirmationEmailTemplate, OrderDetails } from '../services/emailTemplates';
import { ExpressResponse } from '../types/express';
import * as Joi from 'joi';

// Type definitions
type RazorpayPaymentSession = {
  id: string;
  amount: number;
  currency: string;
  [key: string]: any;
};

type PhonePePaymentSession = {
  success: boolean;
  data?: {
    merchantOrderId: string;
    transactionId: string;
    redirectUrl?: string;
    qrCode?: string;
    upiDeepLink?: string;
  };
  [key: string]: any;
};

type PhonePeResponse = PhonePePaymentSession;

type PaymentConfig = {
  key?: string;
  amount?: number;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  merchantId?: string;
  redirectUrl?: string;
  transactionId?: string;
  qrCode?: string;
  upiDeepLink?: string;
};

// OrderWithRelations and OrderItemWithRelations types removed - using Prisma types directly

const router = express.Router();

// Helper function to generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ULC-${timestamp}-${random}`;
}

// Helper function to get or create guest user for guest orders
async function getOrCreateGuestUser(email?: string): Promise<string> {
  // Try to find existing guest user by email if provided
  if (email) {
    const existingGuest = await prisma.user.findFirst({
      where: {
        email: email,
        role: 'guest'
      }
    });
    if (existingGuest) {
      return existingGuest.id;
    }
  }

  // Create new guest user
  const guestUser = await prisma.user.create({
    data: {
      email: email || `guest-${Date.now()}@ulica.com`,
      password: '$2a$10$dummyhashforguestusers', // Hashed dummy password
      name: 'Guest User',
      role: 'guest',
      isActive: true,
      isEmailVerified: false
    }
  });

  return guestUser.id;
}

// Helper function to calculate order totals
import { OrderItemInput } from '../types/checkout';

async function calculateOrderTotals(items: OrderItemInput[], couponCode?: string) {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

  // Calculate shipping (free over ₹2000)
  const shippingAmount = subtotal >= 2000 ? 0 : 100;

  // Calculate discount (simplified - implement coupon logic)
  let discountAmount = 0;
  if (couponCode) {
    // TODO: Implement coupon validation
    discountAmount = 0;
  }

  // Calculate tax (simplified - 18% GST)
  const taxAmount = subtotal * 0.18;

  // Calculate total
  const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

  return {
    orderItems: items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      title: item.title || 'Product',
      unitPrice: item.price || 0,
      quantity: item.quantity,
      totalPrice: (item.price || 0) * item.quantity
    })),
    subtotal,
    discountAmount,
    shippingAmount,
    taxAmount,
    totalAmount
  };
}

// Helper function to validate stock
async function validateStockAvailability(orderItems: OrderItemInput[]) {
  for (const item of orderItems) {
    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stockQty: true }
      });

      if (!variant || variant.stockQty < item.quantity) {
        throw new CustomError(`Insufficient stock for variant ${item.variantId}`, 400);
      }
    }
  }
}

/**
 * POST /api/checkout/create-cod-order
 * Create COD order with confirmation fee payment
 */
router.post('/create-cod-order',
  optionalAuth,
  validate({
    body: Joi.object({
      items: Joi.array().items(Joi.object({
        variantId: Joi.string().optional(),
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().required()
      })).min(1).required(),
      shippingAddress: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        pincode: Joi.string().required(),
        country: Joi.string().required(),
        phone: Joi.string().required()
      }).required(),
      paymentMethod: Joi.string().valid('cod').required(),
      confirmationFeePaymentMethod: Joi.string().valid('razorpay', 'phonepe', 'upi').optional().default('razorpay'),
      couponCode: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
      confirmationFee: Joi.number().positive().required()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const {
      items,
      couponCode,
      shippingAddress,
      email,
      phone,
      confirmationFee,
      confirmationFeePaymentMethod = 'razorpay'
    } = req.body;

    let userId = req.user?.id;

    // For guest orders, create or get guest user
    if (!userId) {
      userId = await getOrCreateGuestUser(email || req.user?.email);
    }

    // Calculate order totals
    const { orderItems, subtotal, discountAmount, shippingAmount, taxAmount, totalAmount } =
      await calculateOrderTotals(items, couponCode);

    // Check stock availability
    await validateStockAvailability(orderItems as any);

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Create order with COD payment method and pending confirmation fee
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId,
        totalAmount,
        subtotal: subtotal,
        shippingAmount,
        taxAmount,
        discountAmount,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cod',
        notes: `COD Order - Confirmation Fee: ₹${confirmationFee}. Remaining: ₹${totalAmount - confirmationFee} to be paid on delivery.`,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            title: item.title,
            price: item.unitPrice || 0,
            quantity: item.quantity,
            total: item.totalPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Create shipping address
    await prisma.orderAddress.create({
      data: {
        orderId: order.id,
        type: 'shipping',
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address1: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || 'India',
        phone: shippingAddress.phone || phone || req.user?.phone || null
      }
    });

    // Create payment session for confirmation fee based on selected payment method
    let paymentSession: RazorpayPaymentSession | PhonePePaymentSession | null = null;
    let paymentConfig: PaymentConfig | null = null;
    let providerOrderId: string | null = null;
    const provider = confirmationFeePaymentMethod === 'razorpay' ? 'razorpay' : 'phonepe';

    if (confirmationFeePaymentMethod === 'razorpay') {
      paymentSession = await createRazorpayOrder({
        amount: confirmationFee,
        orderId: order.id,
        customerId: userId || email || 'guest',
        customerEmail: email || req.user?.email || '',
        customerPhone: phone || req.user?.phone || shippingAddress.phone
      }) as RazorpayPaymentSession;

      providerOrderId = paymentSession.id;
      paymentConfig = {
        key: getRazorpayPublicKey(),
        amount: confirmationFee,
        orderId: providerOrderId,
        customerName: req.user?.name || shippingAddress.firstName + ' ' + shippingAddress.lastName,
        customerEmail: email || req.user?.email || '',
        customerPhone: phone || req.user?.phone || shippingAddress.phone
      };
    } else if (confirmationFeePaymentMethod === 'phonepe') {
      paymentSession = await createPhonePeOrder({
        amount: confirmationFee,
        orderId: order.id,
        customerId: userId || email || 'guest',
        customerEmail: email || req.user?.email || '',
        customerPhone: phone || req.user?.phone || shippingAddress.phone
      });

      const phonePeResponse = paymentSession as PhonePeResponse;
      if (phonePeResponse.success && phonePeResponse.data) {
        providerOrderId = phonePeResponse.data.merchantOrderId;
        paymentConfig = {
          merchantId: getPhonePePublicConfig().merchantId,
          redirectUrl: phonePeResponse.data.redirectUrl,
          transactionId: phonePeResponse.data.transactionId,
          ...(phonePeResponse.data.qrCode && { qrCode: phonePeResponse.data.qrCode }),
          ...(phonePeResponse.data.upiDeepLink && { upiDeepLink: phonePeResponse.data.upiDeepLink })
        } as PaymentConfig;
      }
    } else if (confirmationFeePaymentMethod === 'upi') {
      // For UPI, use PhonePe UPI order creation
      const upiResponse = await createUPIOrder({
        amount: confirmationFee,
        orderId: order.id,
        customerId: userId || email || 'guest',
        customerName: req.user?.name || shippingAddress.firstName + ' ' + shippingAddress.lastName,
        customerEmail: email || req.user?.email || '',
        customerPhone: phone || req.user?.phone || shippingAddress.phone
      }) as PhonePeResponse;

      paymentSession = upiResponse;
      if (upiResponse.success && upiResponse.data) {
        providerOrderId = upiResponse.data.merchantOrderId;
        paymentConfig = {
          merchantId: getPhonePePublicConfig().merchantId,
          redirectUrl: upiResponse.data.redirectUrl,
          transactionId: upiResponse.data.transactionId,
          ...(upiResponse.data.qrCode && { qrCode: upiResponse.data.qrCode }),
          ...(upiResponse.data.upiDeepLink && { upiDeepLink: upiResponse.data.upiDeepLink })
        } as PaymentConfig;
      }
    }

    // Store payment transaction for confirmation fee
    if (providerOrderId) {
      await logPaymentTransaction({
        provider,
        orderId: order.id,
        providerOrderId,
        status: 'pending',
        amount: Math.round(confirmationFee * 100), // Convert to paise
        paymentMethod: confirmationFeePaymentMethod
      });
    }

    res.json({
      success: true,
      message: 'COD order created. Please pay confirmation fee to proceed.',
      data: {
        order,
        tempOrderId: order.id,
        paymentSession,
        paymentMethod: confirmationFeePaymentMethod,
        paymentConfig,
        confirmationFee,
        orderTotal: totalAmount,
        remainingAmount: totalAmount - confirmationFee
      }
    });
  })
);

/**
 * POST /api/checkout/create-order
 * Create order and payment session
 */
router.post('/create-order',
  optionalAuth,
  validate(orderSchemas.create),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const {
      items,
      couponCode,
      paymentMethod,
      email,
      phone
    } = req.body;

    let userId = req.user?.id;

    // For guest orders, create or get guest user
    if (!userId) {
      userId = await getOrCreateGuestUser(email || req.user?.email);
    }

    // Validate and calculate order totals
    const { orderItems, subtotal, discountAmount, shippingAmount, taxAmount, totalAmount } =
      await calculateOrderTotals(items, couponCode);

    // Check stock availability
    await validateStockAvailability(orderItems as any);

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId,
        totalAmount,
        subtotal: subtotal,
        shippingAmount,
        taxAmount,
        discountAmount,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            title: item.title,
            price: item.unitPrice || 0,
            quantity: item.quantity,
            total: item.totalPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Handle COD - create order with pending payment status
    if (paymentMethod === 'cod') {
      // For COD, order is created but payment status remains pending
      // Confirmation fee will be handled separately via create-cod-order endpoint
      res.json({
        success: true,
        message: 'COD order created successfully',
        data: {
          order,
          paymentMethod: 'cod',
          requiresConfirmationFee: true
        }
      });
      return;
    }

    // Create payment session based on payment method
    let paymentSession: RazorpayPaymentSession | PhonePeResponse | null = null;
    if (paymentMethod === 'razorpay') {
      paymentSession = await createRazorpayOrder({
        amount: totalAmount,
        orderId: order.id,
        customerId: userId || email,
        customerEmail: email || req.user?.email,
        customerPhone: phone || req.user?.phone
      }) as RazorpayPaymentSession;

      // Store payment transaction
      await logPaymentTransaction({
        provider: 'razorpay',
        orderId: order.id,
        providerOrderId: paymentSession.id,
        status: 'pending',
        amount: Math.round(totalAmount * 100), // Convert to paise
        paymentMethod: 'razorpay'
      });
    } else if (paymentMethod === 'phonepe') {
      paymentSession = await createPhonePeOrder({
        amount: totalAmount,
        orderId: order.id,
        customerId: userId || email,
        customerEmail: email || req.user?.email,
        customerPhone: phone || req.user?.phone
      });

      // Store payment transaction
      await logPaymentTransaction({
        provider: 'phonepe',
        orderId: order.id,
        providerOrderId: (paymentSession as PhonePeResponse)?.data?.merchantOrderId || null,
        status: 'pending',
        amount: Math.round(totalAmount * 100), // Convert to paise
        paymentMethod: 'phonepe'
      });
    }

    res.json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        paymentSession,
        paymentConfig: paymentSession ? {} : null
      }
    });
  })
);

/**
 * POST /api/checkout/verify-payment
 * Verify payment after completion
 */
router.post('/verify-payment',
  optionalAuth,
  validate({
    body: Joi.object({
      orderId: Joi.string().required(),
      paymentId: Joi.string().required(),
      signature: Joi.string().optional(),
      paymentMethod: Joi.string().valid('razorpay', 'phonepe', 'upi', 'cod').required()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { orderId, paymentId, signature, paymentMethod } = req.body;

    // Find order with payment transactions
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        paymentTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        addresses: {
          where: { type: 'shipping' }
        }
      }
    });

    if (!order) {
      throw notFoundError('Order not found');
    }

    // Get the latest payment transaction for verification
    const latestPayment = order.paymentTransactions[0];
    const providerOrderId = latestPayment?.providerOrderId || '';

    // Verify payment based on method
    let verified = false;
    if (paymentMethod === 'razorpay') {
      if (!signature) {
        throw new CustomError('Signature required for Razorpay verification', 400);
      }
      verified = verifyRazorpaySignature(
        providerOrderId,
        paymentId,
        signature
      );
    } else if (paymentMethod === 'phonepe' || paymentMethod === 'upi') {
      verified = await verifyPhonePeResponse({
        merchantOrderId: providerOrderId,
        transactionId: paymentId
      } as any, signature);
    } else if (paymentMethod === 'cod') {
      // For COD, if confirmation fee is paid, mark as verified
      // The confirmation fee payment is verified separately
      verified = true;
    }

    if (!verified) {
      throw new CustomError('Payment verification failed', 400);
    }

    // Update order payment status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        paymentMethod: paymentMethod
      }
    });

    // Update payment transaction with success status
    if (latestPayment) {
      await prisma.paymentTransaction.update({
        where: { id: latestPayment.id },
        data: {
          status: 'success',
          providerPaymentId: paymentId
        }
      });
    } else {
      // Create new payment transaction if not found
      await logPaymentTransaction({
        provider: paymentMethod === 'razorpay' ? 'razorpay' : paymentMethod === 'phonepe' ? 'phonepe' : 'cod',
        orderId,
        providerOrderId: providerOrderId || orderId,
        providerPaymentId: paymentId,
        status: 'success',
        amount: Math.round(order.totalAmount * 100),
        paymentMethod: paymentMethod
      });
    }

    // Process referral if applicable
    if (order.userId && order.userId !== '') {
      try {
        await processReferralPurchase(order.userId, order.totalAmount);
      } catch (error) {
        // Don't fail payment verification if referral processing fails
      }
    }

    // Transition order status
    const updatedOrder = await transitionOrderStatus(orderId, 'confirmed', {
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true }
                    }
                  }
                }
              }
            }
          }
        },
        addresses: {
          where: { type: 'shipping' }
        },
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    // Send order confirmation email
    try {
      const addresses = (updatedOrder as any).addresses;
      const shippingAddr = addresses && addresses.length > 0 ? addresses[0] : null;
      const items = (updatedOrder as any).items;
      const user = (updatedOrder as any).user;

      const orderDetails: OrderDetails = {
        orderNumber: updatedOrder.orderNumber || `ULC-${updatedOrder.id.slice(0, 8).toUpperCase()}`,
        orderDate: new Date(updatedOrder.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        items: (items || []).map((item: any) => ({
          productTitle: item.variant?.product?.title || item.title || 'Product',
          variantTitle: item.variant?.title || 'Standard',
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.variant?.product?.images?.[0]?.url || ''
        })),
        subtotal: updatedOrder.subtotal || 0,
        shipping: updatedOrder.shippingAmount || 0,
        ...(updatedOrder.discountAmount !== null && updatedOrder.discountAmount !== undefined ? { discount: updatedOrder.discountAmount } : {}),
        total: updatedOrder.totalAmount,
        shippingAddress: {
          name: shippingAddr ? `${shippingAddr.firstName} ${shippingAddr.lastName}` : 'Customer',
          address: shippingAddr?.address1 || '',
          city: shippingAddr?.city || '',
          state: shippingAddr?.state || '',
          pincode: shippingAddr?.pincode || '',
          phone: shippingAddr?.phone || ''
        },
        paymentMethod: updatedOrder.paymentMethod || 'Online',
        ...(updatedOrder.trackingUrl ? { trackingUrl: updatedOrder.trackingUrl } : {}),
        ...(updatedOrder.awbNumber ? { awbNumber: updatedOrder.awbNumber } : {})
      };

      const confirmationEmailHtml = getOrderConfirmationEmailTemplate(
        orderDetails,
        req.user?.name || user?.name || 'Customer'
      );

      const userEmail = user?.email || req.user?.email || '';
      if (userEmail) {
        await sendEmail(
          userEmail,
          `Order Confirmed - ${orderDetails.orderNumber}`,
          confirmationEmailHtml,
          'ULICA',
          {
            template: 'order-confirmation',
            metadata: {
              orderId: updatedOrder.id,
              orderNumber: orderDetails.orderNumber,
              type: 'order-confirmation',
            }
          }
        );
      }
    } catch (error) {
      // Don't fail the payment verification if email fails
    }

    res.json({
      success: true,
      message: paymentMethod === 'cod'
        ? 'Confirmation fee paid. Order confirmed. Pay remaining amount on delivery.'
        : 'Payment verified successfully',
      data: { order: updatedOrder }
    });
  })
);

// Export helper functions for use in other routes
export { calculateOrderTotals, validateStockAvailability };

export default router;
