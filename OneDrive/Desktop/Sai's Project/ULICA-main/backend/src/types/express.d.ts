/**
 * Express type extensions
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Extended Request with user info from auth middleware
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    [key: string]: unknown;
  };
}

/**
 * Typed middleware function
 */
export type Middleware = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Typed route handler
 */
export type RouteHandler = (
  req: Request | AuthRequest,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;

/**
 * Express Response type (re-export for convenience)
 */
export type ExpressResponse = Response;

