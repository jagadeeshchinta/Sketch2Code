// ============================================================================
// POST /api/generate/stream — Robust Multi-Engine SSE Code Streamer
// Streams tokens from Gemini when online, or streams dynamic compiled tokens
// gracefully when offline or rate-limited.
// ============================================================================

import { NextRequest } from "next/server"
import { generateCodeStream } from "@/lib/gemini"
import { generateOfflineCode } from "@/lib/offline-heuristic"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { components, layout } = body

    if (!components) {
      return new Response(JSON.stringify({ error: "Missing components data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const componentsArray = Array.isArray(components) ? components : []
    const componentsStr = typeof components === "string" ? components : JSON.stringify(components, null, 2)
    const layoutStr = typeof layout === "string" ? layout : JSON.stringify(layout, null, 2)

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        let streamSuccess = false

        // 1. Try Gemini Cloud AI Streaming
        try {
          const generator = generateCodeStream(componentsStr, layoutStr)
          for await (const chunk of generator) {
            streamSuccess = true
            const data = JSON.stringify({ chunk })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
          controller.enqueue(encoder.encode(`data: {"done": true}\n\n`))
          controller.close()
          return
        } catch (geminiError: any) {
          console.warn("[Stream Route] Cloud AI stream fallback triggered:", geminiError?.message)
        }

        // 2. Graceful Dynamic Synthesis Stream (Fallback / Offline)
        try {
          const compiled = generateOfflineCode(componentsArray, layout)
          const fullOutput = JSON.stringify(compiled, null, 2)
          
          // Stream compiled tokens in realistic bursts (macOS terminal animation)
          const chunkSize = 40
          for (let i = 0; i < fullOutput.length; i += chunkSize) {
            const chunk = fullOutput.slice(i, i + chunkSize)
            const data = JSON.stringify({ chunk })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            // Small micro-delay for realistic streaming feeling
            await new Promise((r) => setTimeout(r, 15))
          }

          controller.enqueue(encoder.encode(`data: {"done": true}\n\n`))
          controller.close()
        } catch (fallbackError: any) {
          console.error("[Stream Route] Fallback stream error:", fallbackError)
          const errorMsg = JSON.stringify({ error: fallbackError?.message || "Stream synthesis failed" })
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
