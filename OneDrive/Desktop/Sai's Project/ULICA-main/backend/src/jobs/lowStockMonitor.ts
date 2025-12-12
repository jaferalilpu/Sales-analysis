import { reconcileLowStockAlerts } from '../services/inventoryService';
import { logger } from '../services/loggerService';

const MONITOR_ENABLED = (process.env['LOW_STOCK_MONITOR_ENABLED'] ?? 'true') !== 'false';
const INTERVAL_MINUTES = Number(process.env['LOW_STOCK_MONITOR_INTERVAL_MINUTES'] ?? '15');
const DEFAULT_THRESHOLD = Number(process.env['LOW_STOCK_THRESHOLD'] ?? '5');

let timer: NodeJS.Timeout | null = null;

async function runLowStockScan() {
  try {
    const result = await reconcileLowStockAlerts(DEFAULT_THRESHOLD);
    if (result.created > 0 || result.resolved > 0) {
      logger.info('Low stock alerts reconciled', {
        scanned: result.scanned,
        created: result.created,
        resolved: result.resolved
      }).catch(() => {});
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Failed to reconcile low stock alerts', { error: errorMsg }).catch(() => {});
  }
}

export function startLowStockMonitor() {
  if (!MONITOR_ENABLED) {
    logger.info('Low stock monitor disabled via LOW_STOCK_MONITOR_ENABLED=false').catch(() => {});
    return;
  }

  const intervalMs = Math.max(INTERVAL_MINUTES, 1) * 60 * 1000;

  runLowStockScan();
  timer = setInterval(runLowStockScan, intervalMs);

  logger.info(`Low stock monitor started (interval=${INTERVAL_MINUTES} minute${INTERVAL_MINUTES === 1 ? '' : 's'}, threshold=${DEFAULT_THRESHOLD})`).catch(() => {});
}

export function stopLowStockMonitor() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

