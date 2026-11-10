// ============================================================================
// WhiteboardOS — Gnani.ai Speech-to-Text & Text-to-Speech Server Client
// Verified via official Gnani platform documentation: https://docs.gnani.ai/
// Base URL: https://api.vachana.ai
// STT Endpoint: POST /stt/v3
// TTS Endpoint: POST /api/v1/tts/inference
// Header: X-API-Key-ID: <GNANI_API_KEY>
// ============================================================================

import { GNANI_SUPPORTED_LANGUAGES, GnaniLanguageCode } from "./gnani-constants"

export { GNANI_SUPPORTED_LANGUAGES }
export type { GnaniLanguageCode }

export const GNANI_API_BASE_URL = "https://api.vachana.ai"

export interface GnaniSttOptions {
  languageCode?: string
  model?: "prisma-v3.0" | "prisma-v2.5"
  format?: "transcribe" | "codemix" | "verbatim" | "transliterate"
}

export interface GnaniSttResponse {
  success: boolean
  transcript: string
  detected_language_code?: string
  model?: string
  request_id?: string
  processing_time?: number
  end_to_end_latency?: number
  error?: string
}

export interface GnaniTtsOptions {
  text: string
  voice?: "Nalini" | "Pranav"
  model?: "timbre-v2.5" | "timbre-v3.0"
  language?: string
  speed?: number
  sampleRate?: number
}

/**
 * Safely retrieve GNANI_API_KEY server-side.
 */
export function getGnaniApiKey(): string {
  const key = process.env.GNANI_API_KEY?.trim().replace(/^["']|["']$/g, "")
  if (!key) {
    throw new Error("GNANI_API_KEY is not configured in server environment variables.")
  }
  return key
}

/**
 * Transcribe spoken audio using Gnani AI Prisma REST STT v3
 * Endpoint: POST https://api.vachana.ai/stt/v3
 * Header: X-API-Key-ID: <GNANI_API_KEY>
 */
export async function transcribeWithGnaniStt(
  audioData: Buffer | Uint8Array | Blob,
  fileName: string = "audio.wav",
  options: GnaniSttOptions = {}
): Promise<GnaniSttResponse> {
  const apiKey = getGnaniApiKey()
  const languageCode = options.languageCode || "indic-auto"
  const model = options.model || "prisma-v3.0"
  const format = options.format || "codemix"

  const formData = new FormData()

  if (audioData instanceof Blob) {
    formData.append("audio_file", audioData, fileName)
  } else {
    const uint8 = audioData instanceof Uint8Array ? audioData : new Uint8Array(audioData)
    const blob = new Blob([uint8], { type: "audio/wav" })
    formData.append("audio_file", blob, fileName)
  }

  formData.append("language_code", languageCode)
  formData.append("model", model)
  formData.append("format", format)

  const startTime = Date.now()
  const response = await fetch(`${GNANI_API_BASE_URL}/stt/v3`, {
    method: "POST",
    headers: {
      "X-API-Key-ID": apiKey,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gnani STT API failed (${response.status}): ${errorText}`)
  }

  const result = (await response.json()) as GnaniSttResponse
  if (!result.end_to_end_latency) {
    result.end_to_end_latency = (Date.now() - startTime) / 1000
  }

  return result
}

/**
 * Synthesize speech from text using Gnani AI Timbre TTS REST API
 * Endpoint: POST https://api.vachana.ai/api/v1/tts/inference
 * Header: X-API-Key-ID: <GNANI_API_KEY>
 * Returns raw binary audio buffer (audio/wav)
 */
export async function synthesizeWithGnaniTts(
  options: GnaniTtsOptions
): Promise<ArrayBuffer> {
  const apiKey = getGnaniApiKey()
  const {
    text,
    voice = "Nalini",
    model = "timbre-v2.5",
    language = "en-IN",
    speed = 1.0,
    sampleRate = 24000,
  } = options

  if (!text || !text.trim()) {
    throw new Error("Missing text for Gnani TTS synthesis.")
  }

  const payload = {
    text: text.trim(),
    voice,
    model,
    language,
    speed,
    audio_config: {
      sample_rate: sampleRate,
      encoding: "linear_pcm",
      container: "wav",
    },
  }

  const response = await fetch(`${GNANI_API_BASE_URL}/api/v1/tts/inference`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key-ID": apiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gnani TTS API failed (${response.status}): ${errText}`)
  }

  return await response.arrayBuffer()
}
