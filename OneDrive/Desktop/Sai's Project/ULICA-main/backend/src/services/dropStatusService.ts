import { PrismaClient } from '@prisma/client';
import { logger } from './loggerService';
import { ProductStatusService } from './productStatusService';

const prisma = new PrismaClient();

export class DropStatusService {
  /**
   * Update drop statuses based on current time
   * This should be called periodically (e.g., every hour via scheduled job)
   * 
   * Status flow: upcoming → live → ended → archived (immediately)
   */
  static async updateDropStatuses() {
    try {
      const now = new Date();
      
      // Update upcoming drops to live (when start date arrives)
      const liveResult = await prisma.drop.updateMany({
        where: {
          status: 'upcoming',
          startDate: { lte: now },
          endDate: { gte: now }
        },
        data: { status: 'live' }
      });

      // Update live drops to archived (when end date passes - archive immediately)
      const archivedResult = await prisma.drop.updateMany({
        where: {
          status: 'live',
          endDate: { lt: now }
        },
        data: { status: 'archived' }
      });

      // Also update any upcoming drops that somehow passed their end date
      const missedArchivedResult = await prisma.drop.updateMany({
        where: {
          status: 'upcoming',
          endDate: { lt: now }
        },
        data: { status: 'archived' }
      });

      // Also archive any drops that are still marked as "ended" (legacy support)
      const legacyArchivedResult = await prisma.drop.updateMany({
        where: {
          status: 'ended',
          endDate: { lt: now }
        },
        data: { status: 'archived' }
      });

      if (liveResult.count > 0 || archivedResult.count > 0 || missedArchivedResult.count > 0 || legacyArchivedResult.count > 0) {
        await logger.info(
          'DropStatusService: Updated drop statuses',
          {
            liveCount: liveResult.count,
            archivedCount: archivedResult.count + missedArchivedResult.count + legacyArchivedResult.count
          }
        );

        // Sync product status when drop statuses change
        try {
          await ProductStatusService.syncProductStatus();
        } catch (syncError) {
          // Log but don't fail the drop status update
          await logger.error('DropStatusService: Error syncing product status after drop update', {
            error: syncError instanceof Error ? syncError.message : String(syncError)
          });
        }
      }
    } catch (error) {
      await logger.error('DropStatusService: Error updating drop statuses', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get drops that are currently live
   */
  static async getLiveDrops() {
    return await prisma.drop.findMany({
      where: {
        status: 'live',
        isPublished: true
      },
      include: {
        dropProducts: {
          include: {
            product: {
              include: {
                images: true,
                variants: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Check if a product is part of any live drop
   */
  static async isProductInLiveDrop(productId: string): Promise<boolean> {
    const liveDrop = await prisma.drop.findFirst({
      where: {
        status: 'live',
        isPublished: true,
        dropProducts: {
          some: {
            productId
          }
        }
      }
    });

    return !!liveDrop;
  }

  /**
   * Get countdown timer data for upcoming drops
   */
  static async getUpcomingDropsWithCountdown() {
    const now = new Date();
    const upcomingDrops = await prisma.drop.findMany({
      where: {
        status: 'upcoming',
        isPublished: true,
        startDate: { gt: now }
      },
      include: {
        dropProducts: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  select: { url: true, alt: true }
                }
              }
            }
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    return upcomingDrops.map(drop => ({
      ...drop,
      countdown: {
        startDate: drop.startDate,
        endDate: drop.endDate,
        timeUntilStart: drop.startDate.getTime() - now.getTime(),
        timeUntilEnd: drop.endDate.getTime() - now.getTime()
      }
    }));
  }

  /**
   * Archive old ended drops (legacy method - now drops archive immediately)
   * This method is kept for backward compatibility but is no longer needed
   * since drops are archived immediately when they end
   */
  static async archiveOldDrops(_daysOld: number = 30) {
    // Drops are now archived immediately when they end, so this method
    // just ensures any legacy "ended" drops get archived
    const result = await prisma.drop.updateMany({
      where: {
        status: 'ended',
        endDate: { lt: new Date() }
      },
      data: { status: 'archived' }
    });

    if (result.count > 0) {
      await logger.info('DropStatusService: Archived legacy ended drops', { count: result.count });
    }

    return result.count;
  }
}
