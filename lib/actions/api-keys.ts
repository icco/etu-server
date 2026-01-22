"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { apiKeysService, timestampToDate } from "@/lib/grpc/client"

const GRPC_API_KEY = process.env.GRPC_API_KEY || ""

const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user.id
}

export async function createApiKey(name: string) {
  const userId = await requireUser()
  createKeySchema.parse({ name })

  const response = await apiKeysService.createApiKey(
    { userId, name },
    GRPC_API_KEY
  )

  revalidatePath("/settings")

  // Return the raw key only on creation
  return {
    id: response.apiKey.id,
    name: response.apiKey.name,
    key: response.rawKey,
    keyPrefix: response.apiKey.keyPrefix,
    createdAt: timestampToDate(response.apiKey.createdAt),
  }
}

export async function getApiKeys() {
  const userId = await requireUser()

  const response = await apiKeysService.listApiKeys({ userId }, GRPC_API_KEY)

  return response.apiKeys.map((key) => ({
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    createdAt: timestampToDate(key.createdAt),
    lastUsed: key.lastUsed ? timestampToDate(key.lastUsed) : null,
  }))
}

export async function deleteApiKey(id: string) {
  const userId = await requireUser()

  await apiKeysService.deleteApiKey({ userId, keyId: id }, GRPC_API_KEY)

  revalidatePath("/settings")
  return { success: true }
}

// Verify an API key and return the user ID
export async function verifyApiKey(rawKey: string): Promise<string | null> {
  try {
    const response = await apiKeysService.verifyApiKey({ rawKey }, GRPC_API_KEY)
    return response.valid ? (response.userId ?? null) : null
  } catch {
    return null
  }
}
