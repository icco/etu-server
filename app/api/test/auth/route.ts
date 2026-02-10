import { NextResponse } from "next/server"
import { signIn } from "@/lib/auth"
import { isMockMode } from "@/lib/grpc/mock"
import logger from "@/lib/logger"

// This endpoint is only available in E2E mock mode
// It allows Playwright tests to authenticate without a real backend

export async function POST(request: Request) {
  // Only allow in mock mode
  if (!isMockMode()) {
    return NextResponse.json(
      { error: "Test auth endpoint only available in E2E mock mode" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email = "test@example.com", password = "testpassword" } = body

    // Sign in using NextAuth
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Test auth error", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    mockMode: isMockMode(),
    message: isMockMode()
      ? "E2E mock mode is enabled"
      : "E2E mock mode is disabled",
  })
}
