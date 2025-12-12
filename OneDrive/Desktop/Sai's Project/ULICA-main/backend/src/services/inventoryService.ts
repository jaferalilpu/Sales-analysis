// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { CustomError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();
const DEFAULT_LOW_STOCK_THRESHOLD = Number(process.env['LOW_STOCK_THRESHOLD'] ?? 5);

export interface StockAdjustmentData {
  variantId: string;
  quantity: number;
  reason: string;
  reference?: string;
}

export interface StockTransferData {
  fromLocation: string;
  toLocation: string;
  supplierId?: string;
  notes?: string;
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
}

export interface BulkStockUpdateData {
  updates: Array<{
    variantId: string;
    quantity: number;
    reason?: string;
  }>;
}

/**
 * Adjust stock for a variant
 */
export async function adjustStock(data: StockAdjustmentData) {
  const { variantId, quantity, reason, reference } = data;

  const updatedVariant = await prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { stockQty: true },
    });

    if (!variant) {
      throw new CustomError('Product variant not found', 404);
    }

    const newStock = variant.stockQty + quantity;

    if (newStock < 0) {
      throw new CustomError('Insufficient stock for adjustment', 400);
    }

    const result = await tx.productVariant.update({
      where: { id: variantId },
      data: { stockQty: newStock },
    });

    await tx.inventoryLog.create({
      data: {
        variantId,
        type: quantity > 0 ? 'stock_in' : 'stock_out',
        quantity: Math.abs(quantity),
        reason,
        reference,
      },
    });

    return result;
  });

  await evaluateVariantLowStock(variantId);

  return updatedVariant;
}

async function evaluateVariantLowStock(
  variantId: string,
  fallbackThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD
) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: {
        select: { title: true, sku: true },
      },
      reorderPoint: true,
      alerts: {
        where: { status: 'active' },
        select: { id: true },
      },
    },
  });

  if (!variant) {
    return { created: false, resolved: false };
  }

  const effectiveThreshold =
    variant.reorderPoint && variant.reorderPoint.isActive
      ? variant.reorderPoint.minQuantity
      : fallbackThreshold;

  const hasActiveAlert = variant.alerts.length > 0;

  if (variant.stockQty <= effectiveThreshold) {
    if (!hasActiveAlert) {
      await prisma.inventoryAlert.create({
        data: {
          variantId,
          currentStock: variant.stockQty,
          reorderPoint: effectiveThreshold,
          status: 'active',
          message: `Low stock alert: ${variant.product.title} has ${variant.stockQty} units remaining (reorder at ${effectiveThreshold})`,
        },
      });
      return { created: true, resolved: false };
    }
    return { created: false, resolved: false };
  }

  if (hasActiveAlert) {
    await prisma.inventoryAlert.updateMany({
      where: { variantId, status: 'active' },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
        currentStock: variant.stockQty,
      },
    });
    return { created: false, resolved: true };
  }

  return { created: false, resolved: false };
}

export async function setStockLevel(
  variantId: string,
  targetStock: number,
  reason: string = 'Manual adjustment',
  reference?: string
) {
  if (targetStock < 0) {
    throw new CustomError('Stock quantity cannot be negative', 400);
  }

  const existing = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { stockQty: true },
  });

  if (!existing) {
    throw new CustomError('Product variant not found', 404);
  }

  const delta = targetStock - existing.stockQty;

  if (delta !== 0) {
    await adjustStock({
      variantId,
      quantity: delta,
      reason,
      reference,
    });
  }

  await evaluateVariantLowStock(variantId);

  return prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          sku: true,
          slug: true,
          images: {
            select: { url: true, alt: true, isPrimary: true },
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
      },
      reorderPoint: true,
    },
  });
}

/**
 * Create stock transfer
 */
export async function createStockTransfer(data: StockTransferData) {
  const { fromLocation, toLocation, supplierId, notes, items } = data;

  // Validate all variants exist
  const variantIds = items.map(item => item.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        select: { title: true }
      }
    }
  });

  if (variants.length !== variantIds.length) {
    throw new CustomError('One or more product variants not found', 400);
  }

  // Check stock availability
  for (const item of items) {
    const variant = variants.find(v => v.id === item.variantId);
    if (variant && variant.stockQty < item.quantity) {
      throw new CustomError(`Insufficient stock for ${variant.product.title}`, 400);
    }
  }

  // Create transfer
  const transfer = await prisma.stockTransfer.create({
    data: {
      fromLocation,
      toLocation,
      supplierId,
      notes,
      items: {
        create: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      }
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: { title: true }
              }
            }
          }
        }
      }
    }
  });

  // Reduce stock from source location
  for (const item of items) {
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: {
        stockQty: {
          decrement: item.quantity
        }
      }
    });

    // Log inventory change
    await prisma.inventoryLog.create({
      data: {
        variantId: item.variantId,
        type: 'transfer_out',
        quantity: item.quantity,
        reason: `Transfer from ${fromLocation} to ${toLocation}`,
        reference: transfer.id
      }
    });
  }

  return transfer;
}

/**
 * Complete stock transfer (receive items)
 */
