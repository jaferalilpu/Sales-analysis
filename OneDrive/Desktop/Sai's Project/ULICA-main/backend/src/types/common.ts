/**
 * Common utility types for backend
 */

/**
 * Type guard helper for error handling
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely extract error message
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Extract the type from a Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

