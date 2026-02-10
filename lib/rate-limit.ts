/**
 * Rate limiting utility for server actions and API routes
 * Uses in-memory Map-based storage with automatic cleanup
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Check if a request is rate limited
   * @param identifier - Unique identifier (e.g., IP address, user ID, email)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limited, false if allowed
   */
  check(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = this.store.get(identifier)

    // No existing entry or entry expired - allow and create new entry
    if (!entry || entry.resetAt < now) {
      this.store.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      })
      return false
    }

    // Entry exists and not expired
    if (entry.count >= limit) {
      return true // Rate limited
    }

    // Increment counter
    entry.count++
    return false
  }

  /**
   * Get remaining attempts before rate limit
   * @param identifier - Unique identifier
   * @param limit - Maximum number of requests allowed
   * @returns number of remaining attempts
   */
  remaining(identifier: string, limit: number): number {
    const entry = this.store.get(identifier)
    if (!entry || entry.resetAt < Date.now()) {
      return limit
    }
    return Math.max(0, limit - entry.count)
  }

  /**
   * Get time until reset in milliseconds
   * @param identifier - Unique identifier
   * @returns milliseconds until reset, or 0 if no limit active
   */
  timeUntilReset(identifier: string): number {
    const entry = this.store.get(identifier)
    if (!entry) {
      return 0
    }
    const remaining = entry.resetAt - Date.now()
    return Math.max(0, remaining)
  }

  /**
   * Reset rate limit for an identifier
   * @param identifier - Unique identifier
   */
  reset(identifier: string) {
    this.store.delete(identifier)
  }

  /**
   * Manually trigger cleanup (for testing)
   */
  clearExpired() {
    this.cleanup()
  }

  /**
   * Stop cleanup interval (for testing/shutdown)
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

export default rateLimiter

// Convenience functions
export function isRateLimited(
  identifier: string,
  limit: number,
  windowMs: number
): boolean {
  return rateLimiter.check(identifier, limit, windowMs)
}

export function getRemainingAttempts(identifier: string, limit: number): number {
  return rateLimiter.remaining(identifier, limit)
}

export function getTimeUntilReset(identifier: string): number {
  return rateLimiter.timeUntilReset(identifier)
}

export function resetRateLimit(identifier: string) {
  rateLimiter.reset(identifier)
}

// Helper to get client identifier from request headers
export async function getClientIdentifier(headers?: Headers): Promise<string> {
  if (!headers) {
    return "unknown"
  }

  // Try to get real IP from various headers (in order of preference)
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // Fallback
  return "unknown"
}