export async function completeStockTransfer(transferId: string, receivedItems: Array<{
  variantId: string;
  receivedQty: number;
}>) {
  const transfer = await prisma.stockTransfer.findUnique({
    where: { id: transferId },
    include: {
      items: {
        include: {
          variant: true
        }
      }
    }
  });

  if (!transfer) {
    throw new CustomError('Stock transfer not found', 404);
  }

  if (transfer.status !== 'pending') {
    throw new CustomError('Transfer is not in pending status', 400);
  }

  // Update received quantities
  for (const receivedItem of receivedItems) {
    const transferItem = transfer.items.find(item => item.variantId === receivedItem.variantId);
    if (!transferItem) {
      throw new CustomError(`Item not found in transfer: ${receivedItem.variantId}`, 400);
    }

    if (receivedItem.receivedQty > transferItem.quantity) {
      throw new CustomError(`Received quantity cannot exceed transferred quantity`, 400);
    }

    // Update transfer item
    await prisma.stockTransferItem.update({
      where: { id: transferItem.id },
      data: { receivedQty: receivedItem.receivedQty }
    });

    // Add stock to destination
    await prisma.productVariant.update({
      where: { id: receivedItem.variantId },
      data: {
        stockQty: {
          increment: receivedItem.receivedQty
        }
      }
    });

    // Log inventory change
    await prisma.inventoryLog.create({
      data: {
        variantId: receivedItem.variantId,
        type: 'transfer_in',
        quantity: receivedItem.receivedQty,
        reason: `Transfer received from ${transfer.fromLocation}`,
        reference: transferId
      }
    });
  }

  // Update transfer status
  const updatedTransfer = await prisma.stockTransfer.update({
    where: { id: transferId },
    data: { status: 'completed' },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: { title: true }
              }
            }
          }
        }
      }
    }
  });

  return updatedTransfer;
}

/**
 * Bulk stock update
 */
export async function bulkStockUpdate(data: BulkStockUpdateData) {
  const { updates } = data;

  const results = [];
  const errors = [];

  for (const update of updates) {
    try {
      const result = await adjustStock({
        variantId: update.variantId,
        quantity: update.quantity,
        reason: update.reason || 'Bulk stock update'
      });
      results.push({ variantId: update.variantId, success: true, result });
    } catch (error) {
      errors.push({ 
        variantId: update.variantId, 
        success: false, 
        error: error.message 
      });
    }
  }

  return {
    success: results.length > 0,
    results,
    errors,
    summary: {
      total: updates.length,
      successful: results.length,
      failed: errors.length
    }
  };
}

/**
 * Set reorder point for a variant
 */
export async function setReorderPoint(variantId: string, threshold: number) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId }
  });

  if (!variant) {
    throw new CustomError('Product variant not found', 404);
  }

  const reorderPoint = await prisma.reorderPoint.upsert({
    where: { variantId },
    update: { minQuantity: threshold, isActive: true },
    create: {
      variantId,
      minQuantity: threshold,
      isActive: true
    }
  });

  await evaluateVariantLowStock(variantId, threshold);

  return reorderPoint;
}

/**
 * Check reorder point and create alert if needed
 */
async function checkReorderPoint(variantId: string) {
  await evaluateVariantLowStock(variantId);
}

/**
 * Get low stock alerts
 */
export async function getLowStockAlerts() {
  const alerts = await prisma.inventoryAlert.findMany({
    where: { status: 'active' },
    include: {
      variant: {
        include: {
          product: {
            select: { title: true, sku: true }
          },
          reorderPoint: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return alerts;
}

/**
 * Get inventory logs for a variant
 */
export async function getInventoryLogs(
  variantId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [logs, total] = await prisma.$transaction([
    prisma.inventoryLog.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.inventoryLog.count({ where: { variantId } })
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Get inventory statistics
 */
export async function getInventoryStats() {
  const [
    totalVariants,
    lowStockVariants,
    outOfStockVariants,
    totalStockValue,
    recentMovements
  ] = await Promise.all([
    prisma.productVariant.count({ where: { isActive: true } }),
    prisma.productVariant.count({
      where: {
        isActive: true,
        stockQty: { lte: 10 }
      }
    }),
    prisma.productVariant.count({
      where: {
        isActive: true,
        stockQty: 0
      }
    }),
    prisma.productVariant.aggregate({
      where: { isActive: true },
      _sum: {
        stockQty: true
      }
    }),
    prisma.inventoryLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        variant: {
          include: {
            product: {
              select: { title: true }
            }
          }
        }
      }
    })
  ]);

  return {
    totalVariants,
    lowStockVariants,
    outOfStockVariants,
    totalStockValue: totalStockValue._sum.stockQty || 0,
    recentMovements
  };
}

/**
 * Export inventory data
 */
export async function exportInventoryData() {
  const variants = await prisma.productVariant.findMany({
    where: { isActive: true },
    include: {
      product: {
        select: {
          title: true,
          sku: true,
          category: true
        }
      },
      reorderPoint: true
    },
    orderBy: { product: { title: 'asc' } }
  });

  const csvData = variants.map(variant => ({
    'Product Title': variant.product.title,
    'Product SKU': variant.product.sku,
    'Variant SKU': variant.sku,
    'Category': variant.product.category,
    'Current Stock': variant.stockQty,
    'Reorder Point': variant.reorderPoint?.minQuantity ?? 0,
    'Price': variant.price,
    'Cost Price': variant.costPrice || 0,
    'Status': variant.isActive ? 'Active' : 'Inactive'
  }));

  return csvData;
}

export async function reconcileLowStockAlerts(
  defaultThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD
) {
  const variants = await prisma.productVariant.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  let created = 0;
  let resolved = 0;

  for (const variant of variants) {
    const result = await evaluateVariantLowStock(variant.id, defaultThreshold);
    if (result.created) {
      created += 1;
    }
    if (result.resolved) {
      resolved += 1;
    }
  }

  return {
    scanned: variants.length,
    created,
    resolved,
  };
}