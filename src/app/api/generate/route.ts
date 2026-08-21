// ============================================================================
// POST /api/generate — Convert detected components to code
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { generateCode } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { components, layout } = body

    if (!components || !layout) {
      return NextResponse.json(
        { error: "Missing components or layout data" },
        { status: 400 }
      )
    }

    const componentsStr = typeof components === "string" ? components : JSON.stringify(components, null, 2)
    const layoutStr = typeof layout === "string" ? layout : JSON.stringify(layout, null, 2)

    const code = await generateCode(componentsStr, layoutStr)

    return NextResponse.json(code)
  } catch (error: unknown) {
    console.error("Generation error:", error)
    const message = error instanceof Error ? error.message : "Code generation failed"

    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment and try again." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Failed to generate code", details: message },
      { status: 500 }
    )
  }
}
