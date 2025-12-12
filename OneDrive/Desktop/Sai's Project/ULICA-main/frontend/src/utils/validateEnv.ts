/**
 * Frontend environment variable validation
 * Next.js automatically loads .env.local, but we validate required vars at runtime
 */

const requiredEnvVars = {
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BACKEND_URL?.replace(':5001', ':3000') || 'https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app',
};

/**
 * Validate required environment variables
 * Should be called in a client component or during app initialization
 */
export function validateFrontendEnv(): void {
  const missing: string[] = [];

  if (!requiredEnvVars.NEXT_PUBLIC_BACKEND_URL) {
    missing.push('NEXT_PUBLIC_BACKEND_URL');
  }

  if (missing.length > 0) {
    if (typeof window !== 'undefined') {
      console.error(
        `❌ Missing required environment variables: ${missing.join(', ')}\n` +
        '💡 Please check your frontend/.env.local file.\n' +
        '📝 See .env.example for reference.'
      );
    } else {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your frontend/.env.local file.'
      );
    }
  }
}

/**
 * Get validated environment variables
 */
export function getFrontendEnv() {
  validateFrontendEnv();
  return requiredEnvVars;
}

