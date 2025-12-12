import * as express from 'express';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { logger, LogLevel } from '../services/loggerService';
import { monitoring } from '../services/monitoringService';
import { ExpressResponse, Middleware } from '../types/express';
import Joi from 'joi';

const router = express.Router();

// Admin middleware
const requireAdmin: Middleware = (req: AuthenticatedRequest, _res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new CustomError('Admin access required', 403);
  }
  next();
};

// Validation schemas
const getLogsSchema = {
  query: Joi.object({
    level: Joi.string().valid('ERROR', 'WARN', 'INFO', 'DEBUG').optional(),
    limit: Joi.number().min(1).max(1000).default(100),
    offset: Joi.number().min(0).default(0)
  })
};

/**
 * GET /api/admin/monitoring/health
 * Get system health status
 */
router.get('/health',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: ExpressResponse) => {
    try {
      const health = monitoring.getSystemHealth();
      
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Health check error', { error: errorMsg }).catch(() => {});
      throw new CustomError('Failed to get system health', 500);
    }
  })
);

/**
 * GET /api/admin/monitoring/metrics
 * Get performance and error metrics
 */
router.get('/metrics',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: ExpressResponse) => {
    try {
      const errorMetrics = monitoring.getErrorMetrics();
      const performanceMetrics = monitoring.getPerformanceMetrics();
      
      res.json({
        success: true,
        data: {
          errors: errorMetrics,
          performance: performanceMetrics
        }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Metrics error', { error: errorMsg }).catch(() => {});
      throw new CustomError('Failed to get monitoring metrics', 500);
    }
  })
);

/**
 * GET /api/admin/monitoring/logs
 * Get application logs
 */
router.get('/logs',
  authenticateToken,
  requireAdmin,
  validate(getLogsSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const { level, limit, offset } = req.query;
    
    try {
      const logs = await logger.getLogs(
        level as any,
        Number(limit),
        Number(offset)
      );
      
      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            limit: Number(limit),
            offset: Number(offset),
            total: logs.length
          }
        }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Logs error', { error: errorMsg }).catch(() => {});
      throw new CustomError('Failed to get logs', 500);
    }
  })
);

/**
 * POST /api/admin/monitoring/cleanup
 * Clean up old logs
 */
router.post('/cleanup',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: ExpressResponse) => {
    try {
      await logger.cleanOldLogs(30); // Keep 30 days of logs
      
      res.json({
        success: true,
        message: 'Log cleanup completed successfully'
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Log cleanup error', { error: errorMsg }).catch(() => {});
      throw new CustomError('Failed to clean up logs', 500);
    }
  })
);

/**
 * GET /api/admin/monitoring/alerts
 * Get recent alerts
 */
router.get('/alerts',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: ExpressResponse) => {
    try {
      // Get recent error logs as alerts
      const errorLogs = await logger.getLogs(LogLevel.ERROR, 50, 0);
      const warnLogs = await logger.getLogs(LogLevel.WARN, 50, 0);
      
      const alerts = [
        ...errorLogs.map(log => ({
          type: 'error',
          level: log.level,
          message: log.message,
          timestamp: log.timestamp,
          context: log.context
        })),
        ...warnLogs.map(log => ({
          type: 'warning',
          level: log.level,
          message: log.message,
          timestamp: log.timestamp,
          context: log.context
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json({
        success: true,
        data: {
          alerts: alerts.slice(0, 100), // Return last 100 alerts
          total: alerts.length
        }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Alerts error', { error: errorMsg }).catch(() => {});
      throw new CustomError('Failed to get alerts', 500);
    }
  })
);

/**
 * GET /api/admin/monitoring/dashboard
 * Get monitoring dashboard data
 */
router.get('/dashboard',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: ExpressResponse) => {
    try {
      const health = monitoring.getSystemHealth();
      const errorMetrics = monitoring.getErrorMetrics();
      const performanceMetrics = monitoring.getPerformanceMetrics();
      
      // Get recent logs for dashboard
      const recentLogs = await logger.getLogs(undefined, 20, 0);
      
      res.json({
        success: true,
        data: {
          health,
          errors: errorMetrics,
          performance: performanceMetrics,
          recentLogs: recentLogs.map(log => ({
            timestamp: log.timestamp,
            level: log.level,
            message: log.message,
            context: log.context
          }))
        }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Dashboard error', { error: errorMsg }).catch(() => {});
      throw new CustomError('Failed to get dashboard data', 500);
    }
  })
);

export default router;
