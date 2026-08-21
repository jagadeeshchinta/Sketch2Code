"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Send, Loader2, Sparkles, Mic, MicOff } from "lucide-react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"

interface IterationBarProps {
  onSubmit: (command: string) => void
  isLoading?: boolean
  className?: string
}

export function IterationBar({ onSubmit, isLoading = false, className }: IterationBarProps) {
  const { themeColor } = useThemeColor()
  const [command, setCommand] = React.useState("")
  const [isListening, setIsListening] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const recognitionRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onresult = (event: any) => {
          let transcript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          setCommand(transcript)
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const toggleMic = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        setIsListening(false)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim() && !isLoading) {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop()
        setIsListening(false)
      }
      onSubmit(command.trim())
      setCommand("")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 p-2 sm:p-3 rounded-2xl",
        "bg-white/80 dark:bg-black/50 backdrop-blur-2xl",
        "border border-black/10 dark:border-white/15",
        "shadow-[0_-8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]",
        className
      )}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-black/10 dark:border-white/10"
        style={{ backgroundColor: `${themeColor}15` }}
      >
        <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder={isListening ? "Listening live to your voice..." : "Describe a change or speak... e.g. 'make buttons neon purple'"}
        disabled={isLoading}
        className={cn(
          "flex-1 bg-transparent text-xs sm:text-sm font-sans text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500",
          "outline-none border-0 focus:ring-0",
          isLoading && "opacity-50"
        )}
      />

      {/* Voice Dictation Mic Button */}
      <button
        type="button"
        onClick={toggleMic}
        title={isListening ? "Stop Voice Dictation" : "Speak Voice Command"}
        className={cn(
          "relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all",
          isListening
            ? "border-red-500/50 bg-red-500/20 text-red-400 animate-pulse"
            : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400"
        )}
      >
        {isListening ? (
          <>
            <span className="absolute w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <Mic className="w-4 h-4 text-red-400 relative z-10" />
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      <motion.button
        type="submit"
        disabled={!command.trim() || isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        )}
        style={{
          backgroundColor: command.trim() ? themeColor : "rgba(128,128,128,0.1)",
          color: command.trim() ? "#fff" : undefined,
        }}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </motion.button>
    </form>
  )
}
