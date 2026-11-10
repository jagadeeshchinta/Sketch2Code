// ============================================================================
// POST /api/iterate — Modify existing code based on user command
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { iterateCode } from "@/lib/gemini"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentCode, command } = body

    if (!currentCode || !command) {
      return NextResponse.json(
        { error: "Missing currentCode or command" },
        { status: 400 }
      )
    }

    if (command.trim().length < 3) {
      return NextResponse.json(
        { error: "Command too short. Please describe what you want to change." },
        { status: 400 }
      )
    }

    const result = await iterateCode(currentCode, command)

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error("Iteration error:", error)
    const message = error instanceof Error ? error.message : "Iteration failed"

    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment and try again." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Failed to iterate code", details: message },
      { status: 500 }
    )
  }
}
