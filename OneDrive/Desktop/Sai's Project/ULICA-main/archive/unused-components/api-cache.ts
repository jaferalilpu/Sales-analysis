// API Cache utility for client-side caching
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Generate cache key from URL and params
  generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}${paramString}`;
  }
}

export const apiCache = new APICache();

// Enhanced fetch with caching
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  const cacheKey = apiCache.generateKey(url, options.body ? JSON.parse(options.body as string) : undefined);
  
  // Check cache first
  const cached = apiCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache the result
  apiCache.set(cacheKey, data, ttl);
  
  return data;
}

// Cache invalidation helpers
export const invalidateCache = {
  products: () => {
    // Invalidate all product-related cache entries
    const keysToDelete = Array.from(apiCache['cache'].keys()).filter(key => 
      key.includes('/api/products') || 
      key.includes('/api/admin/products')
    );
    keysToDelete.forEach(key => apiCache.delete(key));
  },
  
  orders: () => {
    const keysToDelete = Array.from(apiCache['cache'].keys()).filter(key => 
      key.includes('/api/orders') || 
      key.includes('/api/admin/orders')
    );
    keysToDelete.forEach(key => apiCache.delete(key));
  },
  
  dashboard: () => {
    const keysToDelete = Array.from(apiCache['cache'].keys()).filter(key => 
      key.includes('/api/admin/dashboard')
    );
    keysToDelete.forEach(key => apiCache.delete(key));
  },
  
  all: () => {
    apiCache.clear();
  }
};
