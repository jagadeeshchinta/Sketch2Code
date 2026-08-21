// ============================================================================
// POST /api/generate/stream — Stream real-time code generation from Gemini
// ============================================================================

import { NextRequest } from "next/server"
import { generateCodeStream } from "@/lib/gemini"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { components, layout } = body

    if (!components || !layout) {
      return new Response(JSON.stringify({ error: "Missing components or layout data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const componentsStr = typeof components === "string" ? components : JSON.stringify(components, null, 2)
    const layoutStr = typeof layout === "string" ? layout : JSON.stringify(layout, null, 2)

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateCodeStream(componentsStr, layoutStr)
          for await (const chunk of generator) {
            const data = JSON.stringify({ chunk })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
          controller.enqueue(encoder.encode(`data: {"done": true}\n\n`))
          controller.close()
        } catch (err: any) {
          console.error("Stream generation error:", err)
          const errorMsg = JSON.stringify({ error: err?.message || "Stream generation failed" })
          controller.enqueue(encoder.encode(`data: ${errorMsg}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("Stream setup error:", error)
    return new Response(JSON.stringify({ error: error?.message || "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
