import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { logger } from '../services/loggerService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Fallback to httpOnly cookie if no header token
    if (!token && (req as any).cookies?.accessToken) {
      token = (req as any).cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Optionally verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true, phone: true }
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      ...(user.name ? { name: user.name } : {}),
      ...(user.phone ? { phone: user.phone } : {})
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Auth middleware error', { error: errorMsg }).catch(() => {});
    res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Middleware to require specific role access
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware for admin-only access
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware for admin and merchandise roles
 */
export const requireMerchAdmin = requireRole(['admin', 'merch']);

/**
 * Middleware for fulfillment roles
 */
export const requireFulfillment = requireRole(['admin', 'fulfillment']);

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(' ')[1];

    // Fallback to httpOnly cookie if no header token
    if (!token && (req as any).cookies?.accessToken) {
      token = (req as any).cookies.accessToken;
    }

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      next();
      return;
    }

    const payload = jwt.verify(token, jwtSecret) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, phone: true, isActive: true }
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        ...(user.firstName && user.lastName && { name: `${user.firstName} ${user.lastName}` }),
        ...(user.phone && { phone: user.phone })
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    next();
  }
};

/**
 * Generate JWT token
 */
export const generateToken = (user: { id: string; email: string; role: string }): string => {
  const jwtSecret = process.env['JWT_SECRET'];
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    { expiresIn: '24h' }
  );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (user: { id: string; email: string }): string => {
  const jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'];
  if (!jwtRefreshSecret) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    jwtRefreshSecret,
    { expiresIn: '7d' }
  );
};
