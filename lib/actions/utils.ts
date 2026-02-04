"use server"

import { auth } from "@/lib/auth"

/**
 * Get the gRPC API key from environment variables
 * @throws {Error} If GRPC_API_KEY is not set
 */
export function getGrpcApiKey(): string {
  const key = process.env.GRPC_API_KEY
  if (!key) {
    throw new Error("GRPC_API_KEY environment variable is required")
  }
  return key
}

/**
 * Get the current authenticated user's ID
 * @throws {Error} If user is not authenticated
 */
export async function requireUser(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user.id
}
