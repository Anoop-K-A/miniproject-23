import { useEffect, useState, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

interface UseFetchOptions {
  ttl?: number; // milliseconds, default 60000 (1 minute)
  skipCache?: boolean;
}

const dataCache = new Map<string, CacheEntry<unknown>>();

/**
 * Custom hook for fetching data with built-in caching
 * Prevents redundant API calls when the same endpoint is requested within the TTL
 */
export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {},
): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  const { ttl = 60000, skipCache = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheKeyRef = useRef(url);

  useEffect(() => {
    const cacheKey = cacheKeyRef.current;

    const fetchData = async () => {
      // Check cache first
      if (!skipCache && dataCache.has(cacheKey)) {
        const cacheEntry = dataCache.get(cacheKey) as CacheEntry<T>;
        const now = Date.now();

        if (now - cacheEntry.timestamp < cacheEntry.ttl) {
          // Cache is still valid
          setData(cacheEntry.data);
          return;
        } else {
          // Cache expired, remove it
          dataCache.delete(cacheKey);
        }
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = (await response.json()) as T;

        // Store in cache
        dataCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl,
        });

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during fetching",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, ttl, skipCache]);

  return { data, loading, error };
}

/**
 * Clear all cached data
 */
export function clearFetchCache(): void {
  dataCache.clear();
}

/**
 * Clear specific cached entry
 */
export function clearFetchCacheEntry(url: string): void {
  dataCache.delete(url);
}
