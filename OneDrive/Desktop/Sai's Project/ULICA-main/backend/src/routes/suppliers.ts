import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { ExpressResponse } from '../types/express';
import { AuthenticatedRequest } from '../middlewares/auth';
import Joi from 'joi';
import {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
  addProductToSupplier,
  updateProductSupplier,
  removeProductFromSupplier,
  getSupplierStats,
  getProductSuppliers,
  getPrimarySupplier
} from '../services/supplierService';

const router = express.Router();

/**
 * POST /api/suppliers
 * Create a new supplier
 */
router.post('/',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      name: Joi.string().min(2).max(200).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().min(10).max(15).required(),
      address: Joi.string().min(5).max(500).required(),
      contactPerson: Joi.string().min(2).max(100).required(),
      paymentTerms: Joi.string().min(2).max(200).required(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      country: Joi.string().max(100).optional(),
      pincode: Joi.string().max(10).optional(),
      notes: Joi.string().max(1000).optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const supplier = await createSupplier(req.body);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  })
);

/**
 * GET /api/suppliers
 * Get all suppliers with pagination and filters
 */
router.get('/',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      search: Joi.string().optional(),
      isActive: Joi.boolean().optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { page, limit, ...filters } = req.query;
    const result = await getSuppliers(page as any, limit as any, filters);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * GET /api/suppliers/:id
 * Get supplier by ID
 */
router.get('/:id',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const supplier = await getSupplier(req.params['id'] as string);

    res.json({
      success: true,
      data: supplier
    });
  })
);

/**
 * PUT /api/suppliers/:id
 * Update supplier
 */
router.put('/:id',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    },
    body: Joi.object({
      name: Joi.string().min(2).max(200).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().min(10).max(15).optional(),
      address: Joi.string().min(5).max(500).optional(),
      contactPerson: Joi.string().min(2).max(100).optional(),
      paymentTerms: Joi.string().min(2).max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      country: Joi.string().max(100).optional(),
      pincode: Joi.string().max(10).optional(),
      notes: Joi.string().max(1000).optional(),
      isActive: Joi.boolean().optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const supplier = await updateSupplier(req.params['id'] as string, req.body);

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  })
);

/**
 * DELETE /api/suppliers/:id
 * Delete supplier
 */
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    await deleteSupplier(req.params['id'] as string);

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  })
);

/**
 * POST /api/suppliers/:id/products
 * Add product to supplier
 */
router.post('/:id/products',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      id: Joi.string().required()
    },
    body: Joi.object({
      productId: Joi.string().required(),
      supplierSku: Joi.string().optional(),
      costPrice: Joi.number().min(0).optional(),
      minOrderQty: Joi.number().min(1).optional(),
      leadTime: Joi.number().min(0).optional(),
      isPrimary: Joi.boolean().default(false)
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const productSupplier = await addProductToSupplier({
      ...req.body,
      supplierId: req.params['id'] as string
    });

    res.status(201).json({
      success: true,
      message: 'Product added to supplier successfully',
      data: productSupplier
    });
  })
);

/**
 * PUT /api/suppliers/:supplierId/products/:productId
 * Update product-supplier relationship
 */
router.put('/:supplierId/products/:productId',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      supplierId: Joi.string().required(),
      productId: Joi.string().required()
    },
    body: Joi.object({
      supplierSku: Joi.string().optional(),
      costPrice: Joi.number().min(0).optional(),
      minOrderQty: Joi.number().min(1).optional(),
      leadTime: Joi.number().min(0).optional(),
      isPrimary: Joi.boolean().optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const productSupplier = await updateProductSupplier(
      req.params['productId'] as string,
      req.params['supplierId'] as string,
      req.body
    );

    res.json({
      success: true,
      message: 'Product-supplier relationship updated successfully',
      data: productSupplier
    });
  })
);

/**
 * DELETE /api/suppliers/:supplierId/products/:productId
 * Remove product from supplier
 */
router.delete('/:supplierId/products/:productId',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      supplierId: Joi.string().required(),
      productId: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    await removeProductFromSupplier(req.params['productId'] as string, req.params['supplierId'] as string);

    res.json({
      success: true,
      message: 'Product removed from supplier successfully'
    });
  })
);

/**
 * GET /api/suppliers/stats
 * Get supplier statistics
 */
router.get('/stats',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: ExpressResponse) => {
    const stats = await getSupplierStats();

    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * GET /api/suppliers/products/:productId
 * Get suppliers for a specific product
 */
router.get('/products/:productId',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      productId: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const suppliers = await getProductSuppliers(req.params['productId'] as string);

    res.json({
      success: true,
      data: suppliers
    });
  })
);

/**
 * GET /api/suppliers/products/:productId/primary
 * Get primary supplier for a product
 */
router.get('/products/:productId/primary',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      productId: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const primarySupplier = await getPrimarySupplier(req.params['productId'] as string);

    res.json({
      success: true,
      data: primarySupplier
    });
  })
);

export default router;
