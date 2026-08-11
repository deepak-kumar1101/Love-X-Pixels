/**
 * Smart In-Memory Cache Manager with TTL & Cache Invalidation
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class AppCache {
  private static store = new Map<string, CacheEntry<unknown>>();

  /** Set item in cache with TTL (default 5 minutes) */
  static set<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    this.store.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  /** Get cached item if valid and not expired */
  static get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /** Invalidate specific cache key or prefix */
  static invalidate(keyOrPrefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        this.store.delete(key);
      }
    }
  }

  /** Clear entire cache */
  static clear(): void {
    this.store.clear();
  }
}
