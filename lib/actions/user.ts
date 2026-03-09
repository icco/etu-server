"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"
import { userSettingsService, type ImageUpload } from "@/lib/grpc/client"
import { revalidatePath } from "next/cache"
import logger from "@/lib/logger"

function getGrpcApiKey(): string {
  const key = process.env.GRPC_API_KEY
  if (!key) {
    throw new Error("GRPC_API_KEY environment variable is required")
  }
  return key
}

const updateNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
})

const updateNotionKeySchema = z.object({
  notionKey: z.string().optional(),
})

const changePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function updateName(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  const parsed = updateNameSchema.safeParse({
    name: formData.get("name"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await userSettingsService.updateUserSettings(
      {
        userId: session.user.id,
        name: parsed.data.name,
      },
      getGrpcApiKey()
    )

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    logger.error({ error, userId: session.user.id }, "Update name error")
    return { error: "Failed to update name" }
  }
}

export async function updateNotionKey(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  const notionKeyValue = formData.get("notionKey")
  const parsed = updateNotionKeySchema.safeParse({
    notionKey: notionKeyValue === null ? undefined : notionKeyValue,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await userSettingsService.updateUserSettings(
      {
        userId: session.user.id,
        notionKey: parsed.data.notionKey,
      },
      getGrpcApiKey()
    )

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    logger.error({ error, userId: session.user.id }, "Update Notion key error")
    return { error: "Failed to update Notion key" }
  }
}

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
])

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MiB

function estimateBase64Size(base64: string): number {
  const len = base64.length
  if (len === 0) return 0
  let padding = 0
  if (base64.endsWith("==")) {
    padding = 2
  } else if (base64.endsWith("=")) {
    padding = 1
  }
  return (len * 3) / 4 - padding
}

export async function uploadProfileImage(data: { data: string; mimeType: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(data.mimeType)) {
    return { error: "Unsupported image type. Allowed: JPEG, PNG, WebP, GIF" }
  }

  const estimatedBytes = estimateBase64Size(data.data)
  if (estimatedBytes > MAX_PROFILE_IMAGE_BYTES) {
    return { error: "Image exceeds maximum size of 5MB" }
  }

  try {
    const profileImageUpload: ImageUpload = {
      data: Buffer.from(data.data, "base64"),
      mimeType: data.mimeType,
    }

    await userSettingsService.updateUserSettings(
      {
        userId: session.user.id,
        profileImageUpload,
      },
      getGrpcApiKey()
    )

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    logger.error({ error, userId: session.user.id }, "Upload profile image error")
    return { error: "Failed to upload profile image" }
  }
}

export async function clearProfileImage() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  try {
    await userSettingsService.updateUserSettings(
      {
        userId: session.user.id,
        clearProfileImage: true,
      },
      getGrpcApiKey()
    )

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    logger.error({ error, userId: session.user.id }, "Clear profile image error")
    return { error: "Failed to remove profile image" }
  }
}

export async function changePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await userSettingsService.updateUserSettings(
      {
        userId: session.user.id,
        password: parsed.data.password,
      },
      getGrpcApiKey()
    )

    return { success: true }
  } catch (error) {
    logger.error({ error, userId: session.user.id }, "Change password error")
    return { error: "Failed to change password" }
  }
}
