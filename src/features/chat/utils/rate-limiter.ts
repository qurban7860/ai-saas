interface RateLimitStore {
  requests: number[];
  lastReset: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitStore> = new Map();
  private maxRequests: number;
  private windowMs: number; 

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    let store = this.store.get(key);

    if (!store || now - store.lastReset > this.windowMs) {
      store = {
        requests: [now],
        lastReset: now,
      };
      this.store.set(key, store);
      return true;
    }

    store.requests = store.requests.filter((time) => now - time < this.windowMs);

    if (store.requests.length < this.maxRequests) {
      store.requests.push(now);
      return true;
    }

    return false;
  }

  getRemaining(key: string): number {
    const store = this.store.get(key);
    if (!store) return this.maxRequests;

    const now = Date.now();
    const validRequests = store.requests.filter(
      (time) => now - time < this.windowMs
    );
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(key: string): number {
    const store = this.store.get(key);
    if (!store || store.requests.length === 0) return 0;

    const oldestRequest = Math.min(...store.requests);
    const resetTime = oldestRequest + this.windowMs;
    const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);
    return Math.max(0, secondsUntilReset);
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const sessionRateLimiter = new RateLimiter(50, 60000); 
