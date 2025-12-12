import * as express from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { sendEmail } from '../services/emailService';
import { getWelcomeEmailTemplate } from '../services/emailTemplates';
import { sanitizeInput, preventSQLInjection } from '../middlewares/security';
import { processReferralSignup } from '../services/referralService';
import { logger } from '../services/loggerService';
import { ExpressResponse } from '../types/express';
import * as Joi from 'joi';

const router = express.Router();

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN = process.env['REFRESH_TOKEN_EXPIRES_IN'] || '7d';

// Cookie configuration
const isProduction = process.env['NODE_ENV'] === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction, // Only use secure in production (requires HTTPS)
  sameSite: 'lax' as const,
  maxAge: isProduction ? 7 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

// Validation schemas
const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    referralCode: Joi.string().optional()
  })
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().min(2).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
  })
};

const verifyEmailSchema = {
  body: Joi.object({
    token: Joi.string().required()
  })
};

const resendVerificationSchema = {
  body: Joi.object({
    email: Joi.string().email().required()
  })
};

const verifyOtpSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  })
};

const resendOtpSchema = {
  body: Joi.object({
    email: Joi.string().email().required()
  })
};

const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required()
  })
};

const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required()
  })
};

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register',
  sanitizeInput,
  preventSQLInjection,
  validate(registerSchema),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const { email, password, name, phone, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new CustomError('User already exists with this email', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user with verification token
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: 'customer',
        emailVerificationToken: verificationCode
      }
    });

    // Process referral if code provided
    if (referralCode) {
      try {
        await processReferralSignup(user.id, referralCode);
      } catch (error) {
        // Continue with registration even if referral fails
        // Referral processing error logged silently
      }
    }

    // Create verification email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your ULICA account</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ULICA</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; margin-top: 20px;">
          <h2 style="color: #000; margin-top: 0;">Verify Your Email Address</h2>
          <p>Hello ${name || 'User'},</p>
          <p>Thank you for registering with ULICA! To complete your registration, please verify your email address using the code below:</p>
          <div style="background-color: #fff; border: 2px solid #000; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #000; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>If you didn't create an account with ULICA, please ignore this email.</p>
          <p style="margin-top: 30px;">Best regards,<br>The ULICA Team</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} ULICA. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Send verification email (fire-and-forget, with logging)
    try {
      await sendEmail(
        user.email,
        'Verify your ULICA account',
        emailHtml,
        'ULICA',
        {
          metadata: {
            userId: user.id,
            name: user.name || 'User',
            type: 'verification',
          }
        }
      );
      await logger.info(`Verification email sent to ${user.email}`, { userId: user.id, type: 'verification' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logger.error('Failed to send verification email', { userId: user.id, error: errorMessage }, user.id);
      // Log the verification code in development only so it can be retrieved if email fails
      if (process.env['NODE_ENV'] === 'development') {
        await logger.debug(`VERIFICATION CODE for ${user.email}: ${verificationCode}`, { userId: user.id });
      }
      // Continue with registration even if email fails
    }

    // Don't generate tokens - user must verify email first
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account before logging in.',
      data: {
        user: userWithoutPassword
      }
    });
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login',
  sanitizeInput,
  preventSQLInjection,
  validate(loginSchema),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET as string,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET as string,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
    );

    // Set httpOnly cookies for tokens
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        // Include tokens in response body for frontend to set cookies on its domain
        accessToken,
        refreshToken
      }
    });
  })
);

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isEmailVerified: true,
      }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user }
    });
  })
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile',
  validate(updateProfileSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { firstName: name }),
        ...(phone && { phone })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isEmailVerified: true,
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh access token using httpOnly cookie
 */
