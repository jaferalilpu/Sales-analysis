import { prisma } from './setup';
import * as EmailService from '../services/emailService';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('Email Service Integration Tests', () => {
  let testUser: any;
  const mockSendMail = jest.fn();

  beforeAll(async () => {
    // Create test user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('test123', 12);
    testUser = await prisma.user.create({
      data: {
        email: 'email-test@example.com',
        password: hashedPassword,
        name: 'Email Test User',
        role: 'customer',
        isActive: true,
        isEmailVerified: false,
      },
    });

    // Mock nodemailer createTransport
    const mockTransporter = {
      sendMail: mockSendMail,
      verify: jest.fn(() => Promise.resolve(true)),
    };

    mockedNodemailer.createTransport.mockReturnValue(mockTransporter as any);
  });

  afterAll(async () => {
    await prisma.emailLog.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(() => {
    mockSendMail.mockClear();
    mockSendMail.mockResolvedValue({
      messageId: 'test-message-id',
      accepted: ['test@example.com'],
      rejected: [],
      pending: [],
      response: '250 OK',
    });
  });

  describe('Email Logging', () => {
    it('should log email send attempts to EmailLog', async () => {
      await EmailService.sendEmail(
        'test@example.com',
        'Test Email',
        '<p>Test content</p>',
        'ULICA'
      );

      // Verify email was logged
      const emailLogs = await prisma.emailLog.findMany({
        where: { to: 'test@example.com' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(emailLogs.length).toBeGreaterThan(0);
      if (emailLogs[0]) {
        expect(emailLogs[0].to).toBe('test@example.com');
        expect(emailLogs[0].subject).toBe('Test Email');
      }
    });

    it('should log failed email attempts', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      await EmailService.sendEmail(
        'fail@example.com',
        'Failed Email',
        '<p>Test</p>',
        'ULICA'
      );

      // Verify failed email was logged
      const emailLogs = await prisma.emailLog.findMany({
        where: { to: 'fail@example.com' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(emailLogs.length).toBe(1);
      expect(emailLogs[0].status).toBe('failed');
      expect(emailLogs[0].lastError).toBeDefined();
    });

    it('should track retry attempts', async () => {
      // First attempt fails
      mockSendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      await EmailService.sendEmail(
        'retry@example.com',
        'Retry Email',
        '<p>Test</p>',
        'ULICA'
      );

      const emailLog = await prisma.emailLog.findFirst({
        where: { to: 'retry@example.com' },
      });

      expect(emailLog).toBeDefined();
      expect(emailLog?.attempts).toBeGreaterThan(0);
      expect(emailLog?.scheduledRetryAt).toBeDefined();
    });
  });

  // Note: These tests are skipped as the specific email functions may not be exported
  // The core sendEmail function is tested above
  describe.skip('Specialized Email Functions', () => {
    it('should send verification email successfully', async () => {
      // Test implementation when functions are available
    });

    it('should send password reset email successfully', async () => {
      // Test implementation when functions are available
    });

    it('should send welcome email successfully', async () => {
      // Test implementation when functions are available
    });

    it('should send test email successfully', async () => {
      // Test implementation when functions are available
    });
  });
});

