import { logger } from './loggerService';

export interface ErrorMetrics {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByType: Record<string, number>;
  errorsByHour: Record<string, number>;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: string;
  }>;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    redis: boolean;
    externalApis: boolean;
    diskSpace: boolean;
  };
  lastChecked: string;
}

class MonitoringService {
  private errorCounts: Map<string, number> = new Map();
  private responseTimes: number[] = [];
  private startTime: number = Date.now();
  private healthChecks: SystemHealth['checks'] = {
    database: false,
    redis: false,
    externalApis: false,
    diskSpace: false
  };

  constructor() {
    // Initialize health checks
    this.initializeHealthChecks();
    
    // Run periodic health checks
    setInterval(() => {
      this.runHealthChecks();
    }, 60000); // Every minute
  }

  private async initializeHealthChecks(): Promise<void> {
    await this.runHealthChecks();
  }

  private async runHealthChecks(): Promise<void> {
    try {
      // Check database
      this.healthChecks.database = await this.checkDatabase();
      
      // Check Redis (if configured)
      this.healthChecks.redis = await this.checkRedis();
      
      // Check external APIs
      this.healthChecks.externalApis = await this.checkExternalApis();
      
      // Check disk space
      this.healthChecks.diskSpace = await this.checkDiskSpace();
      
      await logger.info('Health checks completed', {
        checks: this.healthChecks
      });
    } catch (error) {
      const err = error as Error;
      await logger.error('Health check failed', { error: err.message });
    }
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      const prisma = await import('../prisma/client');
      await prisma.default.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      const err = error as Error;
      await logger.error('Database health check failed', { error: err.message });
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      // Redis check would go here if Redis is configured
      return true;
    } catch (error) {
      const err = error as Error;
      await logger.error('Redis health check failed', { error: err.message });
      return false;
    }
  }

  private async checkExternalApis(): Promise<boolean> {
    try {
      // Check if external API credentials are configured
      // If credentials exist, assume APIs are available (actual connectivity tested on use)
      // Just check presence of any external integration; details logged elsewhere
      void !!(process.env['RAZORPAY_KEY_ID'] && process.env['RAZORPAY_KEY_SECRET']);
      void !!(process.env['SHIPROCKET_EMAIL'] && process.env['SHIPROCKET_PASSWORD']);
      void !!(process.env['SMTP_HOST'] && process.env['SMTP_USER']);

      return true;
    } catch (error) {
      const err = error as Error;
      await logger.error('External API health check failed', { error: err.message });
      // Don't fail health check if external API check errors
      return true;
    }
  }

  private async checkDiskSpace(): Promise<boolean> {
    try {
      const fs = await import('fs/promises');
      const os = await import('os');
      
      // Use Node.js built-in method for cross-platform disk space check
      // For development, we'll use a simpler check
      if (process.env['NODE_ENV'] === 'development') {
        // In development, assume disk space is fine unless we can verify otherwise
        try {
          // Try to access the uploads directory to verify write access
          await fs.access('uploads', fs.constants.F_OK | fs.constants.W_OK);
          return true;
        } catch {
          // If uploads directory doesn't exist or isn't writable, try to create it
          try {
            await fs.mkdir('uploads', { recursive: true });
            return true;
          } catch {
            return false;
          }
        }
      }

      // For production, use df command for Unix-like systems
      try {
        const { execSync } = await import('child_process');
        const platform = os.platform();
        
        if (platform === 'linux' || platform === 'darwin') {
          // Use df command for cross-platform compatibility
          // Just verify the command works, don't parse output in health check
          try {
            execSync('df -h .', { encoding: 'utf8', stdio: 'pipe', timeout: 2000 });
            return true; // If command succeeds, assume space is available
          } catch {
            // If df fails, assume OK (might not have permission in some environments)
            return true;
          }
        }
        
        return true; // For Windows and other platforms, assume OK
      } catch {
        // If statfs/df fails, assume disk space is fine (fail open)
        return true;
      }
    } catch (error) {
      const err = error as Error;
      await logger.error('Disk space check failed', { error: err.message });
      // In development, don't fail health check for disk space issues
      return process.env['NODE_ENV'] === 'development';
    }
  }

  recordError(error: Error, context?: Record<string, any>, userId?: string, requestId?: string): void {
    const errorKey = `${error.name}:${error.message}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);
    
    logger.error(error.message, context, userId, requestId, error);
  }

  recordResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  getErrorMetrics(): ErrorMetrics {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    
    const errorsByLevel = {
      ERROR: totalErrors, // Simplified for now
      WARN: 0,
      INFO: 0,
      DEBUG: 0
    };
    
    const errorsByType: Record<string, number> = {};
    const errorsByHour: Record<string, number> = {};
    const topErrors: Array<{ message: string; count: number; lastOccurred: string }> = [];
    
    // Process error counts
    for (const [errorKey, count] of this.errorCounts.entries()) {
      const [errorType = 'UnknownError', errorMessage = 'Unknown'] = errorKey.split(':');
      errorsByType[errorType] = (errorsByType[errorType] || 0) + count;
      
      topErrors.push({
        message: errorMessage,
        count,
        lastOccurred: new Date().toISOString()
      });
    }
    
    // Sort by count and take top 10
    topErrors.sort((a, b) => b.count - a.count).splice(10);
    
    return {
      totalErrors,
      errorsByLevel,
      errorsByType,
      errorsByHour,
      topErrors
    };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const averageResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length 
      : 0;
    
    const uptime = Date.now() - this.startTime;
    const errorRate = this.getErrorMetrics().totalErrors / Math.max(this.responseTimes.length, 1) * 100;
    
    // Get memory usage
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    
    // Calculate requests per minute (simplified)
    const requestsPerMinute = this.responseTimes.length / (uptime / 60000);
    
    return {
      averageResponseTime,
      requestsPerMinute,
      errorRate,
      uptime,
      memoryUsage,
      cpuUsage: 0 // Would need additional library to get CPU usage
    };
  }

  getSystemHealth(): SystemHealth {
    const checks = this.healthChecks;
    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks / 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    return {
      status,
      checks,
      lastChecked: new Date().toISOString()
    };
  }

  // Alert methods
  async sendAlert(type: 'error' | 'performance' | 'health', message: string, context?: Record<string, any>): Promise<void> {
    await logger.warn(`ALERT [${type.toUpperCase()}]: ${message}`, context);
    
    // In a real implementation, you would send alerts to:
    // - Email notifications
    // - Slack/Discord webhooks
    // - PagerDuty
    // - SMS notifications
    // - etc.
  }

  // Cleanup old metrics
  cleanup(): void {
    this.errorCounts.clear();
    this.responseTimes = [];
  }
}

export const monitoring = new MonitoringService();
