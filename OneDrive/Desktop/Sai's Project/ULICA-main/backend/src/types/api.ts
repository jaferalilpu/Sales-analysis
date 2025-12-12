/**
 * Shared API response types for backend
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

