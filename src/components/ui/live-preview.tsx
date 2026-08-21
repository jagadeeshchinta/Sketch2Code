"use client"

import * as React from "react"
import { Monitor, ExternalLink, RefreshCw } from "lucide-react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"

interface LivePreviewProps {
  htmlCode: string
  className?: string
}

function sanitizeHtml(code: string): string {
  if (!code) return ""
  const trimmed = code.trim()

  // 1. If it's a JSON string containing {"html": ...}
  if (trimmed.startsWith("{") && trimmed.includes('"html"')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed.html) return parsed.html
    } catch {
      // Extract with regex
      const match = trimmed.match(/"html"\s*:\s*"([\s\S]*?)"\s*,\s*"(?:css|react)"/i)
      if (match && match[1]) {
        return match[1]
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\t/g, "\t")
          .replace(/\\\\/g, "\\")
      }
    }
  }

  // 2. Extract <!DOCTYPE html> if embedded
  const docMatch = trimmed.match(/<!DOCTYPE html[\s\S]*?<\/html>/i)
  if (docMatch) {
    return docMatch[0]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\")
  }

  return trimmed
}

export function LivePreview({ htmlCode, className }: LivePreviewProps) {
  const { themeColor } = useThemeColor()
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const [key, setKey] = React.useState(0)

  const cleanHtml = React.useMemo(() => sanitizeHtml(htmlCode), [htmlCode])

  React.useEffect(() => {
    if (iframeRef.current && cleanHtml) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(cleanHtml)
        doc.close()
      }
    }
  }, [cleanHtml, key])

  const openInNewTab = () => {
    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(cleanHtml)
      newWindow.document.close()
    }
  }

  return (
    <div
      className={cn(
        "rounded-3xl overflow-hidden border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur-2xl flex flex-col shadow-2xl",
        className
      )}
    >
      {/* Browser Chrome Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-3">
          {/* macOS Traffic Window Dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-sm" />
          </div>
          {/* URL Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 shadow-inner">
            <Monitor className="w-3.5 h-3.5" style={{ color: themeColor }} />
            <span className="text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-300">
              preview://whiteboardos.local
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all hover:scale-105"
            title="Refresh sandbox"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={openInNewTab}
            className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all hover:scale-105"
            title="Open in full tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sandboxed Iframe */}
      <div className="relative flex-1 min-h-[420px] bg-white dark:bg-zinc-950">
        {cleanHtml ? (
          <iframe
            ref={iframeRef}
            key={key}
            className="w-full h-full min-h-[420px] border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Living Prototype Sandbox"
          />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[420px] text-zinc-400 dark:text-zinc-600">
            <div className="text-center space-y-3">
              <Monitor className="w-12 h-12 mx-auto opacity-40 animate-pulse" />
              <p className="text-sm font-sans font-medium">Living Prototype Sandbox Ready</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
