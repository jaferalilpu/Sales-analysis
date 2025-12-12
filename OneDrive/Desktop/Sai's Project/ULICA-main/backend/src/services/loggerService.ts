import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  stack?: string;
}

class LoggerService {
  private logDir: string;
  private maxFileSize: number;
  private maxFiles: number;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.maxFiles = 5;
    
    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const logLine = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.userId && { userId: entry.userId }),
      ...(entry.requestId && { requestId: entry.requestId }),
      ...(entry.stack && { stack: entry.stack })
    };
    
    return JSON.stringify(logLine) + '\n';
  }

  private getLogFileName(level: LogLevel): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${level.toLowerCase()}-${date}.log`);
  }

  private async rotateLogFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.promises.stat(filePath);
      if (stats.size > this.maxFileSize) {
        // Rotate files
        for (let i = this.maxFiles - 1; i > 0; i--) {
          const oldFile = `${filePath}.${i}`;
          const newFile = `${filePath}.${i + 1}`;
          if (fs.existsSync(oldFile)) {
            await fs.promises.rename(oldFile, newFile);
          }
        }
        
        // Move current file to .1
        await fs.promises.rename(filePath, `${filePath}.1`);
      }
    } catch (error) {
      // Silently fail - logging service shouldn't throw errors
      // Error details are already in error object
    }
  }

  private async writeToFile(level: LogLevel, entry: LogEntry): Promise<void> {
    try {
      const filePath = this.getLogFileName(level);
      const logLine = this.formatLogEntry(entry);
      
      await fs.promises.appendFile(filePath, logLine);
      
      // Check if file needs rotation
      await this.rotateLogFile(filePath);
    } catch (error) {
      // Silently fail - logging service shouldn't throw errors
      // Error details are already in error object
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string,
    stack?: string
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) entry.context = context;
    if (userId) entry.userId = userId;
    if (requestId) entry.requestId = requestId;
    if (stack) entry.stack = stack;

    return entry;
  }

  async error(message: string, context?: Record<string, any>, userId?: string, requestId?: string, error?: Error): Promise<void> {
    const entry = this.createLogEntry(
      LogLevel.ERROR,
      message,
      context,
      userId,
      requestId,
      error?.stack
    );
    
    console.error(`[${entry.timestamp}] ${entry.level}: ${entry.message}`, entry.context);
    await this.writeToFile(LogLevel.ERROR, entry);
  }

  async warn(message: string, context?: Record<string, any>, userId?: string, requestId?: string): Promise<void> {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, userId, requestId);
    
    console.warn(`[${entry.timestamp}] ${entry.level}: ${entry.message}`, entry.context);
    await this.writeToFile(LogLevel.WARN, entry);
  }

  async info(message: string, context?: Record<string, any>, userId?: string, requestId?: string): Promise<void> {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, userId, requestId);
    
    console.log(`[${entry.timestamp}] ${entry.level}: ${entry.message}`, entry.context);
    await this.writeToFile(LogLevel.INFO, entry);
  }

  async debug(message: string, context?: Record<string, any>, userId?: string, requestId?: string): Promise<void> {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, userId, requestId);
    
    if (process.env['NODE_ENV'] === 'development') {
      console.debug(`[${entry.timestamp}] ${entry.level}: ${entry.message}`, entry.context);
    }
    await this.writeToFile(LogLevel.DEBUG, entry);
  }

  // Business-specific logging methods
  async logUserAction(action: string, userId: string, context?: Record<string, any>, requestId?: string): Promise<void> {
    await this.info(`User action: ${action}`, { action, ...context }, userId, requestId);
  }

  async logPaymentEvent(event: string, orderId: string, amount: number, context?: Record<string, any>, requestId?: string): Promise<void> {
    await this.info(`Payment event: ${event}`, { event, orderId, amount, ...context }, undefined, requestId);
  }

  async logOrderEvent(event: string, orderId: string, context?: Record<string, any>, requestId?: string): Promise<void> {
    await this.info(`Order event: ${event}`, { event, orderId, ...context }, undefined, requestId);
  }

  async logSecurityEvent(event: string, context?: Record<string, any>, requestId?: string): Promise<void> {
    await this.warn(`Security event: ${event}`, { event, ...context }, undefined, requestId);
  }

  async logPerformance(operation: string, duration: number, context?: Record<string, any>, requestId?: string): Promise<void> {
    await this.info(`Performance: ${operation}`, { operation, duration, ...context }, undefined, requestId);
  }

  // Get logs for admin panel
  async getLogs(level?: LogLevel, limit: number = 100, offset: number = 0): Promise<LogEntry[]> {
    try {
      const logs: LogEntry[] = [];
      const files = fs.readdirSync(this.logDir);
      
      // Filter files by level if specified
      const relevantFiles = files.filter(file => {
        if (level) {
          return file.startsWith(level.toLowerCase());
        }
        return file.endsWith('.log');
      }).sort().reverse(); // Most recent first
      
      for (const file of relevantFiles) {
        if (logs.length >= limit) break;
        
        const filePath = path.join(this.logDir, file);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (logs.length >= limit) break;
          
          try {
            const logEntry = JSON.parse(line) as LogEntry;
            logs.push(logEntry);
          } catch (error) {
            // Skip malformed log entries
            continue;
          }
        }
      }
      
      return logs.slice(offset, offset + limit);
    } catch (error) {
      // Error reading logs - return empty array
      return [];
    }
  }

  // Clean old logs
  async cleanOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      for (const file of files) {
        const filePath = path.join(this.logDir, file);
        const stats = await fs.promises.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.promises.unlink(filePath);
          // Old log file deleted
        }
      }
    } catch (error) {
      // Silently fail - logging service shouldn't throw errors
    }
  }
}

export const logger = new LoggerService();
