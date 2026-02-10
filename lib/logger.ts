/**
 * Secure logging utility that sanitizes sensitive data
 * Only logs detailed errors in development mode
 */

import { redactSensitiveData } from "./security"

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"

  /**
   * Sanitize log data to remove sensitive information
   */
  private sanitize(data: unknown): unknown {
    if (typeof data === "string") {
      return redactSensitiveData(data)
    }

    if (data instanceof Error) {
      return {
        name: data.name,
        message: this.isDevelopment
          ? redactSensitiveData(data.message)
          : "Error occurred",
        stack: this.isDevelopment ? data.stack : undefined,
      }
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item))
    }

    if (data && typeof data === "object") {
      const sanitized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        // Skip potentially sensitive keys
        if (
          /password|secret|token|key|credential|auth/i.test(key) &&
          !this.isDevelopment
        ) {
          sanitized[key] = "[REDACTED]"
        } else {
          sanitized[key] = this.sanitize(value)
        }
      }
      return sanitized
    }

    return data
  }

  /**
   * Format log message with context
   */
  private format(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    if (context) {
      const sanitizedContext = this.sanitize(context)
      return `${prefix} ${message} ${JSON.stringify(sanitizedContext)}`
    }

    return `${prefix} ${message}`
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(this.format("debug", message, context))
    }
  }

  /**
   * Log info messages
   */
  info(message: string, context?: LogContext) {
    console.log(this.format("info", message, context))
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext) {
    console.warn(this.format("warn", message, context))
  }

  /**
   * Log error messages with sanitization
   */
  error(message: string, error?: unknown, context?: LogContext) {
    const sanitizedError = error ? this.sanitize(error) : undefined
    const fullContext = {
      ...context,
      error: sanitizedError,
    }

    console.error(this.format("error", message, fullContext))
  }

  /**
   * Log security events (always logged, never sanitized)
   */
  security(event: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    console.warn(`[${timestamp}] [SECURITY] ${event}`, context || {})
  }
}

// Singleton instance
const logger = new Logger()

export default logger

// Convenience exports
export const debug = (message: string, context?: LogContext) =>
  logger.debug(message, context)
export const info = (message: string, context?: LogContext) =>
  logger.info(message, context)
export const warn = (message: string, context?: LogContext) =>
  logger.warn(message, context)
export const error = (message: string, err?: unknown, context?: LogContext) =>
  logger.error(message, err, context)
export const security = (event: string, context?: LogContext) =>
  logger.security(event, context)
