// @ts-nocheck
import { logger } from './loggerService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Category code mappings
const CATEGORY_CODES: Record<string, string> = {
  't-shirts': 'TSH',
  'shirts': 'SHT',
  'pants': 'PNT',
  'jeans': 'JNS',
  'shorts': 'SHT',
  'dresses': 'DRS',
  'skirts': 'SKT',
  'jackets': 'JCK',
  'hoodies': 'HDY',
  'sweaters': 'SWT',
  'blazers': 'BLZ',
  'coats': 'COT',
  'shoes': 'SHS',
  'sneakers': 'SNK',
  'boots': 'BTS',
  'sandals': 'SDL',
  'accessories': 'ACC',
  'bags': 'BAG',
  'belts': 'BLT',
  'watches': 'WCH',
  'jewelry': 'JWL',
  'hats': 'HAT',
  'scarves': 'SCF',
  'gloves': 'GLV',
  'socks': 'SCK',
  'underwear': 'UND',
  'lingerie': 'LNG',
  'swimwear': 'SWM',
  'activewear': 'ACT',
  'loungewear': 'LNG',
  'formal': 'FRM',
  'casual': 'CSL',
  'sport': 'SPT',
  'work': 'WRK',
  'party': 'PRT',
  'wedding': 'WDG',
  'maternity': 'MTR',
  'kids': 'KDS',
  'baby': 'BBY',
  'unisex': 'UNX',
  'men': 'MEN',
  'women': 'WMN'
};

const BRAND_PREFIX = 'ULI';

/**
 * Get or create category code
 */
async function getCategoryCode(category: string): Promise<string> {
  const normalizedCategory = category.toLowerCase().trim();
  
  // Check if category code exists in database
  let categoryCode = await prisma.categoryCode.findUnique({
    where: { category: normalizedCategory }
  });

  if (!categoryCode) {
    // Get code from mapping or generate default
    const code = CATEGORY_CODES[normalizedCategory] || 'GEN';
    
    // Create new category code
    categoryCode = await prisma.categoryCode.create({
      data: {
        category: normalizedCategory,
        code: code,
        description: `Auto-generated code for ${category}`
      }
    });
  }

  return categoryCode.code;
}

/**
 * Get next SKU counter
 */
async function getNextSkuCounter(): Promise<number> {
  const counter = await prisma.skuCounter.upsert({
    where: { id: '1' },
    update: {
      counter: {
        increment: 1
      }
    },
    create: {
      id: '1',
      counter: 1
    }
  });

  return counter.counter;
}

/**
 * Generate SKU for product
 */
export async function generateProductSku(category: string, productId?: string): Promise<string> {
  try {
    // Get category code
    const categoryCode = await getCategoryCode(category);
    
    // Get next counter
    const counter = await getNextSkuCounter();
    
    // Format counter with leading zeros (4 digits)
    const formattedCounter = counter.toString().padStart(4, '0');
    
    // Generate SKU: ULI-CAT-0001
    const sku = `${BRAND_PREFIX}-${categoryCode}-${formattedCounter}`;
    
    // Check if SKU already exists (shouldn't happen with counter, but safety check)
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    });
    
    if (existingProduct) {
      // If exists, try again with next counter
      return generateProductSku(category, productId);
    }
    
    return sku;
  } catch (error) {
    await logger.error('Error generating product SKU', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to generate product SKU');
  }
}

/**
 * Generate SKU for product variant
 */
export async function generateVariantSku(productSku: string, variantAttributes: string): Promise<string> {
  try {
    // Parse variant attributes to create a short identifier
    const attributes = JSON.parse(variantAttributes);
    const size = attributes.size || 'M';
    const color = attributes.color || 'BLK';
    
    // Create variant identifier (first 3 chars of size + first 3 chars of color)
    const sizeCode = size.substring(0, 3).toUpperCase();
    const colorCode = color.substring(0, 3).toUpperCase();
    const variantCode = `${sizeCode}${colorCode}`;
    
    // Generate variant SKU: ULI-CAT-0001-SIZCOL
    const variantSku = `${productSku}-${variantCode}`;
    
    // Check if variant SKU already exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { variantSku }
    });
    
    if (existingVariant) {
      // If exists, add a number suffix
      let counter = 1;
      let finalVariantSku = `${variantSku}-${counter}`;
      
      while (await prisma.productVariant.findUnique({ where: { variantSku: finalVariantSku } })) {
        counter++;
        finalVariantSku = `${variantSku}-${counter}`;
      }
      
      return finalVariantSku;
    }
    
    return variantSku;
  } catch (error) {
    await logger.error('Error generating variant SKU', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to generate variant SKU');
  }
}

/**
 * Validate SKU format
 */
export function validateSkuFormat(sku: string): boolean {
  // Format: ULI-CAT-0001 or ULI-CAT-0001-SIZCOL
  const skuRegex = /^ULI-[A-Z]{3}-\d{4}(-[A-Z0-9]{6}(-\d+)?)?$/;
  return skuRegex.test(sku);
}

/**
 * Get SKU information
 */
export function parseSku(sku: string): {
  brand: string;
  category: string;
  productNumber: string;
  variant?: string;
} | null {
  const parts = sku.split('-');
  
  if (parts.length < 3) return null;
  
  return {
    brand: parts[0],
    category: parts[1],
    productNumber: parts[2],
    variant: parts[3] || undefined
  };
}

/**
 * Search products by SKU
 */
export async function searchProductsBySku(sku: string) {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { sku: { contains: sku, mode: 'insensitive' } },
        {
          variants: {
            some: {
              OR: [
                { sku: { contains: sku, mode: 'insensitive' } },
                { variantSku: { contains: sku, mode: 'insensitive' } }
              ]
            }
          }
        }
      ]
    },
    include: {
      variants: true,
      images: true
    }
  });

  return products;
}

/**
 * Get all category codes
 */
export async function getCategoryCodes() {
  return await prisma.categoryCode.findMany({
    orderBy: { category: 'asc' }
  });
}

/**
 * Create or update category code
 */
export async function upsertCategoryCode(category: string, code: string, description?: string) {
  return await prisma.categoryCode.upsert({
    where: { category },
    update: { code, description },
    create: { category, code, description }
  });
}

/**
 * Get SKU statistics
 */
export async function getSkuStatistics() {
  const totalProducts = await prisma.product.count({
    where: { sku: { not: null } }
  });
  
  const totalVariants = await prisma.productVariant.count({
    where: { variantSku: { not: null } }
  });
  
  const categoryStats = await prisma.categoryCode.findMany({
    include: {
      _count: {
        select: {
          // This would need a relation, but for now we'll use a different approach
        }
      }
    }
  });

  return {
    totalProducts,
    totalVariants,
    categoryStats
  };
}
