import { NextResponse } from "next/server";

export interface CacheOptions {
  maxAge?: number; // seconds
  staleWhileRevalidate?: number; // seconds
  public?: boolean;
}

const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  maxAge: 60, // 1 minute
  staleWhileRevalidate: 300, // 5 minutes
  public: true,
};

export function withCache(
  response: NextResponse,
  options: CacheOptions = {},
): NextResponse {
  const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };

  const cacheControl = [
    cacheOptions.public ? "public" : "private",
    `max-age=${cacheOptions.maxAge}`,
    `stale-while-revalidate=${cacheOptions.staleWhileRevalidate}`,
  ].join(", ");

  response.headers.set("Cache-Control", cacheControl);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

/**
 * Creates a cached response with ETag support
 */
export function createCachedResponse(
  data: unknown,
  options: CacheOptions = {},
) {
  const response = NextResponse.json(data);
  return withCache(response, options);
}

/**
 * In-memory cache for API responses (development/single-instance use)
 * For production, consider using Redis or similar
 */
class APIResponseCache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private ttl: number; // milliseconds

  constructor(ttlSeconds: number = 60) {
    this.ttl = ttlSeconds * 1000;
  }

  set(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  has(key: string): boolean {
    const data = this.get(key);
    return data !== null;
  }
}

export const apiCache = new APIResponseCache(60); // 60 second TTL
