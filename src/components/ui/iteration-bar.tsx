"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Send, Loader2, Sparkles } from "lucide-react"
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
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim() && !isLoading) {
      onSubmit(command.trim())
      setCommand("")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl",
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
        placeholder="Describe a change... e.g. 'add a search bar to the header'"
        disabled={isLoading}
        className={cn(
          "flex-1 bg-transparent text-sm font-sans text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500",
          "outline-none border-0 focus:ring-0",
          isLoading && "opacity-50"
        )}
      />

      <motion.button
        type="submit"
        disabled={!command.trim() || isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
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
