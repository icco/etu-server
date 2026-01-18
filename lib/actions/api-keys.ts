"use server"

import { z } from "zod"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

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

function generateApiKey(): string {
  return "etu_" + crypto.randomBytes(32).toString("hex")
}

export async function createApiKey(name: string) {
  const userId = await requireUser()
  createKeySchema.parse({ name })

  const rawKey = generateApiKey()
  const keyHash = await bcrypt.hash(rawKey, 10)
  const keyPrefix = rawKey.substring(0, 12)

  const apiKey = await db.apiKey.create({
    data: {
      name,
      keyHash,
      keyPrefix,
      userId,
    },
  })

  revalidatePath("/settings")

  // Return the raw key only on creation
  return {
    id: apiKey.id,
    name: apiKey.name,
    key: rawKey,
    keyPrefix,
    createdAt: apiKey.createdAt,
  }
}

export async function getApiKeys() {
  const userId = await requireUser()

  const keys = await db.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsed: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return keys
}

export async function deleteApiKey(id: string) {
  const userId = await requireUser()

  const key = await db.apiKey.findFirst({
    where: { id, userId },
  })

  if (!key) {
    throw new Error("API key not found")
  }

  await db.apiKey.delete({ where: { id } })

  revalidatePath("/settings")
  return { success: true }
}

// Verify an API key and return the user ID
export async function verifyApiKey(rawKey: string): Promise<string | null> {
  const keyPrefix = rawKey.substring(0, 12)

  const keys = await db.apiKey.findMany({
    where: { keyPrefix },
    select: { id: true, userId: true, keyHash: true },
  })

  for (const key of keys) {
    const valid = await bcrypt.compare(rawKey, key.keyHash)
    if (valid) {
      // Update last used
      await db.apiKey.update({
        where: { id: key.id },
        data: { lastUsed: new Date() },
      })
      return key.userId
    }
  }

  return null
}
