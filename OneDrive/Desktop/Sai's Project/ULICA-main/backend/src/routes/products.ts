import * as express from 'express';
import * as Joi from 'joi';
import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { asyncHandler, notFoundError } from '../middlewares/errorHandler';
import { optionalAuth, AuthenticatedRequest } from '../middlewares/auth';
import { validate, commonSchemas } from '../middlewares/validation';
import { ExpressResponse } from '../types/express';

const router = express.Router();

/**
 * GET /api/products
 * Get all active products with pagination and filtering
 * Products are active only when they're in a live drop (synced by ProductStatusService)
 * Admin users can see all products (including inactive ones)
 */
router.get('/',
  optionalAuth,
  validate({
    query: Joi.object({
      page: commonSchemas.pagination.page,
      limit: commonSchemas.pagination.limit,
      sort: commonSchemas.pagination.sort,
      order: commonSchemas.pagination.order,
      category: Joi.string().optional(),
      search: Joi.string().optional(),
      minPrice: Joi.number().integer().min(0).optional(),
      maxPrice: Joi.number().integer().min(0).optional(),
      inStock: Joi.boolean().optional(),
      featured: Joi.boolean().optional()
    })
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      featured
    } = req.query;

    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    // Build where clause
    // For regular users: only show active products (products in live drops)
    // For admin users: show all products (including inactive ones)
    const where: Prisma.ProductWhereInput = {};
    
    if (!isAdmin) {
      // Regular users only see active products
      where.isActive = true;
    }
    // Admin users see all products (no isActive filter)

    if (category) {
      where.category = String(category) as any;
    }

    if (search) {
      const searchStr = String(search);
      // Ensure search OR is properly combined with isActive filter
      // For non-admin users, we need: isActive = true AND (search conditions)
      // Prisma automatically combines these with AND when both are set
      where.OR = [
        { title: { contains: searchStr, mode: 'insensitive' } },
        { description: { contains: searchStr, mode: 'insensitive' } },
        { tags: { hasSome: [searchStr] } }
      ];
    }

    if (featured !== undefined) {
      const featuredBool = String(featured) === 'true';
      where.isFeatured = featuredBool;
    }

    // Build variant where clause for price and stock filters
    let variantWhere: Prisma.ProductVariantWhereInput = {};
    if (minPrice !== undefined || maxPrice !== undefined || inStock !== undefined) {
      variantWhere = {};

      if (minPrice !== undefined) {
        variantWhere.price = { gte: Number(minPrice) };
      }
      if (maxPrice !== undefined) {
        const currentPrice = variantWhere.price as any;
        variantWhere.price = { ...(currentPrice || {}), lte: Number(maxPrice) };
      }
      if (inStock === 'true') {
        variantWhere.stockQty = { gt: 0 };
      }
    }

    // Get total count
    const totalCount = await prisma.product.count({
      where: variantWhere.stockQty || variantWhere.price ? {
        ...where,
        variants: { some: variantWhere }
      } : where
    });

    // Get products
    const products = await prisma.product.findMany({
      where: variantWhere.stockQty || variantWhere.price ? {
        ...where,
        variants: { some: variantWhere }
      } : where,
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          where: variantWhere,
          orderBy: { price: 'asc' }
        },
        _count: {
          select: { reviews: true }
        },
        wishlistItems: userId ? {
          where: { userId },
          select: { id: true }
        } : false
      },
      orderBy: {
        [sort as string]: order as string
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    // Calculate average ratings
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const reviews = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true }
        });

        const variantPrices = product.variants.map((v) => v.price);
        const minPrice = variantPrices.length ? Math.min(...variantPrices) : 0;
        const maxPrice = variantPrices.length ? Math.max(...variantPrices) : 0;
        const inStockFlag = product.variants.some((v) => v.stockQty > 0);

        return {
          ...product,
          averageRating: reviews._avg.rating || 0,
          reviewCount: product._count?.reviews || 0,
          isInWishlist: Array.isArray(product.wishlistItems) && product.wishlistItems.length > 0,
          minPrice,
          maxPrice,
          inStock: inStockFlag
        };
      })
    );

    res.json({
      success: true,
      data: {
        products: productsWithRatings,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      }
    });
  })
);

