type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

type CacheStats = {
  hits: number;
  misses: number;
  entries: number;
  ttlMs: number;
};

export class InMemoryTtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      this.misses += 1;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses += 1;
      return null;
    }

    this.hits += 1;
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  getStats(): CacheStats {
    this.pruneExpired();
    return {
      hits: this.hits,
      misses: this.misses,
      entries: this.store.size,
      ttlMs: this.ttlMs,
    };
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
