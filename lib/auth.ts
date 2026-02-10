import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "./auth.config"
import { authService, timestampToDate } from "./grpc/client"
import logger from "./logger"

function getGrpcApiKey(): string {
  const key = process.env.GRPC_API_KEY
  if (!key) {
    throw new Error("GRPC_API_KEY environment variable is required")
  }
  return key
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        try {
          const response = await authService.authenticate(
            { email, password },
            getGrpcApiKey()
          )

          if (!response.success || !response.user) return null

          return {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            image: response.user.image,
          }
        } catch (error) {
          logger.error({ error }, "Authentication error")
          return null
        }
      },
    }),
  ],
})

// Helper to get current user with subscription info
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null

  try {
    const response = await authService.getUser(
      { userId: session.user.id },
      getGrpcApiKey()
    )

    return {
      id: response.user.id,
      email: response.user.email,
      name: response.user.name ?? null,
      image: response.user.image ?? null,
      subscriptionStatus: response.user.subscriptionStatus,
      subscriptionEnd: response.user.subscriptionEnd
        ? timestampToDate(response.user.subscriptionEnd)
        : null,
      createdAt: timestampToDate(response.user.createdAt),
      updatedAt: response.user.updatedAt
        ? timestampToDate(response.user.updatedAt)
        : null,
      hasNotionKey: Boolean(response.user.notionKey),
    }
  } catch (error) {
    logger.error({ error }, "Get current user error")
    return null
  }
}
