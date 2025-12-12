import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRouter from '../../backend/src/routes/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const MockedPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Authentication API Routes', () => {
  let app: express.Application;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
  });

  beforeEach(() => {
    mockPrisma = new MockedPrismaClient() as jest.Mocked<PrismaClient>;
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerRequest = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: false,
        role: 'customer',
        createdAt: new Date()
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
      mockPrisma.user.create.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerRequest)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'hashed-password'
          })
        })
      );
    });

    it('should return 400 if user already exists', async () => {
      const registerRequest = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const existingUser = {
        id: 'user-1',
        email: 'existing@example.com'
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const invalidRequest = {
        email: 'test@example.com'
        // Missing password, firstName, lastName
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should validate email format', async () => {
      const invalidRequest = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should validate password strength', async () => {
      const invalidRequest = {
        email: 'test@example.com',
        password: '123', // Too short
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        isActive: true,
        isEmailVerified: true
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, lastLoginAt: new Date() } as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
      expect(response.body.data.tokens.accessToken).toBe('access-token');
      expect(response.body.data.tokens.refreshToken).toBe('refresh-token');
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    });

    it('should return 401 for invalid email', async () => {
      const loginRequest = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginRequest)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const loginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        isActive: true,
        isEmailVerified: true
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockBcrypt.compare.mockResolvedValue(false as never);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginRequest)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for inactive user', async () => {
      const loginRequest = {
        email: 'inactive@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 'user-1',
        email: 'inactive@example.com',
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        isActive: false,
        isEmailVerified: true
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginRequest)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Account is deactivated');
    });

    it('should validate required fields', async () => {
      const invalidRequest = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const refreshRequest = {
        refreshToken: 'valid-refresh-token'
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        isActive: true
      };

      mockJwt.verify.mockReturnValue({ userId: 'user-1' } as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockJwt.sign.mockReturnValue('new-access-token');

      const response = await request(app)
        .post('/api/auth/refresh')
        .send(refreshRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBe('new-access-token');
      expect(mockJwt.verify).toHaveBeenCalledWith('valid-refresh-token', expect.any(String));
    });

    it('should return 401 for invalid refresh token', async () => {
      const refreshRequest = {
        refreshToken: 'invalid-refresh-token'
      };

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send(refreshRequest)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid refresh token');
    });

    it('should return 401 for non-existent user', async () => {
      const refreshRequest = {
        refreshToken: 'valid-refresh-token'
      };

      mockJwt.verify.mockReturnValue({ userId: 'non-existent-user' } as any);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send(refreshRequest)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email for existing user', async () => {
      const forgotPasswordRequest = {
        email: 'test@example.com'
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        passwordResetToken: 'reset-token',
        passwordResetExpires: new Date(Date.now() + 3600000)
      } as any);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotPasswordRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password reset email sent');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'test@example.com' },
          data: expect.objectContaining({
            passwordResetToken: expect.any(String),
            passwordResetExpires: expect.any(Date)
          })
        })
      );
    });

    it('should return success even for non-existent email (security)', async () => {
      const forgotPasswordRequest = {
        email: 'nonexistent@example.com'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotPasswordRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password reset email sent');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const resetPasswordRequest = {
        token: 'valid-reset-token',
        password: 'newpassword123'
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordResetToken: 'valid-reset-token',
        passwordResetExpires: new Date(Date.now() + 3600000)
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser as any);
      mockBcrypt.hash.mockResolvedValue('hashed-new-password' as never);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        password: 'hashed-new-password',
        passwordResetToken: null,
        passwordResetExpires: null
      } as any);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetPasswordRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password reset successful');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('newpassword123', 12);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            password: 'hashed-new-password',
            passwordResetToken: null,
            passwordResetExpires: null
          })
        })
      );
    });

    it('should return 400 for invalid token', async () => {
      const resetPasswordRequest = {
        token: 'invalid-token',
        password: 'newpassword123'
      };

      mockPrisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetPasswordRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired reset token');
    });

    it('should return 400 for expired token', async () => {
      const resetPasswordRequest = {
        token: 'expired-token',
        password: 'newpassword123'
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordResetToken: 'expired-token',
        passwordResetExpires: new Date(Date.now() - 3600000) // Expired
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetPasswordRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired reset token');
    });
  });
});
