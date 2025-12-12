import axios from 'axios';
import { ensureCredentials } from '../utils/config';

type TokenCache = {
  token: string;
  expiresAt: number;
};

let cachedToken: TokenCache | null = null;

const TOKEN_EXPIRY_BUFFER = 60 * 1000; // 60 seconds buffer

export async function authenticate(force = false): Promise<string> {
  if (!force && cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const config = await ensureCredentials(true);
  if (!config) {
    throw new Error('Shiprocket credentials not configured');
  }

  const url = `${config.baseUrl}/external/auth/login`;

  const response = await axios.post(url, {
    email: config.email,
    password: config.password,
  });

  if (response.data?.status !== 200 || !response.data?.token) {
    throw new Error('Shiprocket authentication failed');
  }

  const expiresIn = Number(response.data.expires_in ?? 3600);
  cachedToken = {
    token: response.data.token,
    expiresAt: Date.now() + expiresIn * 1000 - TOKEN_EXPIRY_BUFFER,
  };

  return cachedToken.token;
}

export function invalidateToken(): void {
  cachedToken = null;
}

