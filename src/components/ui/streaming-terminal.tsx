"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Terminal, FileCode, Check, Loader2, Sparkles } from "lucide-react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"

interface StreamingTerminalProps {
  onComplete?: () => void
  isRealGenerating?: boolean
  realCode?: { html?: string; css?: string; react?: string } | null
  liveStreamText?: string
  className?: string
}

export function StreamingTerminal({
  onComplete,
  isRealGenerating = true,
  realCode,
  liveStreamText = "",
  className,
}: StreamingTerminalProps) {
  const { themeColor } = useThemeColor()
  const [currentFileIdx, setCurrentFileIdx] = React.useState(0)
  const [displayedLines, setDisplayedLines] = React.useState<string[]>([])
  const [currentLineIdx, setCurrentLineIdx] = React.useState(0)
  const terminalRef = React.useRef<HTMLDivElement>(null)

  // Dynamically compute files based on real Gemini code if provided
  const activeFiles = React.useMemo(() => {
    if (realCode && (realCode.html || realCode.css || realCode.react)) {
      const htmlLines = (realCode.html || "").split("\n").filter((l) => l.trim().length > 0)
      const cssLines = (realCode.css || "").split("\n").filter((l) => l.trim().length > 0)
      const reactLines = (realCode.react || "").split("\n").filter((l) => l.trim().length > 0)

      return [
        {
          name: "index.html",
          language: "html",
          lines: htmlLines.length > 0 ? htmlLines.slice(0, 60) : ["<!DOCTYPE html>", "<html>...</html>"],
        },
        {
          name: "styles.css",
          language: "css",
          lines: cssLines.length > 0 ? cssLines.slice(0, 40) : [":root { ... }"],
        },
        {
          name: "Component.jsx",
          language: "javascript",
          lines: reactLines.length > 0 ? reactLines.slice(0, 40) : ["export default function LivingPrototype() { ... }"],
        },
      ]
    }

    if (liveStreamText && liveStreamText.length > 5) {
      let cleanStream = liveStreamText
      const match = liveStreamText.match(/"html"\s*:\s*"([\s\S]*)/i)
      if (match && match[1]) {
        cleanStream = match[1]
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\t/g, "\t")
          .replace(/\\\\/g, "\\")
      }
      const rawLines = cleanStream.split("\n").filter((l) => l.length > 0)
      return [
        {
          name: "index.html (live AI stream)",
          language: "html",
          lines: rawLines.length > 0 ? rawLines : [cleanStream],
        },
      ]
    }

    // Default fast synthetic stream while awaiting network socket
    return [
      {
        name: "index.html",
        language: "html",
        lines: [
          "<!DOCTYPE html>",
          "<html lang=\"en\">",
          "<head>",
          "  <meta charset=\"UTF-8\" />",
          "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
          "  <title>WhiteboardOS Living Prototype</title>",
          "  <link rel=\"stylesheet\" href=\"styles.css\" />",
          "</head>",
          "<body class=\"glass-body\">",
          "  <!-- Gemini Vision Extracted Structure -->",
          "  <header class=\"glass-navbar\">",
          "    <div class=\"brand-logo\">Whiteboard<span>OS</span></div>",
          "    <nav class=\"nav-menu\">",
          "      <a href=\"#features\">Features</a>",
          "      <a href=\"#services\">Services</a>",
          "      <a href=\"#about\" class=\"btn-cta\">About Us</a>",
          "    </nav>",
          "  </header>",
          "  <main class=\"main-container\">",
          "    <section class=\"hero-section\">",
          "      <h1 class=\"hero-title\">Dynamic Synthesized Prototype</h1>",
          "      <p class=\"hero-subtitle\">Real-time compilation from visual contours.</p>",
          "      <div class=\"cta-group\">",
          "        <button class=\"btn-primary\">Button 1 &rarr;</button>",
          "        <button class=\"btn-secondary\">Button 2</button>",
          "      </div>",
          "    </section>",
          "    <section class=\"grid-cards-container\">",
          "      <div class=\"glass-card\"><h3>Card 1</h3></div>",
          "      <div class=\"glass-card\"><h3>Card 2</h3></div>",
          "      <div class=\"glass-card\"><h3>Card 3</h3></div>",
          "      <div class=\"glass-card\"><h3>Card 4</h3></div>",
          "    </section>",
          "  </main>",
          "</body>",
          "</html>",
        ],
      },
      {
        name: "styles.css",
        language: "css",
        lines: [
          ":root {",
          "  --bg-dark: #0a0a12;",
          "  --card-glass: rgba(255, 255, 255, 0.08);",
          "  --accent-primary: #8b5cf6;",
          "  --glass-blur: blur(24px) saturate(180%);",
          "  --specular-border: 1px solid rgba(255, 255, 255, 0.15);",
          "}",
          "body.glass-body {",
          "  margin: 0;",
          "  background: var(--bg-dark);",
          "  color: #ffffff;",
          "}",
          ".glass-card {",
          "  background: var(--card-glass);",
          "  backdrop-filter: var(--glass-blur);",
          "  border: var(--specular-border);",
          "  border-radius: 1.5rem;",
          "  padding: 2rem;",
          "}",
        ],
      },
      {
        name: "Component.jsx",
        language: "javascript",
        lines: [
          "import React, { useState } from 'react'",
          "export default function LivingPrototype() {",
          "  const [active, setActive] = useState(false)",
          "  return (",
          "    <div className=\"min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center\">",
          "      <header className=\"w-full max-w-5xl flex justify-between items-center py-4\">",
          "        <h1 className=\"font-bold text-xl\">Living Prototype</h1>",
          "      </header>",
          "    </div>",
          "  )",
          "}",
        ],
      },
    ]
  }, [realCode, liveStreamText])

  const activeFile = activeFiles[currentFileIdx] || activeFiles[0]

  // Live streaming reflection effect
  React.useEffect(() => {
    if (!activeFile) return

    if (liveStreamText && liveStreamText.length > 5) {
      setDisplayedLines(activeFile.lines)
      return
    }

    if (currentLineIdx < activeFile.lines.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => [...prev, activeFile.lines[currentLineIdx]])
        setCurrentLineIdx((prev) => prev + 1)
      }, 40)
      return () => clearTimeout(timer)
    } else {
      if (currentFileIdx < activeFiles.length - 1) {
        const fileTimer = setTimeout(() => {
          setCurrentFileIdx((prev) => prev + 1)
          setCurrentLineIdx(0)
          setDisplayedLines([])
        }, 300)
        return () => clearTimeout(fileTimer)
      } else {
        if (onComplete) {
          const finishTimer = setTimeout(() => onComplete(), 500)
          return () => clearTimeout(finishTimer)
        }
      }
    }
  }, [currentLineIdx, currentFileIdx, activeFile, activeFiles, liveStreamText, onComplete])

  // Auto-scroll terminal to bottom
  React.useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [displayedLines])

  return (
    <div
      className={cn(
        "w-full max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-black/15 dark:border-white/20 bg-zinc-950 text-white font-mono text-xs backdrop-blur-3xl",
        className
      )}
      style={{
        boxShadow: `0 25px 60px -15px ${themeColor}30, inset 0 1px 1px rgba(255,255,255,0.2)`,
      }}
    >
      {/* ── macOS Window Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900/90 border-b border-white/10 select-none">
        {/* macOS Traffic Dots */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-sm" />
        </div>

        {/* Current Active File Tab Badges */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
          {activeFiles.map((file, idx) => (
            <div
              key={file.name}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-sans font-semibold transition-all",
                idx === currentFileIdx
                  ? "bg-white/15 text-white shadow-sm"
                  : idx < currentFileIdx
                  ? "text-zinc-400"
                  : "text-zinc-600"
              )}
              style={{
                color: idx === currentFileIdx ? themeColor : undefined,
              }}
            >
              {idx < currentFileIdx ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : idx === currentFileIdx ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <FileCode className="w-3 h-3 opacity-40" />
              )}
              <span>{file.name}</span>
            </div>
          ))}
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: themeColor }} />
          <span className="text-[10px] text-zinc-400 font-sans tracking-wide">
            Synthesizing Code...
          </span>
        </div>
      </div>

      {/* ── Terminal Body with Live Code Stream ── */}
      <div
        ref={terminalRef}
        className="p-6 max-h-[380px] min-h-[320px] overflow-y-auto space-y-1.5 scrollbar-thin bg-black/95 text-zinc-300"
      >
        <div className="flex items-center gap-2 text-zinc-500 mb-4 pb-2 border-b border-white/5 font-sans text-[11px]">
          <Terminal className="w-3.5 h-3.5" style={{ color: themeColor }} />
          <span>whiteboardos compile --architecture=liquid-glass --target={activeFile?.name || "code"}</span>
        </div>

        {displayedLines.map((line, idx) => (
          <div key={idx} className="flex items-start gap-4 leading-relaxed">
            <span className="w-6 text-right text-zinc-600 select-none font-mono text-[10px]">
              {idx + 1}
            </span>
            <span
              className={cn(
                "flex-1 font-mono text-xs",
                line.startsWith("<") && "text-violet-300",
                line.includes("class=") && "text-cyan-300",
                line.startsWith("/*") && "text-zinc-500 italic",
                line.includes("{") || line.includes("}") ? "text-amber-300" : ""
              )}
            >
              {line}
            </span>
          </div>
        ))}

        {/* Blinking Terminal Cursor */}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2.5 h-4 ml-10 rounded-xs align-middle"
          style={{ backgroundColor: themeColor }}
        />
      </div>

      {/* ── Terminal Footer Progress Bar ── */}
      <div className="px-6 py-3 bg-zinc-900/90 border-t border-white/10 flex items-center justify-between font-sans text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: themeColor }} />
          <span>
            Compiling <strong className="text-white">{activeFile?.name || "code"}</strong> ({currentFileIdx + 1}/{activeFiles.length})
          </span>
        </div>
        <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: themeColor,
              width: `${((currentFileIdx + 1) / Math.max(1, activeFiles.length)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
