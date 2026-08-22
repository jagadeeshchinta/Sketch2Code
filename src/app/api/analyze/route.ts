// ============================================================================
// POST /api/analyze — Receive sketch image, return detected components
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { analyzeSketch } from "@/lib/gemini"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function parseImageData(dataUrl: string): { base64: string; mimeType: string } {
  if (!dataUrl || typeof dataUrl !== "string") {
    throw new Error("Invalid image data")
  }

  // 1. Base64 Data URL (e.g. data:image/png;base64,iVBORw0...)
  const base64Match = dataUrl.match(/^data:([a-zA-Z0-9\/\+\-\.]+);base64,(.+)$/)
  if (base64Match) {
    return {
      mimeType: base64Match[1],
      base64: base64Match[2].trim(),
    }
  }

  // 2. SVG Data URL (utf-8 / raw, e.g. data:image/svg+xml;utf8,<svg...)
  if (dataUrl.startsWith("data:image/svg+xml")) {
    let svgContent = dataUrl.replace(/^data:image\/svg\+xml(?:;utf8|;utf-8)?,?/, "")
    if (svgContent.startsWith(",")) svgContent = svgContent.slice(1)
    const decodedSvg = decodeURIComponent(svgContent)
    return {
      mimeType: "image/svg+xml",
      base64: Buffer.from(decodedSvg, "utf8").toString("base64"),
    }
  }

  // 3. Raw SVG XML string (<svg ...)
  if (dataUrl.trim().startsWith("<svg") || dataUrl.trim().startsWith("<?xml")) {
    return {
      mimeType: "image/svg+xml",
      base64: Buffer.from(dataUrl, "utf8").toString("base64"),
    }
  }

  // 4. Raw base64 string
  return {
    mimeType: "image/png",
    base64: dataUrl.trim(),
  }
}

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
      // JSON body
      const body = await request.json()
      if (!body.image) {
        return NextResponse.json(
          { error: "No image provided in JSON body" },
          { status: 400 }
        )
      }

      const parsed = parseImageData(body.image)
      base64 = parsed.base64
      mimeType = parsed.mimeType
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
