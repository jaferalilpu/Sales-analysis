import * as Joi from 'joi';

// Common schemas
export const commonSchemas = {
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', 'updatedAt', 'title', 'price', 'rating').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  },
  id: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  name: Joi.string().min(2).max(100).optional()
};

// Auth schemas
export const authSchemas = {
  register: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    name: commonSchemas.name,
    phone: commonSchemas.phone
  }),
  login: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password
  }),
  verifyEmail: Joi.object({
    token: Joi.string().required()
  }),
  resendVerification: Joi.object({
    email: commonSchemas.email
  }),
  forgotPassword: Joi.object({
    email: commonSchemas.email
  }),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: commonSchemas.password
  }),
  updateProfile: Joi.object({
    name: commonSchemas.name,
    phone: commonSchemas.phone
  })
};

// Product schemas
export const productSchemas = {
  create: Joi.object({
    title: Joi.string().min(2).max(200).required(),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
    description: Joi.string().optional(),
    shortDescription: Joi.string().max(500).optional(),
    category: Joi.string().max(100).optional(),
    tags: Joi.string().optional(),
    featured: Joi.boolean().default(false),
    status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
    metaTitle: Joi.string().max(60).optional(),
    metaDescription: Joi.string().max(160).optional(),
    variants: Joi.array().items(Joi.object({
      sku: Joi.string().required(),
      price: Joi.number().integer().min(0).required(),
      comparePrice: Joi.number().integer().min(0).optional(),
      costPrice: Joi.number().integer().min(0).optional(),
      stockQty: Joi.number().integer().min(0).default(0),
      attributes: Joi.string().required(), // JSON string
      weight: Joi.number().min(0).optional()
    })).min(1).required(),
    images: Joi.array().items(Joi.object({
      url: Joi.string().uri().required(),
      altText: Joi.string().optional(),
      position: Joi.number().integer().min(0).default(0),
      isPrimary: Joi.boolean().default(false)
    })).optional()
  }),
  update: Joi.object({
    title: Joi.string().min(2).max(200).optional(),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).optional(),
    description: Joi.string().optional(),
    shortDescription: Joi.string().max(500).optional(),
    category: Joi.string().max(100).optional(),
    tags: Joi.string().optional(),
    featured: Joi.boolean().optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    metaTitle: Joi.string().max(60).optional(),
    metaDescription: Joi.string().max(160).optional()
  })
};

// Cart schemas
export const cartSchemas = {
  addItem: Joi.object({
    variantId: commonSchemas.id,
    quantity: Joi.number().integer().min(1).max(10).required()
  }),
  updateItem: Joi.object({
    quantity: Joi.number().integer().min(1).max(10).required()
  })
};

// Wishlist schemas
export const wishlistSchemas = {
  addItem: Joi.object({
    productId: commonSchemas.id
  })
};

// Address schemas
export const addressSchemas = {
  create: Joi.object({
    type: Joi.string().valid('shipping', 'billing').default('shipping'),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    company: Joi.string().max(100).optional(),
    line1: Joi.string().min(5).max(200).required(),
    line2: Joi.string().max(200).optional(),
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).required(),
    country: Joi.string().default('India'),
    phone: commonSchemas.phone,
    isDefault: Joi.boolean().default(false)
  }),
  update: Joi.object({
    type: Joi.string().valid('shipping', 'billing').optional(),
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    company: Joi.string().max(100).optional(),
    line1: Joi.string().min(5).max(200).optional(),
    line2: Joi.string().max(200).optional(),
    city: Joi.string().min(2).max(50).optional(),
    state: Joi.string().min(2).max(50).optional(),
    pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).optional(),
    country: Joi.string().optional(),
    phone: commonSchemas.phone,
    isDefault: Joi.boolean().optional()
  })
};

// Order schemas
export const orderSchemas = {
  create: Joi.object({
    items: Joi.array().items(Joi.object({
      variantId: commonSchemas.id,
      quantity: Joi.number().integer().min(1).max(10).required()
    })).min(1).required(),
    shippingAddress: addressSchemas.create.required(),
    billingAddress: addressSchemas.create.optional(),
    couponCode: Joi.string().max(20).optional(),
    paymentMethod: Joi.string().valid('razorpay', 'phonepe').required(),
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone.optional(),
    notes: Joi.string().max(500).optional()
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned').required(),
    trackingNumber: Joi.string().max(50).optional(),
    notes: Joi.string().max(500).optional()
  }),
  verifyPayment: Joi.object({
    orderId: commonSchemas.id,
    paymentId: Joi.string().required(),
    signature: Joi.string().required(),
    paymentMethod: Joi.string().valid('razorpay', 'phonepe').required()
  })
};

// Coupon schemas
export const couponSchemas = {
  create: Joi.object({
    code: Joi.string().pattern(/^[A-Z0-9_-]+$/).max(20).required(),
    type: Joi.string().valid('percent', 'flat', 'free_shipping').required(),
    value: Joi.number().integer().min(1).required(),
    minOrderValue: Joi.number().integer().min(0).optional(),
    maxDiscount: Joi.number().integer().min(0).optional(),
    usageLimit: Joi.number().integer().min(1).optional(),
    userLimit: Joi.number().integer().min(1).optional(),
    startsAt: Joi.date().optional(),
    expiresAt: Joi.date().optional()
  }),
  update: Joi.object({
    type: Joi.string().valid('percent', 'flat', 'free_shipping').optional(),
    value: Joi.number().integer().min(1).optional(),
    minOrderValue: Joi.number().integer().min(0).optional(),
    maxDiscount: Joi.number().integer().min(0).optional(),
    usageLimit: Joi.number().integer().min(1).optional(),
    userLimit: Joi.number().integer().min(1).optional(),
    isActive: Joi.boolean().optional(),
    startsAt: Joi.date().optional(),
    expiresAt: Joi.date().optional()
  })
};

// Review schemas
export const reviewSchemas = {
  create: Joi.object({
    productId: commonSchemas.id,
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().max(100).optional(),
    comment: Joi.string().max(1000).optional()
  }),
  update: Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    title: Joi.string().max(100).optional(),
    comment: Joi.string().max(1000).optional()
  })
};

// Validation middleware
export function validate(schema: any) {
  return (req: any, res: any, next: any) => {
    let validationSchema;
    let dataToValidate;
    
    // Handle different schema formats
    if (schema.body) {
      validationSchema = schema.body;
      dataToValidate = req.body;
    } else if (schema.query) {
      validationSchema = schema.query;
      dataToValidate = req.query;
    } else if (schema.params) {
      validationSchema = schema.params;
      dataToValidate = req.params;
    } else {
      // Direct Joi schema
      validationSchema = schema;
      dataToValidate = req.body;
    }

    const { error, value } = validationSchema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Update the appropriate request object
    if (schema.body) {
      req.body = value;
    } else if (schema.query) {
      req.query = value;
    } else if (schema.params) {
      req.params = value;
    } else {
      req.body = value;
    }
    
    next();
  };
}

// Validation error helper
export function validationError(message: string, errors: any[] = []) {
  return {
    success: false,
    message,
    errors
  };
}