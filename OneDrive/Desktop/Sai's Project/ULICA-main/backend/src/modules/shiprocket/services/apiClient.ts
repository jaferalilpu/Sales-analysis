import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { authenticate, invalidateToken } from './authService';
import { resolveConfig } from '../utils/config';

const RETRYABLE_STATUS_CODES = [401, 403];

export async function shiprocketRequest<T = any>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
  const config = await resolveConfig();
  if (!config) {
    throw new Error('Shiprocket credentials not configured');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${config.baseUrl}/external${endpoint}`;

  const token = await authenticate();

  try {
    return await axios.request<T>({
      url,
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });
  } catch (error: any) {
    const status = error?.response?.status;

    if (status && RETRYABLE_STATUS_CODES.includes(status)) {
      // token may have expired. invalidate and retry once.
      invalidateToken();
      const freshToken = await authenticate(true);

      return axios.request<T>({
        url,
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freshToken}`,
          ...options.headers,
        },
        ...options,
      });
    }

    throw error;
  }
}

