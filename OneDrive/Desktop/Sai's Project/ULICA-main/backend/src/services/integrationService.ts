import prisma from '../prisma/client';
import { decryptValue, encryptValue } from '../utils/cryptoUtil';

export type IntegrationProvider = 'email' | 'payments' | 'shiprocket';

const PROVIDER_FIELDS: Record<IntegrationProvider, string[]> = {
  email: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'fromEmail', 'fromName'],
  payments: [
    'razorpayKeyId',
    'razorpayKeySecret',
    'phonepeMerchantId',
    'phonepeSaltKey',
    'phonepeSaltIndex'
  ],
  shiprocket: ['email', 'password', 'baseUrl', 'channelId', 'pickupLocation']
};

const ENV_MAP: Record<IntegrationProvider, Record<string, string>> = {
  email: {
    smtpHost: 'SMTP_HOST',
    smtpPort: 'SMTP_PORT',
    smtpUser: 'SMTP_USER',
    smtpPassword: 'SMTP_PASS',
    fromEmail: 'SMTP_FROM_EMAIL',
    fromName: 'SMTP_FROM_NAME'
  },
  payments: {
    razorpayKeyId: 'RAZORPAY_KEY_ID',
    razorpayKeySecret: 'RAZORPAY_KEY_SECRET',
    phonepeMerchantId: 'PHONEPE_MERCHANT_ID',
    phonepeSaltKey: 'PHONEPE_SALT_KEY',
    phonepeSaltIndex: 'PHONEPE_SALT_INDEX'
  },
  shiprocket: {
    email: 'SHIPROCKET_EMAIL',
    password: 'SHIPROCKET_PASSWORD',
    baseUrl: 'SHIPROCKET_BASE_URL',
    channelId: 'SHIPROCKET_CHANNEL_ID',
    pickupLocation: 'SHIPROCKET_PICKUP_LOCATION'
  }
};

export interface IntegrationSecretPayload {
  source: 'env' | 'database';
  values: Record<string, string | null>;
}

export function mergeIntegrationValues(
  provider: IntegrationProvider,
  payload: IntegrationSecretPayload
): Record<string, string | null> {
  const result: Record<string, string | null> = {};

  for (const field of PROVIDER_FIELDS[provider]) {
    const envKey = ENV_MAP[provider][field];
    const envValue = envKey ? process.env[envKey] ?? null : null;
    if (envValue) {
      result[field] = envValue;
      continue;
    }

    result[field] = payload.values[field] ?? null;
  }

  return result;
}

export async function getIntegrationSecrets(provider: IntegrationProvider): Promise<IntegrationSecretPayload> {
  const envValues: Record<string, string | null> = {};
  let hasEnv = false;

  for (const field of PROVIDER_FIELDS[provider]) {
    const envKey = ENV_MAP[provider][field];
    const envValue = envKey ? process.env[envKey] ?? null : null;
    envValues[field] = envValue;
    if (envValue) hasEnv = true;
  }

  const record = await prisma.integrationCredential.findUnique({ where: { provider } });

  const dbValues: Record<string, string | null> = {};

  if (record) {
    const decrypted = decryptValue(record.data, record.isEncrypted);
    const parsed = JSON.parse(decrypted) as Record<string, string | null>;

    for (const field of PROVIDER_FIELDS[provider]) {
      dbValues[field] = parsed[field] ?? null;
    }
  } else {
    for (const field of PROVIDER_FIELDS[provider]) {
      dbValues[field] = null;
    }
  }

  return {
    source: hasEnv ? 'env' : 'database',
    values: hasEnv ? envValues : dbValues
  };
}

export async function saveIntegrationSecrets(
  provider: IntegrationProvider,
  values: Record<string, string | null>
) {
  const payload: Record<string, string | null> = {};
  for (const field of PROVIDER_FIELDS[provider]) {
    payload[field] = values[field] ?? null;
  }

  const { value, encrypted } = encryptValue(JSON.stringify(payload));

  await prisma.integrationCredential.upsert({
    where: { provider },
    update: {
      data: value,
      isEncrypted: encrypted
    },
    create: {
      provider,
      data: value,
      isEncrypted: encrypted
    }
  });

  return { provider, encrypted };
}

export async function upsertAndReturnSecrets(
  provider: IntegrationProvider,
  values: Record<string, string | null>
) {
  await saveIntegrationSecrets(provider, values);
  return getIntegrationSecrets(provider);
}

export function hasShiprocketCredentials(): boolean {
  const envEmail = process.env['SHIPROCKET_EMAIL'];
  const envPassword = process.env['SHIPROCKET_PASSWORD'];
  return Boolean(envEmail && envPassword);
}

export async function resolveShiprocketCredentials() {
  if (hasShiprocketCredentials()) {
    return {
      email: process.env['SHIPROCKET_EMAIL']!,
      password: process.env['SHIPROCKET_PASSWORD']!,
      baseUrl: process.env['SHIPROCKET_BASE_URL'] ?? 'https://apiv2.shiprocket.in',
      channelId: process.env['SHIPROCKET_CHANNEL_ID'],
      pickupLocation: process.env['SHIPROCKET_PICKUP_LOCATION']
    };
  }

  const record = await prisma.integrationCredential.findUnique({ where: { provider: 'shiprocket' } });
  if (!record) return null;

  const decrypted = JSON.parse(decryptValue(record.data, record.isEncrypted));
  const { email, password, baseUrl, channelId, pickupLocation } = decrypted;
  if (!email || !password) return null;
  return {
    email,
    password,
    baseUrl: baseUrl ?? 'https://apiv2.shiprocket.in',
    channelId,
    pickupLocation
  };
}
