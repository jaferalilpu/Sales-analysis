import { z } from 'zod';

/**
 * Environment variable validation schema
 * Fails fast with clear error messages if required envs are missing
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5001'),
  HOST: z.string().default('0.0.0.0'),
  BACKEND_URL: z.string().url('BACKEND_URL must be a valid URL').default('https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app'),

  // CORS
  ALLOWED_ORIGINS: z.string().optional(),

  // Payment Gateways (optional - can be configured later)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  PHONEPE_MERCHANT_ID: z.string().optional(),
  PHONEPE_SALT_KEY: z.string().optional(),
  PHONEPE_SALT_INDEX: z.string().optional(),
  PHONEPE_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  // Shipping
  SHIPROCKET_EMAIL: z.string().email().optional(),
  SHIPROCKET_PASSWORD: z.string().optional(),
  SHIPROCKET_BASE_URL: z.string().url().optional(),
  SHIPROCKET_PICKUP_PINCODE: z.string().optional(),
  SHIPROCKET_PICKUP_LOCATION: z.string().optional(),
  SHIPROCKET_CHANNEL_ID: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FROM_NAME: z.string().optional(),
  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),

  // Security
  APP_ENCRYPTION_KEY: z.string().optional(),

  // AWS S3 (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_DOMAIN: z.string().url().optional(),

  // Redis (optional)
  REDIS_URL: z.string().url().optional(),

  // Analytics (optional)
  GOOGLE_ANALYTICS_ID: z.string().optional(),

  // Social Media (optional)
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  INSTAGRAM_APP_ID: z.string().optional(),
  INSTAGRAM_APP_SECRET: z.string().optional(),
  TWITTER_API_KEY: z.string().optional(),
  TWITTER_API_SECRET: z.string().optional(),
  TWITTER_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  TIKTOK_APP_ID: z.string().optional(),
  TIKTOK_APP_SECRET: z.string().optional(),
  TIKTOK_CLIENT_KEY: z.string().optional(),
  YOUTUBE_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),

  // Email Marketing (optional)
  MAILCHIMP_API_KEY: z.string().optional(),
  MAILCHIMP_BASE_URL: z.string().url().optional(),
  MAILCHIMP_LIST_ID: z.string().optional(),
  MAILCHIMP_FROM_NAME: z.string().optional(),
  MAILCHIMP_REPLY_TO: z.string().email().optional(),

  // Monitoring
  LOW_STOCK_THRESHOLD: z.string().default('5'),
  LOW_STOCK_MONITOR_ENABLED: z.string().default('true'),
  LOW_STOCK_MONITOR_INTERVAL_MINUTES: z.string().default('15'),
  DROP_STATUS_MONITOR_ENABLED: z.string().default('true'),
  DROP_STATUS_MONITOR_INTERVAL_MINUTES: z.string().default('60'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validate and return environment variables
 * This function should be called at application startup
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');
      console.error('❌ Environment validation failed:\n', missingVars);
      console.error('\n💡 Please check your .env file and ensure all required variables are set.');
      console.error('📝 See .env.example for reference.\n');
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Throws if validation hasn't been run
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error('Environment variables not validated. Call validateEnv() first.');
  }
  return validatedEnv;
}

