import express from 'express';
import { getPerformanceMetrics, clearPerformanceLog } from '../middleware/performance';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { logger } from '../services/loggerService';

const router = express.Router();

// Get performance metrics
router.get('/metrics', authenticateToken, requireAdmin, (_req, res) => {
  try {
    const metrics = getPerformanceMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching performance metrics', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance metrics'
    });
  }
});

// Clear performance log
router.delete('/log', authenticateToken, requireAdmin, (_req, res) => {
  try {
    clearPerformanceLog();
    res.json({
      success: true,
      message: 'Performance log cleared successfully'
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error clearing performance log', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      error: 'Failed to clear performance log'
    });
  }
});

// Get system health
router.get('/health', (_req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        uptime: Math.round(uptime),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024) // MB
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error checking system health', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      error: 'Failed to check system health'
    });
  }
});

export default router;
