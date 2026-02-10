/**
 * Account lockout tracking for failed login attempts
 * Implements progressive delays and temporary lockouts
 */

type LockoutEntry = {
  failedAttempts: number
  lockedUntil: number | null
  lastAttempt: number
}

interface LockoutConfig {
  maxAttempts?: number
  lockoutDurationMs?: number
  resetWindowMs?: number
}

class AccountLockoutTracker {
  private store = new Map<string, LockoutEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null

  // Configuration (can be overridden via constructor)
  private readonly MAX_ATTEMPTS: number
  private readonly LOCKOUT_DURATION: number
  private readonly RESET_WINDOW: number

  constructor(config: LockoutConfig = {}) {
    this.MAX_ATTEMPTS = config.maxAttempts ?? 5
    this.LOCKOUT_DURATION = config.lockoutDurationMs ?? 15 * 60 * 1000 // 15 minutes
    this.RESET_WINDOW = config.resetWindowMs ?? 60 * 60 * 1000 // 1 hour

    // Clean up expired entries every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 10 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      // Remove entries that are no longer locked and haven't had attempts recently
      if (
        (!entry.lockedUntil || entry.lockedUntil < now) &&
        now - entry.lastAttempt > this.RESET_WINDOW
      ) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Check if an account is currently locked
   * @param identifier - Email or user identifier
   * @returns object with isLocked status and time until unlock
   */
  isLocked(identifier: string): { isLocked: boolean; unlockAt: number | null } {
    const entry = this.store.get(identifier)
    if (!entry || !entry.lockedUntil) {
      return { isLocked: false, unlockAt: null }
    }

    const now = Date.now()
    if (entry.lockedUntil > now) {
      return { isLocked: true, unlockAt: entry.lockedUntil }
    }

    // Lock expired, reset the entry
    this.reset(identifier)
    return { isLocked: false, unlockAt: null }
  }

  /**
   * Record a failed login attempt
   * @param identifier - Email or user identifier
   * @returns object with lockout status and remaining attempts
   */
  recordFailedAttempt(identifier: string): {
    isLocked: boolean
    remainingAttempts: number
    unlockAt: number | null
  } {
    const now = Date.now()
    const entry = this.store.get(identifier) || {
      failedAttempts: 0,
      lockedUntil: null,
      lastAttempt: now,
    }

    // If last attempt was more than reset window ago, reset counter
    if (now - entry.lastAttempt > this.RESET_WINDOW) {
      entry.failedAttempts = 0
      entry.lockedUntil = null
    }

    // Increment failed attempts
    entry.failedAttempts++
    entry.lastAttempt = now

    // Check if we should lock the account
    if (entry.failedAttempts >= this.MAX_ATTEMPTS) {
      entry.lockedUntil = now + this.LOCKOUT_DURATION
      this.store.set(identifier, entry)
      return {
        isLocked: true,
        remainingAttempts: 0,
        unlockAt: entry.lockedUntil,
      }
    }

    this.store.set(identifier, entry)
    return {
      isLocked: false,
      remainingAttempts: this.MAX_ATTEMPTS - entry.failedAttempts,
      unlockAt: null,
    }
  }

  /**
   * Record a successful login (clears failed attempts)
   * @param identifier - Email or user identifier
   */
  recordSuccessfulLogin(identifier: string) {
    this.reset(identifier)
  }

  /**
   * Reset lockout state for an identifier
   * @param identifier - Email or user identifier
   */
  reset(identifier: string) {
    this.store.delete(identifier)
  }

  /**
   * Get current lockout status without modifying state
   * @param identifier - Email or user identifier
   */
  getStatus(identifier: string): {
    failedAttempts: number
    isLocked: boolean
    unlockAt: number | null
  } {
    const lockStatus = this.isLocked(identifier)
    const entry = this.store.get(identifier)

    return {
      failedAttempts: entry?.failedAttempts || 0,
      isLocked: lockStatus.isLocked,
      unlockAt: lockStatus.unlockAt,
    }
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

  /**
   * Manually trigger cleanup (for testing)
   */
  clearExpired() {
    this.cleanup()
  }
}

// Singleton instance
const accountLockout = new AccountLockoutTracker()

export default accountLockout

// Convenience functions
export function isAccountLocked(identifier: string): {
  isLocked: boolean
  unlockAt: number | null
} {
  return accountLockout.isLocked(identifier)
}

export function recordFailedLogin(identifier: string): {
  isLocked: boolean
  remainingAttempts: number
  unlockAt: number | null
} {
  return accountLockout.recordFailedAttempt(identifier)
}

export function recordSuccessfulLogin(identifier: string) {
  accountLockout.recordSuccessfulLogin(identifier)
}

export function resetAccountLockout(identifier: string) {
  accountLockout.reset(identifier)
}

export function getAccountLockoutStatus(identifier: string): {
  failedAttempts: number
  isLocked: boolean
  unlockAt: number | null
} {
  return accountLockout.getStatus(identifier)
}
