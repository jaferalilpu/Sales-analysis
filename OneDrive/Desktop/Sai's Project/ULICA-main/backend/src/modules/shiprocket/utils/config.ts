import { resolveShiprocketCredentials } from '../../../services/integrationService';

export interface ShiprocketConfig {
  email: string;
  password: string;
  baseUrl: string;
  channelId?: string | null;
  pickupLocation?: string | null;
}

let cachedConfig: ShiprocketConfig | null = null;

export async function resolveConfig(): Promise<ShiprocketConfig | null> {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (process.env['SHIPROCKET_EMAIL'] && process.env['SHIPROCKET_PASSWORD']) {
    cachedConfig = {
      email: process.env['SHIPROCKET_EMAIL']!,
      password: process.env['SHIPROCKET_PASSWORD']!,
      baseUrl: process.env['SHIPROCKET_BASE_URL'] ?? 'https://apiv2.shiprocket.in',
      channelId: process.env['SHIPROCKET_CHANNEL_ID'] ?? null,
      pickupLocation: process.env['SHIPROCKET_PICKUP_LOCATION'] ?? null
    };
    return cachedConfig;
  }

  const secrets = await resolveShiprocketCredentials();
  if (secrets) {
    cachedConfig = {
      email: secrets.email,
      password: secrets.password,
      baseUrl: secrets.baseUrl ?? 'https://apiv2.shiprocket.in',
      channelId: secrets.channelId ?? null,
      pickupLocation: secrets.pickupLocation ?? null
    };
    return cachedConfig;
  }

  return null;
}

export async function ensureCredentials(shouldThrow = false, overrides?: Partial<ShiprocketConfig>) {
  const resolved = await resolveConfig();
  const merged = {
    ...resolved,
    ...overrides
  } as ShiprocketConfig | null;

  if (!merged?.email || !merged?.password) {
    if (shouldThrow) {
      throw new Error(
        'Shiprocket credentials are not configured. Visit Admin → Settings → Integrations to add them, or populate SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD environment variables.'
      );
    }
    return null;
  }

  cachedConfig = merged;
  return merged;
}

export async function getConfigOrThrow() {
  const config = await ensureCredentials(true);
  return config!;
}

