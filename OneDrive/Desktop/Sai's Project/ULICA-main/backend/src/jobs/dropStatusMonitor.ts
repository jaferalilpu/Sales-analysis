import { DropStatusService } from '../services/dropStatusService';
import { logger } from '../services/loggerService';

const MONITOR_ENABLED = (process.env['DROP_STATUS_MONITOR_ENABLED'] ?? 'true') !== 'false';
const INTERVAL_MINUTES = Number(process.env['DROP_STATUS_MONITOR_INTERVAL_MINUTES'] ?? '60'); // Default: every hour

let timer: NodeJS.Timeout | null = null;

async function runDropStatusUpdate() {
  try {
    // Update drop statuses (upcoming → live → archived immediately when ended)
    await DropStatusService.updateDropStatuses();
    
    // Archive any legacy "ended" drops (for backward compatibility)
    await DropStatusService.archiveOldDrops();
    
    logger.info('Drop statuses updated (drops archive immediately when ended)').catch(() => {});
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Failed to update drop statuses', { error: errorMsg }).catch(() => {});
  }
}

export function startDropStatusMonitor() {
  if (!MONITOR_ENABLED) {
    logger.info('Drop status monitor disabled via DROP_STATUS_MONITOR_ENABLED=false').catch(() => {});
    return;
  }

  const intervalMs = Math.max(INTERVAL_MINUTES, 1) * 60 * 1000;

  // Run immediately on startup
  runDropStatusUpdate();
  
  // Then run periodically
  timer = setInterval(runDropStatusUpdate, intervalMs);

  logger.info(`Drop status monitor started (interval=${INTERVAL_MINUTES} minute${INTERVAL_MINUTES === 1 ? '' : 's'})`).catch(() => {});
}

export function stopDropStatusMonitor() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    logger.info('Drop status monitor stopped').catch(() => {});
  }
}

