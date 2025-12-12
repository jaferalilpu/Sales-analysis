import 'dotenv/config';
import { validateEnv } from './utils/validateEnv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/logger';
import { performanceMiddleware } from './middleware/performance';
import { logger } from './services/loggerService';
import prisma from './prisma/client';

// Validate environment variables on startup - fail fast if required vars are missing
validateEnv();
import { startLowStockMonitor, stopLowStockMonitor } from './jobs/lowStockMonitor';
import { startEmailRetryWorker, stopEmailRetryWorker } from './jobs/emailRetryWorker';
import { startDropStatusMonitor, stopDropStatusMonitor } from './jobs/dropStatusMonitor';
import { startProductStatusMonitor, stopProductStatusMonitor } from './jobs/productStatusMonitor';

// Import routes
import authRoutes from './routes/auth';
import productsRoutes from './routes/simple-products';
import adminRoutes from './routes/admin';
import ordersRoutes from './routes/orders';
import checkoutRoutes from './routes/checkout';
import paymentsRoutes from './routes/payments';
import webhooksRoutes from './routes/webhooks';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import addressesRoutes from './routes/addresses';
import reviewsRoutes from './routes/reviews';
import couponsRoutes from './routes/coupons';
import uploadRoutes from './routes/upload';
import trackingRoutes from './routes/tracking';
import analyticsRoutes from './routes/analytics';
import monitoringRoutes from './routes/monitoring';
import inventoryRoutes from './routes/inventory';
import emailMarketingRoutes from './routes/emailMarketing';
import socialMediaRoutes from './routes/socialMedia';
import reportsRoutes from './routes/reports';
import settingsRoutes from './routes/settings';
import referralsRoutes from './routes/referrals';
import skuRoutes from './routes/sku';
import fulfillmentRoutes from './routes/fulfillment';
import supportRoutes from './routes/support';
import abandonedCartRoutes from './routes/abandonedCart';
import supplierRoutes from './routes/suppliers';
import dropsRoutes from './routes/drops';
import shiprocketRoutes from './routes/shiprocket';
import emailLogsRoutes from './routes/emailLogs';
import customersRoutes from './routes/customers';
import contactRoutes from './routes/contact';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      message: 'Rate limit exceeded'
    });
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs (increased for development)
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later.',
      message: 'Rate limit exceeded'
    });
  }
});

// CORS - Support multiple origins with validation
const allowedOrigins = process.env['ALLOWED_ORIGINS']
  ? process.env['ALLOWED_ORIGINS'].split(',').map((origin: string) => origin.trim())
  : ['https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app', 'http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) in development
    if (!origin && process.env['NODE_ENV'] !== 'production') {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Cookie parser (must be before body parsing)
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting (excluding auth routes which have their own limiter)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    next(); // Skip general limiter for auth routes
  } else {
    generalLimiter(req, res, next);
  }
});

// Request logging
app.use(requestLogger);

// Performance monitoring
app.use(performanceMiddleware);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes with specific rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/monitoring', monitoringRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/customers', customersRoutes);
app.use('/api/email-marketing', emailMarketingRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/sku', skuRoutes);
app.use('/api/fulfillment', fulfillmentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/abandoned-cart', abandonedCartRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/email', emailMarketingRoutes);
app.use('/api/drops', dropsRoutes); // Public drops routes
app.use('/api/admin/drops', dropsRoutes); // Admin drops routes (same router, but routes check path)
app.use('/api/shiprocket', shiprocketRoutes);
app.use('/api/admin/email-logs', emailLogsRoutes);
app.use('/api/contact', contactRoutes); // Contact form route

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  await logger.info('Shutting down gracefully (SIGINT)...');
  stopLowStockMonitor();
  stopEmailRetryWorker();
  stopDropStatusMonitor();
  stopProductStatusMonitor();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await logger.info('Shutting down gracefully (SIGTERM)...');
  stopLowStockMonitor();
  stopEmailRetryWorker();
  stopDropStatusMonitor();
  stopProductStatusMonitor();
  await prisma.$disconnect();
  process.exit(0);
});

// Export app for Vercel serverless functions
export default app;

// Start server only if not in Vercel environment
if (process.env['VERCEL'] !== '1') {
  const PORT = Number(process.env['PORT']) || 5001;
  const HOST = process.env['HOST'] || '0.0.0.0';

  app.listen(PORT, HOST, () => {
    // Log startup messages via logger
    logger.info('Server started', { port: PORT, host: HOST }).catch(() => {});
    
    startLowStockMonitor();
    startEmailRetryWorker();
    startDropStatusMonitor();
    startProductStatusMonitor();
  });
}