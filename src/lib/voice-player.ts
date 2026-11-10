// ============================================================================
// WhiteboardOS — Gnani AI Voice Response Player
// Dual engine: Gnani AI Timbre TTS (Primary) -> Web Speech Synthesis (Fallback)
// ============================================================================

"use client"

let currentAudio: HTMLAudioElement | null = null

export function isVoiceMuted(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("whiteboardos_voice_mute") === "true"
}

export function setVoiceMuted(muted: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem("whiteboardos_voice_mute", muted ? "true" : "false")
  if (muted) {
    stopVoiceResponse()
  }
}

export function stopVoiceResponse(): void {
  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.currentTime = 0
    } catch (e) {}
    currentAudio = null
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel()
    } catch (e) {}
  }
}

/**
 * Play spoken feedback response from AI using Gnani Timbre TTS with Web Speech fallback
 */
export async function playVoiceResponse(text: string, language: string = "en-IN"): Promise<void> {
  if (typeof window === "undefined" || !text || isVoiceMuted()) return

  stopVoiceResponse()

  // 1. Try Gnani AI Timbre TTS API
  try {
    const res = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "tts",
        text: text.slice(0, 200), // Clean conversational summary
        language,
        voice: "Nalini",
      }),
    })

    if (res.ok && res.headers.get("content-type")?.includes("audio")) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      currentAudio = audio
      audio.onended = () => {
        URL.revokeObjectURL(url)
        currentAudio = null
      }
      await audio.play()
      return
    }
  } catch (err) {
    console.warn("[VoicePlayer] Gnani TTS stream unavailable, using browser speech synthesis fallback:", err)
  }

  // 2. Resilient Browser Web Speech Synthesis Fallback
  if (window.speechSynthesis) {
    try {
      const cleanText = text.replace(/<[^>]+>/g, "").slice(0, 150)
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = language === "hi-IN" ? "hi-IN" : "en-IN"
      utterance.rate = 1.05
      utterance.pitch = 1.0

      const voices = window.speechSynthesis.getVoices()
      const indianVoice = voices.find((v) => v.lang.includes("IN") || v.name.includes("India"))
      if (indianVoice) {
        utterance.voice = indianVoice
      }

      window.speechSynthesis.speak(utterance)
    } catch (speechErr) {
      console.warn("[VoicePlayer] Speech synthesis error:", speechErr)
    }
  }
}

