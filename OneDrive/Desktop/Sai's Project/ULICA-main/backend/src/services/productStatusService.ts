import prisma from '../prisma/client';
import { logger } from './loggerService';

export class ProductStatusService {
  /**
   * Sync product isActive status based on drop status
   * Products are active only if they're in a published, live drop within date range
   * 
   * This should be called:
   * - When drop status changes (upcoming → live, live → archived)
   * - When products are added/removed from drops
   * - Periodically via scheduled job (every 5-10 minutes)
   */
  static async syncProductStatus() {
    try {
      const now = new Date();
      
      // Find all products that are in live drops
      const productsInLiveDrops = await prisma.product.findMany({
        where: {
          dropProducts: {
            some: {
              drop: {
                isPublished: true,
                status: 'live',
                startDate: { lte: now },
                endDate: { gte: now }
              }
            }
          }
        },
        select: {
          id: true
        }
      });

      const activeProductIds = productsInLiveDrops.map(p => p.id);

      // Activate products that are in live drops
      if (activeProductIds.length > 0) {
        const activateResult = await prisma.product.updateMany({
          where: {
            id: { in: activeProductIds },
            isActive: false // Only update those that are currently inactive
          },
          data: {
            isActive: true
          }
        });

        if (activateResult.count > 0) {
          await logger.info('ProductStatusService: Activated products', {
            count: activateResult.count,
            productIds: activeProductIds.slice(0, 10) // Log first 10 IDs
          });
        }
      }

      // Deactivate products that are NOT in any live drop
      // Get all product IDs
      const allProducts = await prisma.product.findMany({
        select: { id: true }
      });

      const allProductIds = allProducts.map(p => p.id);
      const inactiveProductIds = allProductIds.filter(id => !activeProductIds.includes(id));

      if (inactiveProductIds.length > 0) {
        const deactivateResult = await prisma.product.updateMany({
          where: {
            id: { in: inactiveProductIds },
            isActive: true // Only update those that are currently active
          },
          data: {
            isActive: false
          }
        });

        if (deactivateResult.count > 0) {
          await logger.info('ProductStatusService: Deactivated products', {
            count: deactivateResult.count
          });
        }
      }

      await logger.info('ProductStatusService: Sync completed', {
        activeProducts: activeProductIds.length,
        inactiveProducts: inactiveProductIds.length,
        totalProducts: allProductIds.length
      });

      return {
        success: true,
        activeCount: activeProductIds.length,
        inactiveCount: inactiveProductIds.length,
        totalCount: allProductIds.length
      };
    } catch (error) {
      await logger.error('ProductStatusService: Error syncing product status', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Sync status for specific products (when products are added/removed from drops)
   * More efficient than syncing all products
   */
  static async syncProductStatusForProducts(productIds: string[]) {
    try {
      // Handle empty array
      if (!productIds || productIds.length === 0) {
        return {
          success: true,
          activated: 0,
          deactivated: 0
        };
      }

      const now = new Date();

      // Check which of these products are in live drops
      const productsInLiveDrops = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          dropProducts: {
            some: {
              drop: {
                isPublished: true,
                status: 'live',
                startDate: { lte: now },
                endDate: { gte: now }
              }
            }
          }
        },
        select: {
          id: true
        }
      });

      const activeProductIds = productsInLiveDrops.map(p => p.id);
      const inactiveProductIds = productIds.filter(id => !activeProductIds.includes(id));

      // Activate products in live drops
      if (activeProductIds.length > 0) {
        await prisma.product.updateMany({
          where: {
            id: { in: activeProductIds }
          },
          data: {
            isActive: true
          }
        });
      }

      // Deactivate products not in live drops
      if (inactiveProductIds.length > 0) {
        await prisma.product.updateMany({
          where: {
            id: { in: inactiveProductIds }
          },
          data: {
            isActive: false
          }
        });
      }

      await logger.info('ProductStatusService: Synced specific products', {
        productIds: productIds.length,
        activated: activeProductIds.length,
        deactivated: inactiveProductIds.length
      });

      return {
        success: true,
        activated: activeProductIds.length,
        deactivated: inactiveProductIds.length
      };
    } catch (error) {
      await logger.error('ProductStatusService: Error syncing specific products', {
        error: error instanceof Error ? error.message : String(error),
        productIds
      });
      throw error;
    }
  }

  /**
   * Sync status for products in a specific drop (when drop status changes)
   */
  static async syncProductStatusForDrop(dropId: string) {
    try {
      // Get all products in this drop
      const dropProducts = await prisma.dropProduct.findMany({
        where: {
          dropId
        },
        select: {
          productId: true
        }
      });

      const productIds = dropProducts.map(dp => dp.productId);

      if (productIds.length === 0) {
        return { success: true, message: 'No products in drop' };
      }

      // Sync status for these products
      return await this.syncProductStatusForProducts(productIds);
    } catch (error) {
      await logger.error('ProductStatusService: Error syncing products for drop', {
        error: error instanceof Error ? error.message : String(error),
        dropId
      });
      throw error;
    }
  }
}
