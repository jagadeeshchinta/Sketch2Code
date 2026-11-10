// ============================================================================
// POST /api/voice — WhiteboardOS Voice Studio API
// Dual-Mode Voice Pipeline:
// 1. Audio Ingestion -> Gnani AI Prisma STT v3 (Speech-to-Text)
// 2. Transcribed Prompt -> Google Gemini Multimodal Living Prototype Synthesizer
// 3. Spoken Feedback -> Gnani AI Timbre TTS v2.5 (Text-to-Speech)
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { synthesizeVoiceUI } from "@/lib/gemini"
import { generateWireframeFromVoicePrompt } from "@/lib/voice-wireframe-generator"
import { transcribeWithGnaniStt, synthesizeWithGnaniTts, GnaniLanguageCode } from "@/lib/gnani"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get("text")
  const language = searchParams.get("lang") || "en-IN"
  const voice = (searchParams.get("voice") as "Nalini" | "Pranav") || "Nalini"

  if (!text) {
    return NextResponse.json({
      service: "WhiteboardOS Gnani Voice Studio",
      stt: "Gnani Prisma v3.0",
      tts: "Gnani Timbre v2.5",
      status: "active",
    })
  }

  try {
    const audioBuffer = await synthesizeWithGnaniTts({
      text,
      language,
      voice,
    })

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || "TTS synthesis failed",
        fallback_to_speech_synthesis: true,
      },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let promptText = ""
    let languageCode: GnaniLanguageCode = "indic-auto"
    let transcribeOnly = false
    let sttMetadata: any = null

    // ──────────────────────────────────────────────────────────────────────────
    // CASE A: Audio File via multipart/form-data (Gnani STT v3)
    // ──────────────────────────────────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const audioFile = (formData.get("audio") || formData.get("audio_file")) as File | null
      const requestedLang = formData.get("language_code") as string | null
      const isTranscribeOnly = formData.get("transcribe_only") === "true"

      if (requestedLang) {
        languageCode = requestedLang as GnaniLanguageCode
      }
      transcribeOnly = isTranscribeOnly

      if (!audioFile) {
        return NextResponse.json(
          { error: "No audio file provided in form-data payload." },
          { status: 400 }
        )
      }

      const audioBytes = await audioFile.arrayBuffer()
      const audioBuffer = Buffer.from(audioBytes)

      // Transcribe using Gnani AI Prisma STT
      try {
        const sttResult = await transcribeWithGnaniStt(audioBuffer, audioFile.name || "recording.wav", {
          languageCode,
          model: "prisma-v3.0",
          format: "codemix",
        })

        if (!sttResult.transcript || !sttResult.transcript.trim()) {
          return NextResponse.json(
            {
              error: "Gnani STT returned empty transcript. Please speak clearly into the microphone.",
              fallback_to_webspeech: true,
            },
            { status: 422 }
          )
        }

        promptText = sttResult.transcript.trim()
        sttMetadata = {
          source: "gnani-stt",
          model: sttResult.model || "prisma-v3.0",
          detected_language_code: sttResult.detected_language_code || languageCode,
          latency: sttResult.end_to_end_latency,
        }

        // If client only requested transcription (e.g. Iteration Bar or preview transcript)
        if (transcribeOnly) {
          return NextResponse.json({
            success: true,
            transcript: promptText,
            stt: sttMetadata,
          })
        }
      } catch (sttError: any) {
        console.error("[Voice API] Gnani STT processing failed:", sttError?.message)
        return NextResponse.json(
          {
            error: sttError?.message || "Gnani STT transcription failed",
            fallback_to_webspeech: true,
          },
          { status: 502 }
        )
      }
    }
    // ──────────────────────────────────────────────────────────────────────────
    // CASE B: JSON Request (TTS Action, Text prompt, or Base64 audio)
    // ──────────────────────────────────────────────────────────────────────────
    else {
      const body = await request.json()

      // B1: Gnani Text-to-Speech (TTS) Action
      if (body.action === "tts") {
        const text = body.text
        const lang = body.language || "en-IN"
        const voice = body.voice || "Nalini"

        if (!text || typeof text !== "string" || !text.trim()) {
          return NextResponse.json({ error: "Missing text for TTS" }, { status: 400 })
        }

        try {
          const audioBuffer = await synthesizeWithGnaniTts({
            text: text.trim(),
            language: lang,
            voice,
          })

          return new Response(audioBuffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/wav",
              "Cache-Control": "public, max-age=3600",
            },
          })
        } catch (ttsErr: any) {
          return NextResponse.json(
            {
              error: ttsErr?.message || "Gnani TTS synthesis failed",
              fallback_to_speech_synthesis: true,
            },
            { status: 502 }
          )
        }
      }

      // B2: Audio sent as Base64 string
      if (body.audioBase64) {
        if (body.language_code) languageCode = body.language_code
        transcribeOnly = Boolean(body.transcribe_only)

        const base64Clean = body.audioBase64.replace(/^data:audio\/[^;]+;base64,/, "")
        const audioBuffer = Buffer.from(base64Clean, "base64")

        try {
          const sttResult = await transcribeWithGnaniStt(audioBuffer, "recording.wav", {
            languageCode,
            model: "prisma-v3.0",
            format: "codemix",
          })

          promptText = sttResult.transcript?.trim() || ""
          sttMetadata = {
            source: "gnani-stt",
            model: sttResult.model || "prisma-v3.0",
            detected_language_code: sttResult.detected_language_code || languageCode,
            latency: sttResult.end_to_end_latency,
          }

          if (transcribeOnly) {
            return NextResponse.json({
              success: true,
              transcript: promptText,
              stt: sttMetadata,
            })
          }
        } catch (sttErr: any) {
          console.error("[Voice API] Gnani Base64 STT failed:", sttErr?.message)
          return NextResponse.json(
            {
              error: sttErr?.message || "Gnani STT transcription failed",
              fallback_to_webspeech: true,
            },
            { status: 502 }
          )
        }
      }
      // B3: Direct text prompt (from existing workflow or sample chips)
      else if (body.prompt) {
        promptText = body.prompt.trim()
      }
    }

    if (!promptText) {
      return NextResponse.json(
        { error: "No voice prompt or audio provided." },
        { status: 400 }
      )
    }

    const cleanPrompt = promptText

    // ──────────────────────────────────────────────────────────────────────────
    // Step 2: Feed Transcribed Prompt into Existing Gemini Synthesis Engine
    // ──────────────────────────────────────────────────────────────────────────
    try {
      const aiResponse = await synthesizeVoiceUI(cleanPrompt)
      if (aiResponse && aiResponse.components && aiResponse.code) {
        const localFallback = generateWireframeFromVoicePrompt(cleanPrompt)
        return NextResponse.json({
          success: true,
          source: "gemini-ai",
          stt: sttMetadata,
          prompt: cleanPrompt,
          title: aiResponse.title || localFallback.title,
          category: aiResponse.category || "AI Voice Synthesis",
          svgDataUrl: aiResponse.svg || localFallback.svgDataUrl,
          analysis: {
            components: aiResponse.components,
            layout: aiResponse.layout || localFallback.analysis.layout,
            overallConfidence: 0.98,
            description: aiResponse.description || `AI Synthesized from voice: "${cleanPrompt}"`,
            suggestions: [
              `Transcribed via Gnani AI Prisma STT: "${cleanPrompt}"`,
              "Synthesized prototype with Liquid Glass tokens and responsive structure",
            ],
          },
          code: aiResponse.code,
        })
      }
    } catch (geminiError: any) {
      console.warn("[Voice API] Gemini synthesis cascade failed, using local semantic engine fallback:", geminiError?.message)
    }

    // Step 3: Local Semantic Engine Fallback (Guarantees zero-failure output)
    const localResult = generateWireframeFromVoicePrompt(cleanPrompt)
    return NextResponse.json({
      success: true,
      source: "semantic-engine",
      stt: sttMetadata,
      prompt: cleanPrompt,
      title: localResult.title,
      svgDataUrl: localResult.svgDataUrl,
      analysis: localResult.analysis,
      code: localResult.offlineCode,
    })
  } catch (error: any) {
    console.error("[Voice API] Unhandled error:", error)
    return NextResponse.json(
      { error: error?.message || "Voice processing failed" },
      { status: 500 }
    )
  }
}
