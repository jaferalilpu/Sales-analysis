// @ts-nocheck
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import bwipjs from 'bwip-js';
import fs from 'fs';
import path from 'path';
import prisma from '../prisma/client';
import { logger } from './loggerService';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const INFO_SHEETS_DIR = path.join(UPLOADS_DIR, 'info-sheets');

// Ensure directories exist
if (!fs.existsSync(INFO_SHEETS_DIR)) {
  fs.mkdirSync(INFO_SHEETS_DIR, { recursive: true });
}

export type InfoSheetStatus = 'pending' | 'generated' | 'failed';

/**
 * Generate barcode image buffer from SKU or order number
 */
async function generateBarcodeImage(text: string): Promise<Buffer> {
  try {
    const config = {
      bcid: 'code128',
      text: text,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center' as const,
      textsize: 10,
      textfont: 'monospace' as const,
      backgroundcolor: 'FFFFFF',
      barcolor: '000000',
      textcolor: '000000'
    };

    const buffer = await bwipjs.toBuffer(config);
    return buffer;
  } catch (error) {
    await logger.error('Error generating barcode', { error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to generate barcode for: ${text}`);
  }
}

/**
 * Generate product info sheet PDF for an order
 */
export async function generateProductInfoSheet(orderId: string): Promise<{
  url: string;
  filePath: string;
}> {
  try {
    // Fetch order with all required relations
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                sku: true
              }
            },
            variant: {
              select: {
                id: true,
                title: true,
                variantSku: true,
                size: true,
                color: true
              }
            }
          }
        },
        addresses: {
          where: { type: 'shipping' },
          take: 1
        },
        fulfillment: true
      }
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Update status to indicate generation started
    await prisma.order.update({
      where: { id: orderId },
      data: { infoSheetStatus: 'pending' }
    });

    // Create PDF document (4x6 inches label size)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([288, 432]); // 4" x 6" (288 x 432 points)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 420; // Start from top

    // Title
    page.drawText('PRODUCT INFO SHEET', {
      x: 15,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    y -= 20;

    // Order Details
    page.drawText(`Order: ${order.orderNumber}`, {
      x: 15,
      y,
      size: 10,
      font: boldFont
    });
    y -= 15;

    page.drawText(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, {
      x: 15,
      y,
      size: 8,
      font
    });
    y -= 20;

    // Generate barcode
    const barcodeText = order.orderNumber;
    const barcodeBuffer = await generateBarcodeImage(barcodeText);
    const barcodeImage = await pdfDoc.embedPng(barcodeBuffer);
    page.drawImage(barcodeImage, {
      x: 15,
      y: y - 40,
      width: 258,
      height: 40
    });
    y -= 55;

    // Customer/Shipping Details
    const shippingAddress = order.addresses[0];
    const customerName = order.user?.name || shippingAddress?.firstName 
      ? `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim()
      : 'N/A';

    page.drawText('DELIVERY', {
      x: 15,
      y,
      size: 10,
      font: boldFont
    });
    y -= 15;

    page.drawText(customerName, {
      x: 15,
      y,
      size: 9,
      font: boldFont
    });
    y -= 12;

    if (shippingAddress) {
      const addressLines = shippingAddress.address1.split(',').slice(0, 2);
      addressLines.forEach((line: string) => {
        page.drawText(line.trim(), {
          x: 15,
          y,
          size: 8,
          font
        });
        y -= 10;
      });

      if (shippingAddress.address2) {
        page.drawText(shippingAddress.address2.trim(), {
          x: 15,
          y,
          size: 8,
          font
        });
        y -= 10;
      }

      page.drawText(
        `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pincode}`,
        {
          x: 15,
          y,
          size: 8,
          font
        }
      );
      y -= 10;

      if (shippingAddress.phone) {
        page.drawText(`Phone: ${shippingAddress.phone}`, {
          x: 15,
          y,
          size: 8,
          font
        });
        y -= 12;
      }
    }

    // Courier/Tracking Info
    if (order.courierName) {
      page.drawText(`Courier: ${order.courierName}`, {
        x: 15,
        y,
        size: 8,
        font
      });
      y -= 10;
    }

    if (order.awbNumber) {
      page.drawText(`AWB: ${order.awbNumber}`, {
        x: 15,
        y,
        size: 8,
        font
      });
      y -= 10;
    }

    if (order.fulfillment?.trackingNumber) {
      page.drawText(`Tracking: ${order.fulfillment.trackingNumber}`, {
        x: 15,
        y,
        size: 8,
        font
      });
      y -= 12;
    }

    // Products Section
    page.drawText('ITEMS', {
      x: 15,
      y,
      size: 9,
      font: boldFont
    });
    y -= 12;

    for (const item of order.items) {
      if (y < 50) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([288, 432]);
        y = 420;
      }

      const productTitle = item.title.length > 30
        ? item.title.substring(0, 30) + '...'
        : item.title;

      page.drawText(`${item.quantity}x ${productTitle}`, {
        x: 15,
        y,
        size: 8,
        font: boldFont
      });
      y -= 10;

      const sku = item.variant?.variantSku || item.variant?.title || item.product?.sku || '-';
      page.drawText(`SKU: ${sku}`, {
        x: 20,
        y,
        size: 7,
        font
      });
      y -= 9;

      if (item.variant?.size || item.variant?.color) {
        page.drawText(
          `Size: ${item.variant.size || '-'} | Color: ${item.variant.color || '-'}`,
          {
            x: 20,
            y,
            size: 7,
            font
          }
        );
        y -= 9;
      }

      page.drawText(`Price: ₹${item.price.toFixed(0)} | Total: ₹${item.total.toFixed(0)}`, {
        x: 20,
        y,
        size: 7,
        font
      });
      y -= 12;
    }

    // Footer
    if (y > 40) {
      page.drawLine({
        start: { x: 15, y },
        end: { x: 273, y },
        thickness: 0.5,
        color: rgb(0, 0, 0)
      });
      y -= 8;

      page.drawText('Packed by: ___________', {
        x: 15,
        y,
        size: 7,
        font
      });
      y -= 8;

      page.drawText('Verified by: ___________', {
        x: 15,
        y,
        size: 7,
        font
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `info-sheet-${order.orderNumber}-${Date.now()}.pdf`;
    const filePath = path.join(INFO_SHEETS_DIR, fileName);
    fs.writeFileSync(filePath, pdfBytes);

    // Generate URL (relative to uploads directory)
    const url = `/uploads/info-sheets/${fileName}`;

    // Update order with info sheet URL
    await prisma.order.update({
      where: { id: orderId },
      data: {
        infoSheetUrl: url,
        infoSheetStatus: 'generated',
        infoSheetGeneratedAt: new Date()
      }
    });

    return { url, filePath };
  } catch (error) {
    await logger.error('Error generating product info sheet', { error: error instanceof Error ? error.message : String(error) });

    // Update status to failed
    await prisma.order.update({
      where: { id: orderId },
      data: {
        infoSheetStatus: 'failed'
      }
    }).catch(() => {
      // Ignore update errors if order doesn't exist
    });

    throw error;
  }
}

/**
 * Regenerate product info sheet for an order
 */
export async function regenerateProductInfoSheet(orderId: string): Promise<{
  url: string;
  filePath: string;
}> {
  // Delete old file if exists
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { infoSheetUrl: true }
  });

  if (order?.infoSheetUrl) {
    const oldFilePath = path.join(UPLOADS_DIR, order.infoSheetUrl.replace('/uploads/', ''));
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  return generateProductInfoSheet(orderId);
}

/**
 * Get info sheet URL for an order (generate if missing)
 */
export async function getOrGenerateInfoSheet(orderId: string): Promise<string> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      infoSheetUrl: true,
      infoSheetStatus: true
    }
  });

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  // If already generated, return URL
  if (order.infoSheetUrl && order.infoSheetStatus === 'generated') {
    return order.infoSheetUrl;
  }

  // Generate if missing or failed
  const result = await generateProductInfoSheet(orderId);
  return result.url;
}

/**
 * Bulk generate info sheets for multiple orders
 */
export async function bulkGenerateInfoSheets(orderIds: string[]): Promise<{
  success: number;
  failed: number;
  errors: Array<{ orderId: string; error: string }>;
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ orderId: string; error: string }>
  };

  for (const orderId of orderIds) {
    try {
      await generateProductInfoSheet(orderId);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

