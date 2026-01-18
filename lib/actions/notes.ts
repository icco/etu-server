"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Prisma } from "@/src/generated/prisma/client"

const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
})

const updateNoteSchema = z.object({
  id: z.string(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
})

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

  const note = await db.$transaction(async (tx) => {
    // Create note
    const note = await tx.note.create({
      data: {
        content: parsed.content,
        userId,
      },
    })

    // Handle tags
    for (const tagName of parsed.tags) {
      // Get or create tag
      const tag = await tx.tag.upsert({
        where: { userId_name: { userId, name: tagName } },
        update: {},
        create: { name: tagName, userId },
      })

      // Link to note
      await tx.noteTag.create({
        data: { noteId: note.id, tagId: tag.id },
      })
    }

    return note
  })

  revalidatePath("/notes")
  return { id: note.id }
}

export async function updateNote(data: { id: string; content?: string; tags?: string[] }) {
  const userId = await requireUser()
  const parsed = updateNoteSchema.parse(data)

  await db.$transaction(async (tx) => {
    // Verify ownership
    const existing = await tx.note.findFirst({
      where: { id: parsed.id, userId },
    })
    if (!existing) throw new Error("Note not found")

    // Update content
    if (parsed.content !== undefined) {
      await tx.note.update({
        where: { id: parsed.id },
        data: { content: parsed.content },
      })
    }

    // Update tags
    if (parsed.tags !== undefined) {
      // Remove existing tags
      await tx.noteTag.deleteMany({ where: { noteId: parsed.id } })

      // Add new tags
      for (const tagName of parsed.tags) {
        const tag = await tx.tag.upsert({
          where: { userId_name: { userId, name: tagName } },
          update: {},
          create: { name: tagName, userId },
        })

        await tx.noteTag.create({
          data: { noteId: parsed.id, tagId: tag.id },
        })
      }
    }
  })

  revalidatePath("/notes")
  return { success: true }
}

export async function deleteNote(id: string) {
  const userId = await requireUser()

  const note = await db.note.findFirst({
    where: { id, userId },
  })

  if (!note) {
    throw new Error("Note not found")
  }

  await db.note.delete({ where: { id } })

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

  const where: Prisma.NoteWhereInput = { userId }

  // Search filter (simple content search)
  if (options?.search) {
    where.content = { contains: options.search, mode: "insensitive" }
  }

  // Date range filter
  if (options?.startDate || options?.endDate) {
    where.createdAt = {}
    if (options.startDate) where.createdAt.gte = options.startDate
    if (options.endDate) where.createdAt.lte = options.endDate
  }

  // Tag filter
  if (options?.tags?.length) {
    where.tags = {
      some: {
        tag: {
          name: { in: options.tags },
        },
      },
    }
  }

  const [notes, total] = await Promise.all([
    db.note.findMany({
      where,
      include: {
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    db.note.count({ where }),
  ])

  return {
    notes: notes.map((note) => ({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      tags: note.tags.map((t) => t.tag.name),
    })),
    total,
  }
}

export async function getTags() {
  const userId = await requireUser()

  const tags = await db.tag.findMany({
    where: { userId },
    include: {
      _count: { select: { notes: true } },
    },
    orderBy: { name: "asc" },
  })

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    count: tag._count.notes,
  }))
}

export async function getStats() {
  const userId = await requireUser()

  const [noteCount, tagCount, notes] = await Promise.all([
    db.note.count({ where: { userId } }),
    db.tag.count({ where: { userId } }),
    db.note.findMany({
      where: { userId },
      select: { content: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 1,
    }),
  ])

  // Count words
  const allNotes = await db.note.findMany({
    where: { userId },
    select: { content: true },
  })

  const totalWords = allNotes.reduce((acc, note) => {
    return acc + note.content.split(/\s+/).filter((w) => w.length > 0).length
  }, 0)

  return {
    totalNotes: noteCount,
    totalTags: tagCount,
    totalWords,
    firstNoteDate: notes[0]?.createdAt || null,
  }
}
