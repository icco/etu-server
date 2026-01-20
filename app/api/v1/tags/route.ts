import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyApiKey } from "@/lib/actions/api-keys"

async function authenticateRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("Authorization")
  
  if (!authHeader || !authHeader.startsWith("etu_")) {
    return null
  }

  const apiKey = authHeader.trim()
  return await verifyApiKey(apiKey)
}

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateRequest(req)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid API key in the Authorization header." },
        { status: 401 }
      )
    }

    const tags = await db.tag.findMany({
      where: { userId },
      include: {
        _count: { select: { notes: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        count: tag._count.notes,
        createdAt: tag.createdAt,
      })),
    })
  } catch (error) {
    console.error("GET /api/v1/tags error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
