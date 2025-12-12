import * as express from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { asyncHandler } from '../middlewares/errorHandler';
import { ExpressResponse } from '../types/express';

const router = express.Router();

/**
 * GET /api/products
 * Get all products with pagination and filtering
 */
router.get('/', asyncHandler(async (req: express.Request, res: ExpressResponse) => {
  const {
    page = 1,
    limit = 10,
    search,
    category
  } = req.query;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    const searchStr = String(search);
    where.OR = [
      { title: { contains: searchStr, mode: 'insensitive' } },
      { description: { contains: searchStr, mode: 'insensitive' } },
      { tags: { hasSome: [searchStr] } }
    ];
  }

  if (category) {
    where.category = String(category) as any;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    }),
    prisma.product.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

/**
 * GET /api/products/:id
 * Get single product by ID or slug
 */
router.get('/:id', asyncHandler(async (req: express.Request, res: ExpressResponse) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, error: 'Product ID is required' });
    return;
  }

  // Try to find by ID first, then by slug
  // UUIDs are typically 36 characters with hyphens, so we can check if it looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let product = null;

  if (isUUID) {
    // Try by ID first
    product = await prisma.product.findUnique({
      where: { id: id as string },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
  }

  // If not found by ID or not a UUID, try by slug
  if (!product) {
    product = await prisma.product.findUnique({
      where: { slug: id as string },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
  }

  if (!product) {
    res.status(404).json({
      success: false,
      error: 'Product not found'
    });
    return;
  }

  // Extract size chart, details, specifications, washCare from tags
  const extractFromTags = (prefix: string) => {
    const tag = (product as any).tags?.find((t: string) => t.startsWith(prefix));
    if (tag) {
      try {
        const data = tag.replace(prefix, '');
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  };

  // Add extracted data to product response
  const productWithExtras = {
    ...product,
    sizeChart: extractFromTags('__SIZECHART__:'),
    details: extractFromTags('__DETAILS__:'),
    specifications: extractFromTags('__SPECIFICATIONS__:'),
    washCare: extractFromTags('__WASHCARE__:'),
  };

  res.json({
    success: true,
    data: { product: productWithExtras }
  });
}));

/**
 * POST /api/products
 * Create new product
 */
// Helper to generate a simple unique-ish SKU from name and time
function generateSku(name: string, category?: string) {
  const base = (name || 'prod')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 12);
  const cat = (category || 'gen').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 3);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${cat}-${base}-${rand}`;
}

router.post('/', asyncHandler(async (req: express.Request, res: ExpressResponse) => {
  const { name, description, category, price, images, dropId, sku, originalPrice, attributes, weight, dimensions, story } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        title: name,
        description,
        price: price || 0,
        category: category || 'general',
        images: images || '/placeholder-product.jpg',
        sku: sku && String(sku).trim() ? sku : generateSku(name, category),
        ...(originalPrice && { compareAtPrice: originalPrice }),
        attributes,
        weight,
        dimensions,
        story
      }
    });

    if (dropId) {
      try {
        await tx.dropProduct.create({
          data: {
            dropId,
            productId: product.id
          }
        });
      } catch (e) {
        // If invalid dropId, ignore linking to avoid failing product creation
      }
    }

    return product;
  });

  res.json({
    success: true,
    data: { product: result }
  });
}));

/**
 * PUT /api/products/:id
 * Update product
 */
router.put('/:id', asyncHandler(async (req: express.Request, res: ExpressResponse) => {
  const { id } = req.params;
  const { name, description, category, price, images, status, inStock } = req.body;

  const product = await prisma.product.update({
    where: { id: id as string },
    data: {
      ...(name && { title: name }),
      description: description || undefined,
      category: category || undefined,
      price: price || undefined,
      images: images || undefined,
      inStock: typeof inStock === 'boolean' ? inStock : (status !== undefined ? status !== 'archived' : undefined)
    }
  });

  res.json({
    success: true,
    data: { product }
  });
}));

/**
 * DELETE /api/products/:id
 * Delete product
 */
router.delete('/:id', asyncHandler(async (req: express.Request, res: ExpressResponse) => {
  const { id } = req.params;

  await prisma.product.delete({
    where: { id: id as string }
  });

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
}));

export default router;
