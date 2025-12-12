import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../services/loggerService';
import { monitoring } from '../services/monitoringService';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = async (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  let error = { ...err };
  error.message = err.message;

  // Get request context
  const requestId = req.headers['x-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const userId = (req as any).user?.id;
  
  const errorContext = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId,
    userId,
    body: req.body,
    query: req.query,
    params: req.params
  };

  // Log error with enhanced context
  await logger.error(
    `${err.name}: ${err.message}`,
    errorContext,
    userId,
    requestId,
    err
  );

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        error = new CustomError('Duplicate field value entered', 400);
        break;
      case 'P2014':
        error = new CustomError('Invalid ID', 400);
        break;
      case 'P2003':
        error = new CustomError('Invalid reference', 400);
        break;
      case 'P2025':
        error = new CustomError('Record not found', 404);
        break;
      default:
        error = new CustomError('Database error', 500);
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    // Include the actual Prisma error message for debugging
    const prismaMessage = err.message || 'Invalid data provided';
    error = new CustomError(
      process.env['NODE_ENV'] === 'development' 
        ? `Prisma validation error: ${prismaMessage}` 
        : 'Invalid data provided', 
      400
    );
    // In development, include more details
    if (process.env['NODE_ENV'] === 'development') {
      (error as any).prismaError = prismaMessage;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new CustomError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new CustomError('Token expired', 401);
  }

  // Validation errors (Joi)
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).details).map((val: any) => val.message).join(', ');
    error = new CustomError(message, 400);
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    if ((err as any).code === 'LIMIT_FILE_SIZE') {
      error = new CustomError('File too large', 400);
    } else if ((err as any).code === 'LIMIT_UNEXPECTED_FILE') {
      error = new CustomError('Unexpected file field', 400);
    } else {
      error = new CustomError('File upload error', 400);
    }
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Record error in monitoring
  monitoring.recordError(err, errorContext, userId, requestId);

  // Send alert for critical errors
  if (statusCode >= 500) {
    await monitoring.sendAlert('error', `Critical error: ${err.message}`, errorContext);
  }

  // Security event logging
  if (statusCode === 401 || statusCode === 403) {
    await logger.logSecurityEvent(`Unauthorized access attempt`, errorContext, requestId);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: message,
    requestId,
    ...(process.env['NODE_ENV'] === 'development' && { 
      stack: err.stack,
      context: errorContext,
      originalError: err.message
    })
  });
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found middleware
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Validation error helper
 */
export const validationError = (message: string, field?: string): CustomError => {
  const error = new CustomError(message, 400);
  if (field) {
    (error as any).field = field;
  }
  return error;
};

/**
 * Unauthorized error helper
 */
export const unauthorizedError = (message: string = 'Unauthorized'): CustomError => {
  return new CustomError(message, 401);
};

/**
 * Forbidden error helper
 */
export const forbiddenError = (message: string = 'Forbidden'): CustomError => {
  return new CustomError(message, 403);
};

/**
 * Not found error helper
 */
export const notFoundError = (resource: string = 'Resource'): CustomError => {
  return new CustomError(`${resource} not found`, 404);
};

/**
 * Conflict error helper
 */
export const conflictError = (message: string): CustomError => {
  return new CustomError(message, 409);
};

/**
 * Rate limit error helper
 */
export const rateLimitError = (message: string = 'Too many requests'): CustomError => {
  return new CustomError(message, 429);
};
