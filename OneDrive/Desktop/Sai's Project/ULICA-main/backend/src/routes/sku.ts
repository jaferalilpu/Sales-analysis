// @ts-nocheck
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { logger } from '../services/loggerService';
import { ExpressResponse } from '../types/express';
import { AuthenticatedRequest } from '../middlewares/auth';
import Joi from 'joi';
import {
  generateProductSku,
  generateVariantSku,
  validateSkuFormat,
  parseSku,
  searchProductsBySku,
  getCategoryCodes,
  upsertCategoryCode,
  getSkuStatistics
} from '../services/skuService';
import {
  generateBarcodeForSku,
  generateProductBarcode,
  generateVariantBarcode,
  generateBulkBarcodes,
  getBarcodeBySku,
  generateCustomBarcode
} from '../services/barcodeService';
import archiver from 'archiver';
import { Readable } from 'stream';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/sku/generate
 * Generate SKU for product
 */
router.post('/generate',
  authenticateToken,
  requireAdmin,
  validate({
    body: {
      category: Joi.string().required(),
      productId: Joi.string().optional()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { category, productId } = req.body;
    
    const sku = await generateProductSku(category, productId);
    
    res.json({
      success: true,
      data: { sku }
    });
  })
);

/**
 * POST /api/sku/generate-variant
 * Generate SKU for product variant
 */
router.post('/generate-variant',
  authenticateToken,
  requireAdmin,
  validate({
    body: {
      productSku: Joi.string().required(),
      variantAttributes: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { productSku, variantAttributes } = req.body;
    
    const variantSku = await generateVariantSku(productSku, variantAttributes);
    
    res.json({
      success: true,
      data: { variantSku }
    });
  })
);

/**
 * POST /api/sku/validate
 * Validate SKU format
 */
router.post('/validate',
  validate({
    body: {
      sku: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { sku } = req.body;
    
    const isValid = validateSkuFormat(sku);
    const parsed = parseSku(sku);
    
    res.json({
      success: true,
      data: {
        isValid,
        parsed: isValid ? parsed : null
      }
    });
  })
);

/**
 * GET /api/sku/search
 * Search products by SKU
 */
router.get('/search',
  validate({
    query: {
      q: Joi.string().required(),
      limit: Joi.number().integer().min(1).max(100).default(20)
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { q, limit } = req.query;
    
    const products = await searchProductsBySku(q);
    
    res.json({
      success: true,
      data: products.slice(0, limit)
    });
  })
);

/**
 * GET /api/sku/category-codes
 * Get all category codes
 */
router.get('/category-codes',
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const categoryCodes = await getCategoryCodes();
    
    res.json({
      success: true,
      data: categoryCodes
    });
  })
);

/**
 * POST /api/sku/category-codes
 * Create or update category code
 */
router.post('/category-codes',
  authenticateToken,
  requireAdmin,
  validate({
    body: {
      category: Joi.string().required(),
      code: Joi.string().required(),
      description: Joi.string().optional()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { category, code, description } = req.body;
    
    const categoryCode = await upsertCategoryCode(category, code, description);
    
    res.json({
      success: true,
      data: categoryCode
    });
  })
);

/**
 * GET /api/sku/statistics
 * Get SKU statistics
 */
router.get('/statistics',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const statistics = await getSkuStatistics();
    
    res.json({
      success: true,
      data: statistics
    });
  })
);

/**
 * GET /api/sku/:sku/barcode
 * Get barcode image for SKU
 */
router.get('/:sku/barcode',
  validate({
    params: {
      sku: Joi.string().required()
    },
    query: {
      format: Joi.string().valid('png', 'svg').default('png'),
      scale: Joi.number().min(1).max(10).optional(),
      height: Joi.number().min(5).max(50).optional(),
      textSize: Joi.number().min(5).max(20).optional()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { sku } = req.params;
    const { format, scale, height, textSize } = req.query;
    
    try {
      const options = {
        format,
        scale: scale ? parseInt(scale) : undefined,
        height: height ? parseInt(height) : undefined,
        textSize: textSize ? parseInt(textSize) : undefined
      };
      
      const barcode = await generateCustomBarcode(sku, options);
      
      if (format === 'svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(barcode);
      } else {
        res.setHeader('Content-Type', 'image/png');
        res.send(barcode);
      }
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Barcode not found'
      });
    }
  })
);

/**
 * POST /api/sku/bulk-barcodes
 * Generate barcodes for multiple products
 */
router.post('/bulk-barcodes',
  authenticateToken,
  requireAdmin,
  validate({
    body: {
      productIds: Joi.array().items(Joi.string()).min(1).max(100).required(),
      format: Joi.string().valid('png', 'svg').default('png')
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { productIds, format } = req.body;
    
    const results = await generateBulkBarcodes(productIds);
    
    if (format === 'svg') {
      // For SVG, return individual files
      res.json({
        success: true,
        data: results
      });
    } else {
      // For PNG, create a ZIP file
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="barcodes.zip"');
      
      archive.pipe(res);
      
      for (const result of results) {
        try {
          const barcodeBuffer = await getBarcodeBySku(result.sku, 'png') as Buffer;
          archive.append(barcodeBuffer, { name: `${result.sku}.png` });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          logger.error(`Error adding barcode for ${result.sku}`, { sku: result.sku, error: errorMsg }).catch(() => {});
        }
      }
      
      await archive.finalize();
    }
  })
);

/**
 * POST /api/sku/:productId/generate-barcode
 * Generate barcode for specific product
 */
router.post('/:productId/generate-barcode',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      productId: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { productId } = req.params;
    
    const barcodeUrl = await generateProductBarcode(productId);
    
    res.json({
      success: true,
      data: { barcodeUrl }
    });
  })
);

/**
 * POST /api/sku/variant/:variantId/generate-barcode
 * Generate barcode for specific variant
 */
router.post('/variant/:variantId/generate-barcode',
  authenticateToken,
  requireAdmin,
  validate({
    params: {
      variantId: Joi.string().required()
    }
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { variantId } = req.params;
    
    const barcodeUrl = await generateVariantBarcode(variantId);
    
    res.json({
      success: true,
      data: { barcodeUrl }
    });
  })
);

export default router;
