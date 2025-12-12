import { ProductStatusService } from '../services/productStatusService';
import { logger } from '../services/loggerService';

const MONITOR_ENABLED = (process.env['PRODUCT_STATUS_MONITOR_ENABLED'] ?? 'true') !== 'false';
const INTERVAL_MINUTES = Number(process.env['PRODUCT_STATUS_MONITOR_INTERVAL_MINUTES'] ?? '10'); // Default: every 10 minutes

let timer: NodeJS.Timeout | null = null;

async function runProductStatusSync() {
  try {
    // Sync product isActive status based on drop status
    const result = await ProductStatusService.syncProductStatus();
    
    logger.info('Product status synced', {
      activeProducts: result.activeCount,
      inactiveProducts: result.inactiveCount,
      totalProducts: result.totalCount
    }).catch(() => {});
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Failed to sync product status', { error: errorMsg }).catch(() => {});
  }
}

export function startProductStatusMonitor() {
  if (!MONITOR_ENABLED) {
    logger.info('Product status monitor disabled via PRODUCT_STATUS_MONITOR_ENABLED=false').catch(() => {});
    return;
  }

  const intervalMs = Math.max(INTERVAL_MINUTES, 1) * 60 * 1000;

  // Run immediately on startup to sync initial status
  runProductStatusSync();
  
  // Then run periodically
  timer = setInterval(runProductStatusSync, intervalMs);

  logger.info(`Product status monitor started (interval=${INTERVAL_MINUTES} minute${INTERVAL_MINUTES === 1 ? '' : 's'})`).catch(() => {});
}

export function stopProductStatusMonitor() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    logger.info('Product status monitor stopped').catch(() => {});
  }
}
