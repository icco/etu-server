/**
 * Security utilities for CSRF protection and origin verification
 */

/**
 * Verify that the request origin matches the expected host
 * Prevents CSRF attacks by checking Origin and Referer headers
 * 
 * @param request - NextRequest object
 * @param allowedOrigins - Array of allowed origins (defaults to AUTH_URL)
 * @returns true if origin is valid, false otherwise
 */
export function verifyOrigin(
  request: Request,
  allowedOrigins?: string[]
): boolean {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")

  // Determine allowed origins
  const allowed = allowedOrigins || [process.env.AUTH_URL || ""]
  
  // Remove trailing slashes for comparison
  const normalizedAllowed = allowed.map((o) => o.replace(/\/$/, ""))

  // Check origin header first (preferred)
  if (origin) {
    const normalizedOrigin = origin.replace(/\/$/, "")
    return normalizedAllowed.includes(normalizedOrigin)
  }

  // Fallback to referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`
      return normalizedAllowed.includes(refererOrigin)
    } catch {
      return false
    }
  }

  // No origin or referer header - reject
  return false
}

/**
 * Check if a request comes from the same origin
 * 
 * @param request - NextRequest object
 * @returns true if same origin, false otherwise
 */
export function isSameOrigin(request: Request): boolean {
  const authUrl = process.env.AUTH_URL
  if (!authUrl) {
    return false
  }

  return verifyOrigin(request, [authUrl])
}
