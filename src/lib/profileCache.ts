type ProfileCacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const profileCache = new Map<string, ProfileCacheEntry<unknown>>();

export function getCachedProfile<T>(cacheKey: string): T | null {
  const cached = profileCache.get(cacheKey);
  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    profileCache.delete(cacheKey);
    return null;
  }

  return cached.value as T;
}

export function setCachedProfile<T>(
  cacheKey: string,
  value: T,
  ttlMs = 60_000,
) {
  profileCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateCachedProfile(cacheKey: string) {
  profileCache.delete(cacheKey);
}
