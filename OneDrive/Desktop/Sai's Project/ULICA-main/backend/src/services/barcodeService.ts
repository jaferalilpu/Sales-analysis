// @ts-nocheck
import bwipjs from 'bwip-js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { logger } from './loggerService';

const prisma = new PrismaClient();

// Barcode configuration
const BARCODE_CONFIG = {
  bcid: 'code128', // Barcode type
  text: '', // Will be set dynamically
  scale: 3, // Scaling factor
  height: 10, // Height in mm
  includetext: true, // Include text below barcode
  textxalign: 'center', // Center align text
  textsize: 10, // Text size
  textfont: 'monospace', // Font family
  backgroundcolor: 'FFFFFF', // White background
  barcolor: '000000', // Black bars
  textcolor: '000000' // Black text
};

/**
 * Generate barcode image from SKU
 */
export async function generateBarcodeImage(sku: string, format: 'png' | 'svg' = 'png'): Promise<Buffer> {
  try {
    const config = {
      ...BARCODE_CONFIG,
      text: sku,
      bcid: 'code128'
    };

    const imageBuffer = await bwipjs.toBuffer(config);
    return imageBuffer;
  } catch (error) {
    await logger.error('Error generating barcode', { error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to generate barcode for SKU: ${sku}`);
  }
}

/**
 * Generate barcode SVG
 */
export async function generateBarcodeSvg(sku: string): Promise<string> {
  try {
    const config = {
      ...BARCODE_CONFIG,
      text: sku,
      bcid: 'code128'
    };

    const svgString = await bwipjs.toSVG(config);
    return svgString;
  } catch (error) {
    await logger.error('Error generating barcode SVG', { error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to generate barcode SVG for SKU: ${sku}`);
  }
}

/**
 * Save barcode image to file system
 */
export async function saveBarcodeImage(sku: string, format: 'png' | 'svg' = 'png'): Promise<string> {
  try {
    // Ensure uploads/barcodes directory exists
    const barcodeDir = path.join(process.cwd(), 'uploads', 'barcodes');
    if (!fs.existsSync(barcodeDir)) {
      fs.mkdirSync(barcodeDir, { recursive: true });
    }

    const filename = `${sku}.${format}`;
    const filepath = path.join(barcodeDir, filename);

    if (format === 'png') {
      const imageBuffer = await generateBarcodeImage(sku, 'png');
      fs.writeFileSync(filepath, imageBuffer);
    } else {
      const svgString = await generateBarcodeSvg(sku);
      fs.writeFileSync(filepath, svgString);
    }

    // Return relative URL
    return `/uploads/barcodes/${filename}`;
  } catch (error) {
    await logger.error('Error saving barcode image', { error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to save barcode image for SKU: ${sku}`);
  }
}

/**
 * Generate and save barcode for product
 */
export async function generateProductBarcode(productId: string): Promise<string> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sku: true }
    });

    if (!product || !product.sku) {
      throw new Error('Product or SKU not found');
    }

    const barcodeUrl = await saveBarcodeImage(product.sku, 'png');
    
    // Update product with barcode URL
    await prisma.product.update({
      where: { id: productId },
      data: { barcodeUrl }
    });

    return barcodeUrl;
  } catch (error) {
    await logger.error('Error generating product barcode', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to generate product barcode');
  }
}

/**
 * Generate and save barcode for product variant
 */
export async function generateVariantBarcode(variantId: string): Promise<string> {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { variantSku: true, sku: true }
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    const sku = variant.variantSku || variant.sku;
    if (!sku) {
      throw new Error('Variant SKU not found');
    }

    const barcodeUrl = await saveBarcodeImage(sku, 'png');
    
    // Update variant with barcode URL
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { barcodeUrl }
    });

    return barcodeUrl;
  } catch (error) {
    await logger.error('Error generating variant barcode', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to generate variant barcode');
  }
}

/**
 * Generate barcodes for multiple products
 */
export async function generateBulkBarcodes(productIds: string[]): Promise<{ productId: string; barcodeUrl: string; sku: string }[]> {
  const results = [];

  for (const productId of productIds) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { sku: true }
      });

      if (product && product.sku) {
        const barcodeUrl = await saveBarcodeImage(product.sku, 'png');
        results.push({
          productId,
          barcodeUrl,
          sku: product.sku
        });
      }
    } catch (error) {
      await logger.error(`Error generating barcode for product ${productId}`, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  return results;
}

/**
 * Generate barcode for SKU (without saving to database)
 */
export async function generateBarcodeForSku(sku: string, format: 'png' | 'svg' = 'png'): Promise<Buffer | string> {
  if (format === 'svg') {
    return await generateBarcodeSvg(sku);
  } else {
    return await generateBarcodeImage(sku, 'png');
  }
}

/**
 * Get barcode image by SKU
 */
export async function getBarcodeBySku(sku: string, format: 'png' | 'svg' = 'png'): Promise<Buffer | string> {
  try {
    // Check if barcode file exists
    const barcodeDir = path.join(process.cwd(), 'uploads', 'barcodes');
    const filename = `${sku}.${format}`;
    const filepath = path.join(barcodeDir, filename);

    if (fs.existsSync(filepath)) {
      if (format === 'png') {
        return fs.readFileSync(filepath);
      } else {
        return fs.readFileSync(filepath, 'utf8');
      }
    } else {
      // Generate new barcode
      if (format === 'svg') {
        return await generateBarcodeSvg(sku);
      } else {
        return await generateBarcodeImage(sku, 'png');
      }
    }
  } catch (error) {
    await logger.error('Error getting barcode by SKU', { error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to get barcode for SKU: ${sku}`);
  }
}

/**
 * Delete barcode file
 */
export async function deleteBarcodeFile(sku: string): Promise<void> {
  try {
    const barcodeDir = path.join(process.cwd(), 'uploads', 'barcodes');
    const pngFile = path.join(barcodeDir, `${sku}.png`);
    const svgFile = path.join(barcodeDir, `${sku}.svg`);

    if (fs.existsSync(pngFile)) {
      fs.unlinkSync(pngFile);
    }

    if (fs.existsSync(svgFile)) {
      fs.unlinkSync(svgFile);
    }
  } catch (error) {
    await logger.error('Error deleting barcode file', { error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * Generate barcode with custom options
 */
export async function generateCustomBarcode(
  sku: string, 
  options: {
    format?: 'png' | 'svg';
    scale?: number;
    height?: number;
    width?: number;
    textSize?: number;
    includeText?: boolean;
  } = {}
): Promise<Buffer | string> {
  const config = {
    ...BARCODE_CONFIG,
    text: sku,
    scale: options.scale || 3,
    height: options.height || 10,
    width: options.width,
    textsize: options.textSize || 10,
    includetext: options.includeText !== false
  };

  try {
    if (options.format === 'svg') {
      return await bwipjs.toSVG(config);
    } else {
      return await bwipjs.toBuffer(config);
    }
  } catch (error) {
    await logger.error('Error generating custom barcode', { error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to generate custom barcode for SKU: ${sku}`);
  }
}
