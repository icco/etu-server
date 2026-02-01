"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"
import { userSettingsService } from "@/lib/grpc/client"
import { revalidatePath } from "next/cache"

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

const updateImageSchema = z.object({
  // Allow empty string (to clear) or valid URL
  image: z.union([z.literal(""), z.string().url("Invalid image URL")]),
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
    console.error("Update name error:", error)
    return { error: "Failed to update name" }
  }
}

export async function updateImage(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  const imageValue = formData.get("image")
  const parsed = updateImageSchema.safeParse({
    image: typeof imageValue === "string" ? imageValue : "",
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    // Empty string clears the image, otherwise sets the URL
    await userSettingsService.updateUserSettings(
      {
        userId: session.user.id,
        image: parsed.data.image,
      },
      getGrpcApiKey()
    )

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Update image error:", error)
    return { error: "Failed to update image" }
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
    console.error("Update Notion key error:", error)
    return { error: "Failed to update Notion key" }
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
    console.error("Change password error:", error)
    return { error: "Failed to change password" }
  }
}
