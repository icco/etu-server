"use server"

import { z } from "zod"
import { headers } from "next/headers"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { authService, GrpcError } from "@/lib/grpc/client"
import { Code } from "@connectrpc/connect"
import { isRateLimited, getClientIdentifier } from "@/lib/rate-limit"
import {
  isAccountLocked,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/account-lockout"
import logger from "@/lib/logger"

function getGrpcApiKey(): string {
  const key = process.env.GRPC_API_KEY
  if (!key) {
    throw new Error("GRPC_API_KEY environment variable is required")
  }
  return key
}

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
})

// Helper function to format lockout error message
function formatLockoutMessage(unlockAt: number): string {
  const minutesRemaining = Math.ceil((unlockAt - Date.now()) / (60 * 1000))
  return `Account temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"}.`
}

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data

  // Rate limiting: 5 attempts per minute per IP
  const headersList = await headers()
  const clientId = getClientIdentifier(headersList)
  const rateLimitKey = `register:${clientId}`

  if (isRateLimited(rateLimitKey, 5, 60 * 1000)) {
    logger.security("Registration rate limit exceeded", { clientId, email })
    return { error: "Too many registration attempts. Please try again later." }
  }

  try {
    await authService.register({ email, password }, getGrpcApiKey())
  } catch (error) {
    // Check if it's a "user already exists" error using gRPC status code
    if (error instanceof GrpcError && error.code === Code.AlreadyExists) {
      return { error: "An account with this email already exists" }
    }
    logger.error("Registration error", error, { email })
    return { error: "Failed to create account" }
  }

  // Sign in the new user
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/notes",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Failed to sign in after registration" }
    }
    throw error
  }
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data

  // Check account lockout first
  const lockStatus = isAccountLocked(email)
  if (lockStatus.isLocked && lockStatus.unlockAt) {
    logger.security("Login attempt on locked account", { email })
    return {
      error: formatLockoutMessage(lockStatus.unlockAt),
    }
  }

  // Rate limiting: 5 attempts per minute per IP
  const headersList = await headers()
  const clientId = getClientIdentifier(headersList)
  const rateLimitKey = `login:${clientId}`

  if (isRateLimited(rateLimitKey, 5, 60 * 1000)) {
    logger.security("Login rate limit exceeded", { clientId, email })
    return { error: "Too many login attempts. Please try again later." }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/notes",
    })

    // Successful login - clear any lockout state
    recordSuccessfulLogin(email)
  } catch (error) {
    if (error instanceof AuthError) {
      // Record failed login attempt
      const lockoutStatus = recordFailedLogin(email)

      if (lockoutStatus.isLocked && lockoutStatus.unlockAt) {
        logger.security("Account locked after failed attempts", { email })
        return {
          error: formatLockoutMessage(lockoutStatus.unlockAt),
        }
      }

      switch (error.type) {
        case "CredentialsSignin":
          // Don't reveal remaining attempts to avoid information leakage
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error
  }
}
