import nodemailer from 'nodemailer';
import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { logger } from './loggerService';

const EMAIL_RETRY_DEFAULTS = {
  retryEnabled: true,
  retryMaxAttempts: 3,
  retryDelayMinutes: 15,
};

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function loadEmailSettings() {
  const record = await prisma.settings.findUnique({ where: { id: '1' }, select: { email: true } });
  if (!record?.email) {
    return { ...EMAIL_RETRY_DEFAULTS };
  }

  try {
    const parsed = JSON.parse(record.email);
    return {
      ...EMAIL_RETRY_DEFAULTS,
      ...parsed,
    };
  } catch (error) {
    logger.error('Failed to parse email settings', { error: error instanceof Error ? error.message : String(error) }).catch(() => {});
    return { ...EMAIL_RETRY_DEFAULTS };
  }
}

export async function getEmailRetrySettings() {
  const settings = await loadEmailSettings();
  return {
    enabled: Boolean(settings.retryEnabled ?? EMAIL_RETRY_DEFAULTS.retryEnabled),
    maxAttempts: Number(settings.retryMaxAttempts ?? EMAIL_RETRY_DEFAULTS.retryMaxAttempts),
    delayMinutes: Number(settings.retryDelayMinutes ?? EMAIL_RETRY_DEFAULTS.retryDelayMinutes),
  };
}

const smtpConfig = {
  host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  port: parseInt(process.env['SMTP_PORT'] || '587'),
  secure: false,
  auth: {
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS'],
  },
};

// Only create transporter if credentials are available
let transporter: nodemailer.Transporter | null = null;

if (smtpConfig.auth.user && smtpConfig.auth.pass) {
  transporter = nodemailer.createTransport(smtpConfig);
} else {
  logger.warn('SMTP credentials not configured. Email sending will be disabled. Please set SMTP_USER and SMTP_PASS environment variables.').catch(() => {});
}

export interface EmailTemplateData {
  name: string;
  subject: string;
  content: string;
  category: string;
  variables?: string[];
  createdBy: string;
}

export interface EmailCampaignData {
  name: string;
  subject: string;
  content: string;
  templateId?: string;
  scheduledAt?: Date;
  createdBy: string;
}

export interface EmailRecipientData {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  template?: string;
  metadata?: Record<string, unknown>;
  logId?: string;
}

async function createOrLoadEmailLog(
  to: string,
  subject: string,
  htmlContent: string,
  options?: SendEmailOptions,
) {
  if (options?.logId) {
    const existing = await prisma.emailLog.findUnique({ where: { id: options.logId } });
    if (existing) {
      return existing;
    }
  }

  return prisma.emailLog.create({
    data: {
      to,
      subject,
      template: options?.template ?? null,
      provider: 'smtp',
      status: 'pending',
      attempts: 0,
      payload: { html: htmlContent },
      metadata: (options?.metadata as any) ?? null,
    },
  });
}

async function updateEmailLogStatus(
  logId: string,
  data: Parameters<typeof prisma.emailLog.update>[0]['data'],
) {
  await prisma.emailLog.update({
    where: { id: logId },
    data,
  });
}

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  fromName: string = 'ULICA',
  options?: SendEmailOptions,
): Promise<boolean> {
  // Check if transporter is configured
  if (!transporter) {
    const errorMsg = 'SMTP not configured. Please set SMTP_USER and SMTP_PASS environment variables.';
    logger.error('SMTP not configured', { to, subject }).catch(() => {});
    
    // Still create log entry for tracking
    try {
      const log = await createOrLoadEmailLog(to, subject, htmlContent, {
        ...options,
        metadata: {
          ...(options?.metadata ?? {}),
          fromName,
        },
      });
      await updateEmailLogStatus(log.id, {
        status: 'failed',
        lastError: errorMsg,
        scheduledRetryAt: null,
      });
    } catch (logError) {
      logger.error('Failed to log email error', { error: logError instanceof Error ? logError.message : String(logError) }).catch(() => {});
    }
    
    throw new Error(errorMsg);
  }

  const retryConfig = await getEmailRetrySettings();
  const metadata = {
    ...(options?.metadata ?? {}),
    fromName,
  };
  const log = await createOrLoadEmailLog(to, subject, htmlContent, {
    ...options,
    metadata,
  });

  const attempts = log.attempts + 1;

  await updateEmailLogStatus(log.id, {
    attempts,
    status: 'sending',
    lastAttemptAt: new Date(),
    payload: log.payload ?? { html: htmlContent },
    metadata,
  });

  try {
    const mailOptions = {
      from: `"${fromName}" <${smtpConfig.auth.user}>`,
      to,
      subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    await logger.info('Email sent successfully', { messageId: result.messageId, to: mailOptions.to });

    await updateEmailLogStatus(log.id, {
      status: 'sent',
      lastError: null,
      scheduledRetryAt: null,
    });

    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    logger.error('Failed to send email', { to, subject, error: errorMessage }).catch(() => {});

    const shouldRetry =
      retryConfig.enabled && attempts < retryConfig.maxAttempts;
    const scheduledRetryAt = shouldRetry
      ? addMinutes(new Date(), retryConfig.delayMinutes)
      : null;

    await updateEmailLogStatus(log.id, {
      status: shouldRetry ? 'queued' : 'failed',
      lastError: errorMessage,
      scheduledRetryAt,
    });

    // Re-throw error so calling code can handle it
    throw new Error(`Email sending failed: ${errorMessage}`);
  }
}

export async function createEmailTemplate(data: EmailTemplateData) {
  const template = await prisma.emailTemplate.create({
    data: {
      ...data,
      variables: data.variables ? (JSON.stringify(data.variables) as any) : null,
    },
  });

  return template;
}

export async function getEmailTemplates(
  page: number = 1,
  limit: number = 20,
  category?: string,
) {
  const skip = (page - 1) * limit;
  const where: Prisma.EmailTemplateWhereInput = {};

  if (category) {
    where.category = category;
  }

  const [templates, total] = await prisma.$transaction([
    prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.emailTemplate.count({ where }),
  ]);

  return {
    templates: templates.map((template) => ({
      ...template,
      variables: template.variables && typeof template.variables === 'string' 
        ? JSON.parse(template.variables) 
        : (template.variables || []),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function sendTestEmail(
  to: string,
  subject: string,
  content: string,
) {
  const success = await sendEmail(to, subject, content, 'ULICA Test', {
    template: 'test-email',
    metadata: { reason: 'test' },
  });
  return { success };
}