import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../services/loggerService';

/**
 * Sanitize input to prevent XSS attacks
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * Validate request body
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return next();
};

/**
 * Common validation rules
 */
export const commonValidations = {
  email: body('email').isEmail().normalizeEmail(),
  password: body('password').isLength({ min: 6 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  name: body('name').isLength({ min: 2, max: 100 }).trim().escape(),
  phone: body('phone').optional().isMobilePhone('any'),
  id: body('id').isUUID(),
};

/**
 * Prevent SQL injection by validating input
 */
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
    /(\b(OR|AND)\s+1\s*=\s*1)/i,
    /(\b(OR|AND)\s+0\s*=\s*0)/i,
    /(\bUNION\s+SELECT\b)/i,
    /(\bDROP\s+TABLE\b)/i,
    /(\bDELETE\s+FROM\b)/i,
    /(\bINSERT\s+INTO\b)/i,
    /(\bUPDATE\s+SET\b)/i,
  ];

  const checkInput = (obj: any, path: string = ''): boolean => {
    if (typeof obj === 'string') {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(obj)) {
          logger.warn(`Potential SQL injection attempt detected in ${path}`, { path, input: obj.substring(0, 100) }).catch(() => {});
          return false;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (!checkInput(obj[key], `${path}.${key}`)) {
          return false;
        }
      }
    }
    return true;
  };

  if (!checkInput(req.body, 'body') || !checkInput(req.query, 'query') || !checkInput(req.params, 'params')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  return next();
};
