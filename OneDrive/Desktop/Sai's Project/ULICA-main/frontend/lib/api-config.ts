/**
 * Centralized API configuration
 * Ensures consistent environment variable usage across the application
 */

/**
 * Get the backend API URL
 * Priority: NEXT_PUBLIC_BACKEND_URL > NEXT_PUBLIC_API_URL > BACKEND_URL > localhost fallback
 */
export function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: Use NEXT_PUBLIC_ prefixed variables
    return (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app'
    );
  } else {
    // Server-side: Can use both NEXT_PUBLIC_ and regular variables
    return (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_URL ||
      'https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app'
    );
  }
}

/**
 * Get the frontend URL
 */
export function getFrontendUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.FRONTEND_URL ||
    'https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app'
  );
}

// Export constants for convenience
export const BACKEND_URL = getBackendUrl();
export const FRONTEND_URL = getFrontendUrl();