router.post('/refresh',
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    // Get refresh token from httpOnly cookie
    const refreshToken = req.cookies?.['refreshToken'] as string | undefined;

    if (!refreshToken) {
      throw new CustomError('Refresh token required', 400);
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true
        }
      });

      if (!user) {
        throw new CustomError('Invalid refresh token', 401);
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET as string,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );

      // Set new access token in httpOnly cookie
      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully'
        // Token is in httpOnly cookie, not in response body
      });
    } catch (error) {
      throw new CustomError('Invalid refresh token', 401);
    }
  })
);

/**
 * POST /api/auth/logout
 * Logout user by clearing httpOnly cookies
 */
router.post('/logout',
  asyncHandler(async (_req: express.Request, res: ExpressResponse) => {
    // Clear httpOnly cookies
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  })
);

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
router.post('/verify-email',
  validate(verifyEmailSchema),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const { token } = req.body;

    // Find user with valid verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token
      }
    });

    if (!user) {
      throw new CustomError('Invalid verification token', 400);
    }

    // Update user as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null
      }
    });

    // Send welcome email
    try {
      const welcomeEmailHtml = getWelcomeEmailTemplate(user.name || 'User');
      await sendEmail(
        user.email,
        'Welcome to ULICA - Your Streetwear Journey Begins!',
        welcomeEmailHtml,
        'ULICA',
        {
          template: 'welcome',
          metadata: {
            userId: user.id,
            name: user.name || 'User',
            type: 'welcome',
          }
        }
      );
      await logger.info(`Welcome email sent to ${user.email}`, { userId: user.id }, user.id);
    } catch (error) {
      await logger.error('Failed to send welcome email', { userId: user.id, error: error instanceof Error ? error.message : String(error) }, user.id);
      // Don't fail the verification if welcome email fails
    }

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  })
);

/**
 * POST /api/auth/resend-verification
 * Resend email verification
 */
router.post('/resend-verification',
  validate(resendVerificationSchema),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if ((user as any).isEmailVerified) {
      throw new CustomError('Email already verified', 400);
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationCode
      }
    });

    // Create verification email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your ULICA account</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ULICA</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; margin-top: 20px;">
          <h2 style="color: #000; margin-top: 0;">Verify Your Email Address</h2>
          <p>Hello ${user.name || 'User'},</p>
          <p>You requested a new verification code for your ULICA account. Please use the code below to verify your email address:</p>
          <div style="background-color: #fff; border: 2px solid #000; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #000; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p style="margin-top: 30px;">Best regards,<br>The ULICA Team</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} ULICA. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Send verification email
    try {
      await sendEmail(
        user.email,
        'Verify your ULICA account',
        emailHtml,
        'ULICA',
        {
          metadata: {
            userId: user.id,
            name: user.name || 'User',
            type: 'verification',
          }
        }
      );
      await logger.info(`Verification email resent to ${user.email}`, { userId: user.id, type: 'verification' }, user.id);
    } catch (error) {
      await logger.error('Failed to send verification email', { userId: user.id, error: error instanceof Error ? error.message : String(error) }, user.id);
      throw new CustomError('Failed to send verification email', 500);
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  })
);

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
      return;
    }

    // Send password reset email
    try {
      await sendEmail(
        user.email,
        'Reset your ULICA password',
        'reset-password',
        undefined,
        {
          metadata: {
            userId: user.id,
            name: user.name || 'User',
            type: 'passwordReset',
          }
        }
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send password reset email', { email, error: errorMsg }).catch(() => {});
      throw new CustomError('Failed to send password reset email', 500);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  })
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      } as any
    });

    if (!user) {
      throw new CustomError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      } as any
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  })
);

/**
 * POST /api/auth/verify-otp
 * Verify OTP for email verification
 */
