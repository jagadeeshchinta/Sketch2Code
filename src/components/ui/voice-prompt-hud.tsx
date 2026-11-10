"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  X,
  ArrowRight,
  RefreshCw,
  Zap,
  Layers,
  LayoutDashboard,
  CheckCircle2,
  Loader2,
  Globe2,
  AlertCircle,
} from "lucide-react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"
import { useAudioRecorder } from "@/lib/use-audio-recorder"
import { GNANI_SUPPORTED_LANGUAGES, GnaniLanguageCode } from "@/lib/gnani-constants"

interface VoicePromptHudProps {
  isOpen: boolean
  onClose: () => void
  onSynthesizeVoicePrompt: (promptText: string) => void
}

export function VoicePromptHud({
  isOpen,
  onClose,
  onSynthesizeVoicePrompt,
}: VoicePromptHudProps) {
  const { themeColor } = useThemeColor()
  const [selectedLanguage, setSelectedLanguage] = React.useState<GnaniLanguageCode>("indic-auto")
  const [transcript, setTranscript] = React.useState("")
  const [interimText, setInterimText] = React.useState("")
  const [isTranscribing, setIsTranscribing] = React.useState(false)
  const [transcriptionEngine, setTranscriptionEngine] = React.useState<"gnani" | "fallback" | null>(null)
  const [statusMessage, setStatusMessage] = React.useState("")

  const recognitionRef = React.useRef<any>(null)
  const webSpeechTranscriptRef = React.useRef("")

  const {
    isRecording,
    recordingTime,
    error: micError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder()

  // Voice Presets
  const VOICE_PRESETS = [
    {
      label: "Dashboard with Navbar & 4 Cards",
      prompt: "I need a dashboard with a navbar and 4 cards",
      tag: "Gnani / Gemini",
      icon: LayoutDashboard,
      highlight: true,
    },
    {
      label: "Hinglish: Restaurant & Menu Page",
      prompt: "Ek modern restaurant website banao jisme food menu, pricing cards aur reservation booking form ho",
      tag: "Hinglish (Indic)",
      icon: Sparkles,
      highlight: false,
    },
    {
      label: "Modern SaaS Landing Page",
      prompt: "Create a SaaS landing page with hero, pricing cards, and testimonials",
      tag: "SaaS",
      icon: Sparkles,
      highlight: false,
    },
    {
      label: "E-Commerce Product Showcase",
      prompt: "E-commerce store with navbar, product grid, pricing cards, and shopping cart",
      tag: "E-Commerce",
      icon: Layers,
      highlight: false,
    },
  ]

  // Setup Web Speech Recognition as concurrent real-time preview & fallback
  React.useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = selectedLanguage === "hi-IN" ? "hi-IN" : "en-IN"

      recognition.onresult = (event: any) => {
        let finalStr = ""
        let interimStr = ""

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i]
          if (item.isFinal) {
            finalStr += item[0].transcript + " "
          } else {
            interimStr += item[0].transcript
          }
        }

        if (finalStr.trim()) {
          webSpeechTranscriptRef.current = (
            (webSpeechTranscriptRef.current ? `${webSpeechTranscriptRef.current} ` : "") + finalStr.trim()
          ).trim()
        }
        setInterimText(interimStr)
      }

      recognition.onerror = () => {
        // Fallback silently handles error
      }

      recognitionRef.current = recognition
    }

    return () => {
      try {
        recognitionRef.current?.stop()
      } catch (e) {
        // ignore
      }
    }
  }, [selectedLanguage])

  // Handle open / close lifecycle
  React.useEffect(() => {
    if (isOpen) {
      setTranscript("")
      setInterimText("")
      setTranscriptionEngine(null)
      setStatusMessage("")
      webSpeechTranscriptRef.current = ""
    } else {
      cancelRecording()
      try {
        recognitionRef.current?.stop()
      } catch (e) {}
    }
  }, [isOpen, cancelRecording])

  // Start Voice Capture (Gnani Audio Record + Concurrent Web Speech preview)
  const handleStartCapture = async () => {
    setTranscriptionEngine(null)
    setStatusMessage("Listening... Speak your UI vision in English, Hindi, or Hinglish")
    webSpeechTranscriptRef.current = ""

    const started = await startRecording()
    if (started) {
      try {
        recognitionRef.current?.start()
      } catch (e) {
        // recognition might already be active
      }
    }
  }

  // Stop Capture -> Send audio to server-side Gnani STT API
  const handleStopCapture = async () => {
    try {
      recognitionRef.current?.stop()
    } catch (e) {}

    setIsTranscribing(true)
    setStatusMessage("Transcribing audio via Gnani AI Prisma v3.0...")

    const audioBlob = await stopRecording()

    if (!audioBlob || audioBlob.size < 1000) {
      // Audio too short or empty, use Web Speech fallback if available
      const fallbackText = webSpeechTranscriptRef.current.trim() || interimText.trim()
      if (fallbackText) {
        setTranscript(fallbackText)
        setTranscriptionEngine("fallback")
        setStatusMessage("Transcribed via Speech Engine (Gnani fallback active)")
      } else {
        setStatusMessage("Audio too short. Please hold the mic and speak.")
      }
      setIsTranscribing(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "microphone.webm")
      formData.append("language_code", selectedLanguage)
      formData.append("transcribe_only", "true")

      const res = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.success && data.transcript) {
        setTranscript(data.transcript)
        setTranscriptionEngine("gnani")
        setStatusMessage(`Transcribed by Gnani Prisma (${data.stt?.detected_language_code || selectedLanguage}) in ${data.stt?.latency ? data.stt.latency + "s" : "< 1s"}`)
      } else {
        // Gnani returned an error or fallback flag -> gracefully use Web Speech
        console.warn("[VoiceHud] Gnani STT API notice:", data.error)
        const fallbackText = webSpeechTranscriptRef.current.trim() || interimText.trim()
        if (fallbackText) {
          setTranscript(fallbackText)
          setTranscriptionEngine("fallback")
          setStatusMessage("Transcribed via Speech Engine (Gnani fallback active)")
        } else {
          setStatusMessage(data.error || "Could not transcribe audio. You can use quick presets below or type.")
        }
      }
    } catch (netErr: any) {
      console.warn("[VoiceHud] Network error reaching Gnani endpoint, activating Web Speech fallback:", netErr)
      const fallbackText = webSpeechTranscriptRef.current.trim() || interimText.trim()
      if (fallbackText) {
        setTranscript(fallbackText)
        setTranscriptionEngine("fallback")
        setStatusMessage("Transcribed via Speech Engine (Offline fallback)")
      } else {
        setStatusMessage("Failed to reach transcription service. Please try again.")
      }
    } finally {
      setIsTranscribing(false)
      setInterimText("")
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      handleStopCapture()
    } else {
      handleStartCapture()
    }
  }

  const handlePresetClick = (presetPrompt: string) => {
    setTranscript(presetPrompt)
    setInterimText("")
    setTranscriptionEngine("gnani")
    setStatusMessage("Loaded 1-Click preset prompt")
  }

  const handleSubmit = () => {
    const finalPrompt = transcript.trim() || interimText.trim() || "I need a dashboard with a navbar and 4 cards"
    onSynthesizeVoicePrompt(finalPrompt)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xl transition-all"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl rounded-3xl bg-[#0f111a]/95 dark:bg-[#090a0f]/95 border border-white/15 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.6)] backdrop-blur-3xl overflow-hidden text-white"
        >
          {/* Glowing Ambient Top Ring */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: themeColor }}
          />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/15 shadow-inner"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Mic className="w-5 h-5 animate-pulse" style={{ color: themeColor }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Gnani AI Voice Studio
                  </h3>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      borderColor: `${themeColor}40`,
                      color: themeColor,
                    }}
                  >
                    Prisma STT v3
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Speak naturally in English, Hindi, or Hinglish to generate living prototypes
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Language Selection Pills ── */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Gnani STT Language:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GNANI_SUPPORTED_LANGUAGES.slice(0, 6).map((lang) => {
                const isSelected = selectedLanguage === lang.code
                return (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 border",
                      isSelected
                        ? "bg-white/20 text-white shadow-sm"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                    )}
                    style={{
                      borderColor: isSelected ? themeColor : undefined,
                      color: isSelected ? "#fff" : undefined,
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Center Soundwave & Mic Visualizer ── */}
          <div className="flex flex-col items-center justify-center my-3 py-2 space-y-3">
            {/* Interactive Mic Button */}
            <div className="relative flex items-center justify-center">
              {isRecording && (
                <>
                  <div
                    className="absolute w-24 h-24 rounded-full animate-ping opacity-25"
                    style={{ backgroundColor: themeColor }}
                  />
                  <div
                    className="absolute w-20 h-20 rounded-full animate-pulse opacity-40"
                    style={{ backgroundColor: themeColor }}
                  />
                </>
              )}

              <button
                onClick={toggleRecording}
                disabled={isTranscribing}
                className={cn(
                  "relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 border",
                  isRecording
                    ? "border-white/30"
                    : "border-white/10 bg-white/10 hover:bg-white/15 text-zinc-300",
                  isTranscribing && "opacity-75 cursor-wait"
                )}
                style={{
                  backgroundColor: isRecording ? themeColor : undefined,
                  color: isRecording ? "#ffffff" : undefined,
                  boxShadow: isRecording ? `0 0 40px ${themeColor}60` : undefined,
                }}
              >
                {isTranscribing ? (
                  <Loader2 className="w-7 h-7 animate-spin text-white" />
                ) : isRecording ? (
                  <Mic className="w-7 h-7 animate-pulse text-white" />
                ) : (
                  <Mic className="w-7 h-7 text-zinc-300" />
                )}
              </button>
            </div>

            {/* Audio Waveform Bars */}
            <div className="flex items-center gap-1.5 h-7">
              {[40, 70, 90, 60, 100, 80, 50, 95, 75, 45, 85, 65, 90, 55, 70].map((height, i) => (
                <motion.div
                  key={i}
                  animate={
                    isRecording
                      ? {
                          height: [`${height * 0.2}%`, `${height}%`, `${height * 0.3}%`],
                        }
                      : { height: "15%" }
                  }
                  transition={{
                    duration: 0.8 + (i % 5) * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: isRecording ? themeColor : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>

            {/* Listening Indicator text */}
            <div className="text-center">
              <p className="text-xs font-semibold font-sans tracking-wide flex items-center justify-center gap-2">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isRecording ? "bg-red-400 animate-ping" : isTranscribing ? "bg-amber-400 animate-pulse" : "bg-zinc-600"
                  )}
                />
                <span className={isRecording ? "text-red-300 font-bold" : isTranscribing ? "text-amber-300" : "text-zinc-400"}>
                  {isRecording
                    ? `Recording audio (${recordingTime}s)... Click to stop & transcribe`
                    : isTranscribing
                    ? "Transcribing with Gnani Prisma AI..."
                    : "Click microphone to speak your prompt"}
                </span>
              </p>
              {statusMessage && (
                <p className="text-[11px] text-zinc-400 mt-1 font-mono">{statusMessage}</p>
              )}
              {micError && (
                <p className="text-xs text-rose-400 flex items-center justify-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{micError}</span>
                </p>
              )}
            </div>
          </div>

          {/* ── Spoken Transcript Box ── */}
          <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 mb-4 focus-within:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Spoken Intent Transcript
                </span>
                {transcriptionEngine === "gnani" && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    ✓ Gnani STT
                  </span>
                )}
                {transcriptionEngine === "fallback" && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                    ✓ Web Speech Fallback
                  </span>
                )}
              </div>
              {transcript && (
                <button
                  onClick={() => setTranscript("")}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 font-sans"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="min-h-[55px] max-h-[85px] overflow-y-auto">
              {transcript || interimText ? (
                <p className="text-sm font-medium text-white font-sans leading-relaxed">
                  {transcript}{" "}
                  <span className="text-zinc-400 italic">{interimText}</span>
                </p>
              ) : (
                <p className="text-xs text-zinc-500 italic font-sans">
                  &quot;I need a dashboard with a navbar and 4 cards...&quot; or &quot;Restaurant website banao jisme menu ho...&quot;
                </p>
              )}
            </div>
          </div>

          {/* ── Quick Voice Prompt Presets ── */}
          <div className="space-y-1.5 mb-5">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <span>Quick Voice Presets (1-Click Test):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VOICE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset.prompt)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] group",
                    preset.highlight
                      ? "bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-transparent border-indigo-500/40 shadow-sm"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                      style={{
                        backgroundColor: preset.highlight ? `${themeColor}30` : "rgba(255,255,255,0.05)",
                      }}
                    >
                      <preset.icon
                        className="w-3 h-3"
                        style={{ color: preset.highlight ? themeColor : "#cbd5e1" }}
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {preset.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Footer CTA Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 font-sans transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isRecording || isTranscribing}
              className="group relative px-5 py-2 rounded-xl font-bold text-xs shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden flex items-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: themeColor,
                color: themeColor.toLowerCase() === "#ffffff" ? "#000" : "#fff",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesize Blueprint & Code</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
