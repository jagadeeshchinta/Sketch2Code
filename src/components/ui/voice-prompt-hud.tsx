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
} from "lucide-react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"

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
  const [isListening, setIsListening] = React.useState(false)
  const [transcript, setTranscript] = React.useState("")
  const [interimText, setInterimText] = React.useState("")
  const [speechSupported, setSpeechSupported] = React.useState(true)
  const recognitionRef = React.useRef<any>(null)

  // Voice Presets
  const VOICE_PRESETS = [
    {
      label: "Dashboard with Navbar & 4 Cards",
      prompt: "I need a dashboard with a navbar and 4 cards",
      tag: "VocalLabs Core",
      icon: LayoutDashboard,
      highlight: true,
    },
    {
      label: "Modern SaaS Landing Page",
      prompt: "Create a SaaS landing page with hero, pricing cards, and testimonials",
      tag: "Conversion",
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

  // Setup Web Speech Recognition
  React.useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSpeechSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

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
        setTranscript((prev) => (prev ? `${prev} ${finalStr}`.trim() : finalStr.trim()))
      }
      setInterimText(interimStr)
    }

    recognition.onerror = (event: any) => {
      console.warn("Voice recognition error:", event)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch (e) {
        // ignore
      }
    }
  }, [])

  // Auto start when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTranscript("")
      setInterimText("")
      startListening()
    } else {
      stopListening()
    }
  }, [isOpen])

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        // Recognition might already be running
        setIsListening(true)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false)
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handlePresetClick = (presetPrompt: string) => {
    setTranscript(presetPrompt)
    setInterimText("")
    stopListening()
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
          className="fixed inset-0 bg-black/70 backdrop-blur-xl transition-all"
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
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
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
                    Voice-to-UI Studio
                  </h3>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      borderColor: `${themeColor}40`,
                      color: themeColor,
                    }}
                  >
                    VocalLabs AI
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Speak naturally to synthesize layout wireframes & living code
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

          {/* ── Center Soundwave & Mic Visualizer ── */}
          <div className="flex flex-col items-center justify-center my-4 py-4 space-y-4">
            
            {/* Interactive Glowing Pulse Button */}
            <div className="relative flex items-center justify-center">
              {isListening && (
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
                onClick={toggleListening}
                className={cn(
                  "relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 border",
                  isListening
                    ? "border-white/30"
                    : "border-white/10 bg-white/10 hover:bg-white/15 text-zinc-300"
                )}
                style={{
                  backgroundColor: isListening ? themeColor : undefined,
                  color: isListening ? "#ffffff" : undefined,
                  boxShadow: isListening ? `0 0 40px ${themeColor}60` : undefined,
                }}
              >
                {isListening ? (
                  <Mic className="w-7 h-7 animate-pulse" />
                ) : (
                  <MicOff className="w-7 h-7 text-zinc-400" />
                )}
              </button>
            </div>

            {/* Simulated Animated Audio Waveform Bars */}
            <div className="flex items-center gap-1.5 h-8">
              {[40, 70, 90, 60, 100, 80, 50, 95, 75, 45, 85, 65, 90, 55, 70].map((height, i) => (
                <motion.div
                  key={i}
                  animate={
                    isListening
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
                    backgroundColor: isListening ? themeColor : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>

            {/* Listening Indicator text */}
            <p className="text-xs font-semibold font-sans tracking-wide flex items-center gap-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isListening ? "bg-emerald-400 animate-ping" : "bg-zinc-600"
                )}
              />
              <span className={isListening ? "text-emerald-300 font-bold" : "text-zinc-400"}>
                {isListening ? "Listening live... Speak your UI vision" : "Microphone paused. Click to speak."}
              </span>
            </p>
          </div>

          {/* ── Spoken Transcript Box ── */}
          <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 mb-5 focus-within:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Spoken Intent Transcript
              </span>
              {transcript && (
                <button
                  onClick={() => setTranscript("")}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 font-sans"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="min-h-[60px] max-h-[100px] overflow-y-auto">
              {transcript || interimText ? (
                <p className="text-sm font-medium text-white font-sans leading-relaxed">
                  {transcript}{" "}
                  <span className="text-zinc-400 italic">{interimText}</span>
                </p>
              ) : (
                <p className="text-xs text-zinc-500 italic font-sans">
                  &quot;I need a dashboard with a navbar and 4 cards...&quot;
                </p>
              )}
            </div>
          </div>

          {/* ── Quick Voice Prompt Presets ── */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <span>Quick Voice Presets (1-Click Test):</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {VOICE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset.prompt)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] group",
                    preset.highlight
                      ? "bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-transparent border-indigo-500/40 shadow-lg"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                      style={{
                        backgroundColor: preset.highlight ? `${themeColor}30` : "rgba(255,255,255,0.05)",
                      }}
                    >
                      <preset.icon
                        className="w-3.5 h-3.5"
                        style={{ color: preset.highlight ? themeColor : "#cbd5e1" }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        &quot;{preset.prompt}&quot;
                      </p>
                    </div>
                  </div>

                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 border"
                    style={{
                      backgroundColor: preset.highlight ? `${themeColor}20` : "rgba(255,255,255,0.05)",
                      borderColor: preset.highlight ? `${themeColor}40` : "rgba(255,255,255,0.1)",
                      color: preset.highlight ? themeColor : "#94a3b8",
                    }}
                  >
                    {preset.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Footer CTA Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 font-sans transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="group relative px-6 py-2.5 rounded-xl font-bold text-xs shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden flex items-center gap-2"
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
