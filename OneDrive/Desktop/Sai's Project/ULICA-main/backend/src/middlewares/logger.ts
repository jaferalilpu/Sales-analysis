import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../services/loggerService';

/**
 * Enhanced request logging middleware with request IDs
 * Logs all requests with correlation IDs for tracing
 */
export const requestLogger = async (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Generate or use existing request ID
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  const userId = (req as any).user?.id;
  
  // Log request start
  await logger.info(
    `Request: ${req.method} ${req.url}`,
    {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      query: req.query,
      params: req.params,
    },
    userId,
    requestId
  );
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log response (async, don't await to avoid blocking)
    logger.info(
      `Response: ${req.method} ${req.url} - ${statusCode}`,
      {
        method: req.method,
        url: req.url,
        statusCode,
        duration,
        contentLength: res.get('Content-Length'),
      },
      userId,
      requestId
    ).catch(() => {
      // Silently fail logging to avoid breaking request flow
    });
    
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
};
