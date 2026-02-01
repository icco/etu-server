"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { notesService, tagsService, timestampToDate, type ImageUpload } from "@/lib/grpc/client"

const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
})

const updateNoteSchema = z.object({
  id: z.string(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
})

// Image upload constraints
const ALLOWED_IMAGE_MIME_TYPES = new Set<string>([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
])

const MAX_IMAGE_UPLOAD_COUNT = 10
// Aligned with Next server action bodySizeLimit: '10mb' (accounting for base64 ~33% overhead)
const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MiB per image

// Estimate decoded bytes from a base64 string without fully decoding
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

// Helper to convert base64 image data to ImageUpload format
function parseImageUploads(images?: { data: string; mimeType: string }[]): ImageUpload[] {
  if (!images || images.length === 0) return []

  if (images.length > MAX_IMAGE_UPLOAD_COUNT) {
    throw new Error("Too many images uploaded")
  }

  return images.map((img) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(img.mimeType)) {
      throw new Error("Unsupported image MIME type")
    }

    const estimatedBytes = estimateBase64Size(img.data)
    if (estimatedBytes > MAX_IMAGE_UPLOAD_BYTES) {
      throw new Error("Image upload exceeds maximum allowed size")
    }

    // Use Buffer.from for more efficient base64 decoding on server
    const buffer = Buffer.from(img.data, "base64")

    return {
      data: new Uint8Array(buffer),
      mimeType: img.mimeType,
    }
  })
}

// Service API key for internal gRPC calls
function getGrpcApiKey(): string {
  const key = process.env.GRPC_API_KEY
  if (!key) {
    throw new Error("GRPC_API_KEY environment variable is required")
  }
  return key
}

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user.id
}

export async function createNote(data: {
  content: string
  tags: string[]
  images?: { data: string; mimeType: string }[]
}) {
  const userId = await requireUser()
  const parsed = createNoteSchema.parse(data)

  const response = await notesService.createNote(
    {
      userId,
      content: parsed.content,
      tags: parsed.tags,
      images: parseImageUploads(data.images),
    },
    getGrpcApiKey()
  )

  revalidatePath("/notes")
  revalidatePath("/")
  return { id: response.note.id }
}

export async function updateNote(data: {
  id: string
  content?: string
  tags?: string[]
  addImages?: { data: string; mimeType: string }[]
}) {
  const userId = await requireUser()
  const parsed = updateNoteSchema.parse(data)

  await notesService.updateNote(
    {
      userId,
      id: parsed.id,
      content: parsed.content,
      tags: parsed.tags,
      updateTags: parsed.tags !== undefined,
      addImages: parseImageUploads(data.addImages),
    },
    getGrpcApiKey()
  )

  revalidatePath("/notes")
  revalidatePath("/")
  return { success: true }
}

export async function deleteNote(id: string) {
  const userId = await requireUser()

  await notesService.deleteNote(
    {
      userId,
      id,
    },
    getGrpcApiKey()
  )

  revalidatePath("/notes")
  revalidatePath("/")
  return { success: true }
}

export async function getNote(id: string) {
  const userId = await requireUser()

  const response = await notesService.getNote(
    {
      userId,
      id,
    },
    getGrpcApiKey()
  )

  return {
    id: response.note.id,
    content: response.note.content,
    createdAt: timestampToDate(response.note.createdAt),
    updatedAt: timestampToDate(response.note.updatedAt),
    tags: response.note.tags,
    images: response.note.images.map((img) => ({
      id: img.id,
      url: img.url,
      extractedText: img.extractedText,
      mimeType: img.mimeType,
      createdAt: img.createdAt ? timestampToDate(img.createdAt) : undefined,
    })),
  }
}

export async function getNotes(options?: {
  search?: string
  tags?: string[]
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  const userId = await requireUser()

  const response = await notesService.listNotes(
    {
      userId,
      search: options?.search,
      tags: options?.tags,
      startDate: options?.startDate?.toISOString(),
      endDate: options?.endDate?.toISOString(),
      limit: options?.limit || 50,
      offset: options?.offset || 0,
    },
    getGrpcApiKey()
  )

  return {
    notes: response.notes.map((note) => ({
      id: note.id,
      content: note.content,
      createdAt: timestampToDate(note.createdAt),
      updatedAt: timestampToDate(note.updatedAt),
      tags: note.tags,
      images: note.images.map((img) => ({
        id: img.id,
        url: img.url,
        extractedText: img.extractedText,
        mimeType: img.mimeType,
        createdAt: img.createdAt ? timestampToDate(img.createdAt) : undefined,
      })),
    })),
    total: response.total,
  }
}

export async function getRandomNotes(count: number = 5) {
  const userId = await requireUser()

  try {
    // Use the backend's randomNotes API
    const response = await notesService.getRandomNotes(
      {
        userId,
        count,
      },
      getGrpcApiKey()
    )

    return {
      notes: response.notes.map((note) => ({
        id: note.id,
        content: note.content,
        createdAt: timestampToDate(note.createdAt),
        updatedAt: timestampToDate(note.updatedAt),
        tags: note.tags,
        images: note.images.map((img) => ({
          id: img.id,
          url: img.url,
          extractedText: img.extractedText,
          mimeType: img.mimeType,
          createdAt: img.createdAt ? timestampToDate(img.createdAt) : undefined,
        })),
      })),
    }
  } catch (error: unknown) {
    console.error("Failed to fetch random notes", { userId, count, error })
    // Return empty array on error to prevent page crash
    return { notes: [] }
  }
}

export async function getTags() {
  const userId = await requireUser()

  const response = await tagsService.listTags(
    {
      userId,
    },
    getGrpcApiKey()
  )

  return response.tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    count: tag.count,
  }))
}

export async function getStats() {
  const userId = await requireUser()

  // Get notes to calculate stats
  // NOTE: This fetches up to 10,000 notes client-side. For users with more notes,
  // stats will be incomplete. Consider implementing a backend stats endpoint
  // if this becomes a problem.
  const response = await notesService.listNotes(
    {
      userId,
      limit: 10000,
      offset: 0,
    },
    getGrpcApiKey()
  )

  const tagsResponse = await tagsService.listTags(
    {
      userId,
    },
    getGrpcApiKey()
  )

  // Count words
  const totalWords = response.notes.reduce((acc, note) => {
    return acc + note.content.split(/\s+/).filter((w) => w.length > 0).length
  }, 0)

  // Find first note date
  let firstNoteDate: Date | null = null
  if (response.notes.length > 0) {
    const sorted = [...response.notes].sort((a, b) => {
      const dateA = timestampToDate(a.createdAt)
      const dateB = timestampToDate(b.createdAt)
      return dateA.getTime() - dateB.getTime()
    })
    firstNoteDate = timestampToDate(sorted[0].createdAt)
  }

  return {
    totalNotes: response.total,
    totalTags: tagsResponse.tags.length,
    totalWords,
    firstNoteDate,
  }
}