router.post('/verify-otp',
  validate(verifyOtpSchema),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const { email, otp } = req.body;

    // Find user with matching email and verification token
    const user = await prisma.user.findFirst({
      where: {
        email,
        emailVerificationToken: otp
      }
    });

    if (!user) {
      throw new CustomError('Invalid OTP', 400);
    }

    // Mark email as verified and clear verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null
      }
    });

    // Send welcome email
    try {
      const welcomeEmailHtml = getWelcomeEmailTemplate(user.name || 'User');
      await sendEmail(
        user.email,
        'Welcome to ULICA - Your Streetwear Journey Begins!',
        welcomeEmailHtml,
        'ULICA',
        {
          template: 'welcome',
          metadata: {
            userId: user.id,
            name: user.name || 'User',
            type: 'welcome',
          }
        }
      );
      await logger.info(`Welcome email sent to ${user.email}`, { userId: user.id }, user.id);
    } catch (error) {
      await logger.error('Failed to send welcome email', { userId: user.id, error: error instanceof Error ? error.message : String(error) }, user.id);
      // Don't fail the verification if welcome email fails
    }

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.'
    });
  })
);

/**
 * POST /api/auth/resend-otp
 * Resend OTP for email verification
 */
router.post('/resend-otp',
  validate(resendOtpSchema),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const { email } = req.body;

    // Find user - try Prisma first, fallback to raw SQL
    type UserResult = {
      id: string;
      email: string;
      name?: string | null;
      password?: string | null;
      phone?: string | null;
      isEmailVerified?: boolean | null;
      [key: string]: unknown;
    };
    let user: UserResult | null;
    try {
      user = await prisma.user.findUnique({
        where: { email }
      });
    } catch (prismaError) {
      // Fallback to raw SQL if Prisma fails
      logger.warn('Prisma findUnique failed, trying raw SQL', { error: prismaError instanceof Error ? prismaError.message : String(prismaError) }).catch(() => {});
      const users = await prisma.$queryRaw`
        SELECT * FROM users WHERE email = ${email}
      ` as Array<{ id: string; email: string; name?: string | null; password?: string | null; phone?: string | null; isEmailVerified?: boolean | null; [key: string]: unknown }>;
      if (!users || users.length === 0) {
        throw new CustomError('User not found', 404);
      }
      const rawUser = users[0];
      user = rawUser ? {
        id: rawUser.id,
        email: rawUser.email,
        name: rawUser.name ?? null,
        password: rawUser.password ?? null,
        phone: rawUser.phone ?? null,
        isEmailVerified: rawUser.isEmailVerified ?? null,
      } as UserResult : null;
    }

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw new CustomError('Email is already verified', 400);
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationCode
      }
    });

    // Create verification email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your ULICA account</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ULICA</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; margin-top: 20px;">
          <h2 style="color: #000; margin-top: 0;">Verify Your Email Address</h2>
          <p>Hello ${user.name || 'User'},</p>
          <p>You requested a new verification code for your ULICA account. Please use the code below to verify your email address:</p>
          <div style="background-color: #fff; border: 2px solid #000; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #000; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p style="margin-top: 30px;">Best regards,<br>The ULICA Team</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} ULICA. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Generate new verification token and send email
    try {
      await sendEmail(
        user.email,
        'Verify your ULICA account',
        emailHtml,
        'ULICA',
        {
          metadata: {
            userId: user.id,
            name: user.name || 'User',
            type: 'verification',
          }
        }
      );
      await logger.info(`OTP resent to ${user.email}`, { userId: user.id, type: 'verification' }, user.id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logger.error('Failed to send verification email', { userId: user.id, error: errorMessage }, user.id);
      // Log the verification code in development only so it can be retrieved if email fails
      if (process.env['NODE_ENV'] === 'development') {
        await logger.debug(`VERIFICATION CODE for ${user.email}: ${verificationCode}`, { userId: user.id });
      }
      
      // Check if it's an SMTP configuration error
      if (errorMessage.includes('SMTP not configured') || errorMessage.includes('SMTP_USER') || errorMessage.includes('SMTP_PASS')) {
        throw new CustomError('Email service is not configured. Please contact support or check server configuration.', 503);
      }
      
      // Provide more helpful error message
      throw new CustomError(`Failed to send verification email: ${errorMessage}`, 500);
    }

    res.json({
      success: true,
      message: 'OTP resent successfully'
    });
  })
);

export default router;
