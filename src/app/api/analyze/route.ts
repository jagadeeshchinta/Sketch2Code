// ============================================================================
// POST /api/analyze — Receive sketch image, return detected components
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { analyzeSketch } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let base64 = ""
    let mimeType = "image/png"

    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await request.formData()
      const file = formData.get("image") as File | null

      if (!file) {
        return NextResponse.json(
          { error: "No image file provided" },
          { status: 400 }
        )
      }

      mimeType = file.type || "image/png"
      const bytes = await file.arrayBuffer()
      base64 = Buffer.from(bytes).toString("base64")
    } else {
      // Default to JSON parsing (data URLs from webcam, uploads, canvas)
      const body = await request.json()
      if (!body.image) {
        return NextResponse.json(
          { error: "No image provided in JSON body" },
          { status: 400 }
        )
      }

      const dataUrl = body.image
      // Extract base64 and mime type from data:image/png;base64,...
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      if (matches && matches.length === 3) {
        mimeType = matches[1]
        base64 = matches[2]
      } else {
        base64 = dataUrl
      }
    }

    // Call Multi-Model Cascading Gemini Vision API
    const analysis = await analyzeSketch(base64, mimeType)
    return NextResponse.json(analysis)
  } catch (error: unknown) {
    console.error("Analysis error:", error)
    const message = error instanceof Error ? error.message : "Analysis failed"

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "API key not configured. Set GEMINI_API_KEY in .env" },
        { status: 500 }
      )
    }

    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment and try again." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Failed to analyze sketch", details: message },
      { status: 500 }
    )
  }
}
