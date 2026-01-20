import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyApiKey } from "@/lib/actions/api-keys"
import type { Prisma } from "@prisma/client"

async function authenticateRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("Authorization")
  
  if (!authHeader || !authHeader.startsWith("etu_")) {
    return null
  }

  const apiKey = authHeader.trim()
  return await verifyApiKey(apiKey)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateRequest(req)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid API key in the Authorization header." },
        { status: 401 }
      )
    }

    const { id } = await params

    const note = await db.note.findFirst({
      where: { id, userId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    })

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      tags: note.tags.map((t: { tag: { name: string } }) => t.tag.name),
    })
  } catch (error) {
    console.error("GET /api/v1/notes/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateRequest(req)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid API key in the Authorization header." },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { content, tags } = body

    // Verify ownership
    const existing = await db.note.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      )
    }

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update content if provided
      if (content !== undefined) {
        if (typeof content !== "string") {
          throw new Error("Content must be a string")
        }
        await tx.note.update({
          where: { id },
          data: { content },
        })
      }

      // Update tags if provided
      if (tags !== undefined) {
        if (!Array.isArray(tags)) {
          throw new Error("Tags must be an array")
        }

        // Remove existing tags
        await tx.noteTag.deleteMany({ where: { noteId: id } })

        // Add new tags
        for (const tagName of tags) {
          if (typeof tagName !== "string") continue

          const tag = await tx.tag.upsert({
            where: { userId_name: { userId, name: tagName } },
            update: {},
            create: { name: tagName, userId },
          })

          await tx.noteTag.create({
            data: { noteId: id, tagId: tag.id },
          })
        }
      }
    })

    // Fetch updated note
    const note = await db.note.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    })

    return NextResponse.json({
      id: note!.id,
      content: note!.content,
      createdAt: note!.createdAt,
      updatedAt: note!.updatedAt,
      tags: note!.tags.map((t: { tag: { name: string } }) => t.tag.name),
    })
  } catch (error) {
    console.error("PUT /api/v1/notes/[id] error:", error)
    
    if (error instanceof Error && error.message.includes("must be")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateRequest(req)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid API key in the Authorization header." },
        { status: 401 }
      )
    }

    const { id } = await params

    const note = await db.note.findFirst({
      where: { id, userId },
    })

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      )
    }

    await db.note.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/v1/notes/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
