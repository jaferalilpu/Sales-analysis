import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/loggerService';

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  method: string;
  url: string;
  statusCode?: number;
  memoryUsage?: NodeJS.MemoryUsage;
}

const performanceLog: PerformanceMetrics[] = [];
const MAX_LOG_SIZE = 1000; // Keep only last 1000 requests

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  // Store performance data in request
  (req as any).performance = {
    startTime,
    startMemory
  };

  // Override res.end to capture response metrics
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    
    const metrics: PerformanceMetrics = {
      startTime,
      endTime,
      duration,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
        arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
      }
    };

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.url} - ${duration}ms`, { method: req.method, url: req.url, duration }).catch(() => {});
    }

    // Log high memory usage (> 50MB)
    if (metrics.memoryUsage && metrics.memoryUsage.heapUsed > 50 * 1024 * 1024) {
      const memoryMB = Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024);
      logger.warn(`High memory usage detected: ${req.method} ${req.url} - ${memoryMB}MB`, { method: req.method, url: req.url, memoryMB }).catch(() => {});
    }

    // Store metrics
    performanceLog.push(metrics);
    
    // Keep only recent logs
    if (performanceLog.length > MAX_LOG_SIZE) {
      performanceLog.shift();
    }

    // Call original end with proper parameters
    if (typeof chunk === 'function') {
      return originalEnd(chunk);
    } else if (typeof encoding === 'function') {
      return originalEnd(chunk, encoding);
    } else {
      return originalEnd(chunk, encoding, cb);
    }
  };

  next();
};

export const getPerformanceMetrics = () => {
  const now = Date.now();
  const lastMinute = performanceLog.filter(log => now - log.startTime < 60000);
  const lastHour = performanceLog.filter(log => now - log.startTime < 3600000);
  
  const avgResponseTime = performanceLog.length > 0 
    ? performanceLog.reduce((sum, log) => sum + (log.duration || 0), 0) / performanceLog.length
    : 0;

  const slowRequests = performanceLog.filter(log => (log.duration || 0) > 1000);
  const errorRequests = performanceLog.filter(log => (log.statusCode || 0) >= 400);
  
  const memoryUsage = process.memoryUsage();
  
  return {
    totalRequests: performanceLog.length,
    requestsLastMinute: lastMinute.length,
    requestsLastHour: lastHour.length,
    averageResponseTime: Math.round(avgResponseTime),
    slowRequests: slowRequests.length,
    errorRequests: errorRequests.length,
    errorRate: performanceLog.length > 0 ? (errorRequests.length / performanceLog.length * 100).toFixed(2) : '0.00',
    memoryUsage: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024) // MB
    },
    recentSlowRequests: slowRequests.slice(-10).map(log => ({
      method: log.method,
      url: log.url,
      duration: log.duration,
      statusCode: log.statusCode,
      timestamp: new Date(log.startTime).toISOString()
    })),
    recentErrors: errorRequests.slice(-10).map(log => ({
      method: log.method,
      url: log.url,
      statusCode: log.statusCode,
      duration: log.duration,
      timestamp: new Date(log.startTime).toISOString()
    }))
  };
};

export const clearPerformanceLog = () => {
  performanceLog.length = 0;
};
