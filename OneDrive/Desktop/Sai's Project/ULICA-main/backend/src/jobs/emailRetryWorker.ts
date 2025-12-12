import { PrismaClient } from '@prisma/client';
import { getEmailRetrySettings, sendEmail } from '../services/emailService';
import { logger } from '../services/loggerService';

const prisma = new PrismaClient();

let emailRetryTimer: NodeJS.Timeout | null = null;
let processingQueue = false;

export function startEmailRetryWorker(intervalMs: number = 60_000) {
  if (emailRetryTimer) {
    return;
  }

  emailRetryTimer = setInterval(async () => {
    if (processingQueue) {
      return;
    }
    processingQueue = true;
    try {
      await processEmailQueue();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Email retry worker error', { error: errorMsg }).catch(() => {});
    } finally {
      processingQueue = false;
    }
  }, intervalMs);
}

export function stopEmailRetryWorker() {
  if (emailRetryTimer) {
    clearInterval(emailRetryTimer);
    emailRetryTimer = null;
  }
}

async function processEmailQueue() {
  const retryConfig = await getEmailRetrySettings();

  if (!retryConfig.enabled) {
    return;
  }

  const now = new Date();
  const pendingEmails = await prisma.emailLog.findMany({
    where: {
      status: 'queued',
      scheduledRetryAt: {
        lte: now,
      },
    },
    orderBy: {
      scheduledRetryAt: 'asc',
    },
    take: 10,
  });

  for (const log of pendingEmails) {
    const html =
      (log.payload as any)?.html ??
      (log.payload as any)?.htmlContent ??
      null;

    if (!html) {
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: 'failed',
          lastError: 'Missing email payload for retry',
          scheduledRetryAt: null,
        },
      });
      continue;
    }

    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: 'retrying',
      },
    });

    await sendEmail(
      log.to,
      log.subject,
      html,
      ((log.metadata as any)?.fromName as string) ?? 'ULICA',
      {
        ...(log.template ? { template: log.template } : {}),
        ...(log.metadata ? { metadata: log.metadata as Record<string, unknown> } : {}),
        logId: log.id,
      }
    );
  }
}