/**
 * GET /api/products/categories
 * Get all product categories
 */
router.get('/categories',
  asyncHandler(async (_req: express.Request, res: ExpressResponse) => {
    const categories = await prisma.product.findMany({
      where: { isActive: true },
      select: { categoryId: true },
      distinct: ['categoryId']
    });

    // Get category names from categoryId
    const categoryIds = categories
      .map(c => c.categoryId)
      .filter(Boolean) as string[];

    const categoryRecords = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { name: true }
    });

    const categoryList = categoryRecords
      .map(c => c.name)
      .filter(Boolean)
      .sort();

    res.json({
      success: true,
      data: { categories: categoryList }
    });
  })
);

/**
 * GET /api/products/featured
 * Get featured products
 */
router.get('/featured',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const limit = parseInt(req.query['limit'] as string) || 8;

    // Build where clause for featured products
    // For regular users: only show active featured products
    // For admin users: show all featured products
    const where: Prisma.ProductWhereInput = {
      isFeatured: true
    };

    // For regular users, only show active products
    if (!isAdmin) {
      where.isActive = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        _count: {
          select: { reviews: true }
        },
        wishlistItems: userId ? {
          where: { userId },
          select: { id: true }
        } : false
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    // Calculate average ratings
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const reviews = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true }
        });

        const variantPrices = product.variants.map((v) => v.price);
        const minPrice = variantPrices.length ? Math.min(...variantPrices) : 0;
        const maxPrice = variantPrices.length ? Math.max(...variantPrices) : 0;
        const inStockFlag = product.variants.some((v) => v.stockQty > 0);

        return {
          ...product,
          averageRating: reviews._avg.rating || 0,
          reviewCount: product._count?.reviews || 0,
          isInWishlist: Array.isArray(product.wishlistItems) && product.wishlistItems.length > 0,
          minPrice,
          maxPrice,
          inStock: inStockFlag
        };
      })
    );

    res.json({
      success: true,
      data: { products: productsWithRatings }
    });
  })
);

/**
 * GET /api/products/:identifier
 * Get product by slug or ID
 * NOTE: This route must be defined LAST to avoid matching /categories or /featured
 */
router.get('/:identifier',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { identifier } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    if (!identifier) {
      throw notFoundError('Product identifier is required');
    }

    // Check if identifier is a UUID (ID) or a slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    const product = await prisma.product.findUnique({
      where: isUuid 
        ? { id: identifier as string }
        : { slug: identifier as string },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true }
        },
        wishlistItems: userId ? {
          where: { userId },
          select: { id: true }
        } : false
      }
    });

    if (!product) {
      throw notFoundError('Product not found');
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

    // Calculate average rating
    const averageRating = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true }
    });

    // Get related products (only active products for non-admin users)
    const relatedProductsWhere: Prisma.ProductWhereInput = {
      categoryId: product.categoryId,
      id: { not: product.id }
    };
    
    // For regular users, only show active products
    if (!isAdmin) {
      relatedProductsWhere.isActive = true;
    }

    const relatedProducts = await prisma.product.findMany({
      where: relatedProductsWhere,
      include: {
        images: {
          where: { isPrimary: true }
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      take: 4
    });

    res.json({
      success: true,
      data: {
        product: {
          ...product,
          sizeChart: extractFromTags('__SIZECHART__:'),
          details: extractFromTags('__DETAILS__:'),
          specifications: extractFromTags('__SPECIFICATIONS__:'),
          washCare: extractFromTags('__WASHCARE__:'),
          averageRating: averageRating._avg.rating || 0,
          reviewCount: product._count.reviews,
          isInWishlist: Array.isArray(product.wishlistItems) && product.wishlistItems.length > 0,
          relatedProducts: relatedProducts.map(p => ({
            ...p,
            minPrice: p.variants[0]?.price || 0
          }))
        }
      }
    });
  })
);

export default router;