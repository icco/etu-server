"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { notesService, tagsService, timestampToDate } from "@/lib/grpc/client"

const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
})

const updateNoteSchema = z.object({
  id: z.string(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
})

// Service API key for internal gRPC calls
const GRPC_API_KEY = process.env.GRPC_API_KEY || ""

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user.id
}

export async function createNote(data: { content: string; tags: string[] }) {
  const userId = await requireUser()
  const parsed = createNoteSchema.parse(data)

  const response = await notesService.createNote(
    {
      userId,
      content: parsed.content,
      tags: parsed.tags,
    },
    GRPC_API_KEY
  )

  revalidatePath("/notes")
  return { id: response.note.id }
}

export async function updateNote(data: { id: string; content?: string; tags?: string[] }) {
  const userId = await requireUser()
  const parsed = updateNoteSchema.parse(data)

  await notesService.updateNote(
    {
      userId,
      id: parsed.id,
      content: parsed.content,
      tags: parsed.tags,
      updateTags: parsed.tags !== undefined,
    },
    GRPC_API_KEY
  )

  revalidatePath("/notes")
  return { success: true }
}

export async function deleteNote(id: string) {
  const userId = await requireUser()

  await notesService.deleteNote(
    {
      userId,
      id,
    },
    GRPC_API_KEY
  )

  revalidatePath("/notes")
  return { success: true }
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
    GRPC_API_KEY
  )

  return {
    notes: response.notes.map((note) => ({
      id: note.id,
      content: note.content,
      createdAt: timestampToDate(note.createdAt),
      updatedAt: timestampToDate(note.updatedAt),
      tags: note.tags,
    })),
    total: response.total,
  }
}

export async function getTags() {
  const userId = await requireUser()

  const response = await tagsService.listTags(
    {
      userId,
    },
    GRPC_API_KEY
  )

  return response.tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    count: tag.count,
  }))
}

export async function getStats() {
  const userId = await requireUser()

  // Get all notes to calculate stats
  const response = await notesService.listNotes(
    {
      userId,
      limit: 10000, // Get all notes for stats
      offset: 0,
    },
    GRPC_API_KEY
  )

  const tagsResponse = await tagsService.listTags(
    {
      userId,
    },
    GRPC_API_KEY
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
