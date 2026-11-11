"use client"

import * as React from "react"
import { Copy, Check, Code2, Layers, FileCode } from "lucide-react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"
import {
  extractCleanHtml,
  extractCssFromHtml,
  convertHtmlToReact,
  unescapeString,
  extractJsonStringField,
} from "@/lib/code-parser"

interface CodeViewerProps {
  html: string
  css: string
  react: string
  className?: string
}

type TabKey = "html" | "css" | "react"

function extractCleanCss(rawCss: string, cleanHtml: string): string {
  let css = rawCss ? unescapeString(rawCss).trim() : ""

  // Reject spliced JSON, raw JSON wrappers, or invalid fragments
  if (
    !css ||
    css.startsWith("{") ||
    css.includes('"html"') ||
    css.includes("-webkit-{") ||
    css.includes("included in HTML") ||
    css.length < 25
  ) {
    return extractCssFromHtml(cleanHtml)
  }

  if (css.includes("\\n")) {
    css = unescapeString(css)
  }

  return css.trim()
}

function extractCleanReact(rawReact: string, cleanHtml: string): string {
  let react = rawReact ? unescapeString(rawReact).trim() : ""

  // Reject raw JSON wrappers, comment-wrapped JSON, or invalid fragments
  if (
    !react ||
    react.startsWith("{") ||
    react.includes('"html"') ||
    react.includes("<!--{") ||
    react.includes("not generated") ||
    react.length < 30
  ) {
    return convertHtmlToReact(cleanHtml)
  }

  if (react.includes("\\n")) {
    react = unescapeString(react)
  }

  return react.trim()
}

export function CodeViewer({ html, css, react, className }: CodeViewerProps) {
  const { themeColor } = useThemeColor()
  const [activeTab, setActiveTab] = React.useState<TabKey>("html")
  const [copied, setCopied] = React.useState(false)

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "html", label: "HTML", icon: <Code2 className="w-3.5 h-3.5" /> },
    { key: "css", label: "CSS", icon: <Layers className="w-3.5 h-3.5" /> },
    { key: "react", label: "React", icon: <FileCode className="w-3.5 h-3.5" /> },
  ]

  // Formatted clean outputs
  const cleanHtml = React.useMemo(() => extractCleanHtml(html), [html])
  const cleanCss = React.useMemo(() => extractCleanCss(css, cleanHtml), [css, cleanHtml])
  const cleanReact = React.useMemo(() => extractCleanReact(react, cleanHtml), [react, cleanHtml])

  const codeMap: Record<TabKey, string> = {
    html: cleanHtml,
    css: cleanCss,
    react: cleanReact,
  }
  const currentCode = codeMap[activeTab]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = currentCode
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className={cn(
        "rounded-3xl overflow-hidden border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur-2xl flex flex-col shadow-2xl",
        className
      )}
    >
      {/* ── macOS Code Editor Top Chrome ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all font-sans",
                activeTab === tab.key
                  ? "bg-white dark:bg-white/20 text-zinc-950 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              )}
              style={{
                color: activeTab === tab.key ? themeColor : undefined,
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/10 transition-all font-sans shadow-sm"
          style={{
            color: copied ? themeColor : undefined,
            borderColor: copied ? `${themeColor}40` : undefined,
          }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy Code"}</span>
        </button>
      </div>

      {/* ── Clean Code Display with Syntax Pacing ── */}
      <div className="relative flex-1 max-h-[420px] min-h-[380px] overflow-auto bg-zinc-950 text-zinc-200 scrollbar-thin">
        <pre className="p-6 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words">
          <code>{currentCode || "// No code generated yet"}</code>
        </pre>
      </div>
    </div>
  )
}
