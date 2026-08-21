"use client"

import * as React from "react"
import { Copy, Check, Code2, Layers, FileCode } from "lucide-react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"

interface CodeViewerProps {
  html: string
  css: string
  react: string
  className?: string
}

type TabKey = "html" | "css" | "react"

function unescapeString(str: string): string {
  if (!str) return ""
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
}

function extractCleanHtml(raw: string): string {
  if (!raw) return ""
  const trimmed = raw.trim()

  // 1. If it's a JSON string
  if (trimmed.startsWith("{") && trimmed.includes('"html"')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed.html && typeof parsed.html === "string") {
        return unescapeString(parsed.html).trim()
      }
    } catch {
      // Regex extract value of "html": "..."
      const match =
        trimmed.match(/"html"\s*:\s*"([\s\S]*?)"\s*,\s*"(?:css|react|changesSummary)"/i) ||
        trimmed.match(/"html"\s*:\s*"([\s\S]*?)"\s*\}/i)
      if (match && match[1]) {
        return unescapeString(match[1]).trim()
      }
    }
  }

  // 2. Extract <!DOCTYPE html> ... </html>
  const docMatch = trimmed.match(/<!DOCTYPE html[\s\S]*?<\/html>/i)
  if (docMatch) {
    return unescapeString(docMatch[0]).trim()
  }

  // 3. Unescape any literal \n
  if (trimmed.includes("\\n")) {
    const unescaped = unescapeString(trimmed)
    const docMatch2 = unescaped.match(/<!DOCTYPE html[\s\S]*?<\/html>/i)
    if (docMatch2) return docMatch2[0].trim()
    return unescaped.trim()
  }

  return trimmed
}

function extractCleanCss(rawCss: string, cleanHtml: string): string {
  let css = rawCss ? unescapeString(rawCss).trim() : ""

  // If empty or placeholder
  if (!css || css.includes("included in HTML") || css.length < 30 || css.startsWith("{")) {
    const styleMatch = cleanHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
    if (styleMatch && styleMatch[1] && styleMatch[1].trim().length > 20) {
      css = styleMatch[1].trim()
    }
  }

  if (css.includes("\\n")) {
    css = unescapeString(css)
  }

  if (!css || css.length < 20) {
    css = `/* Liquid Glass Design System Stylesheet */
:root {
  --bg-dark: #0a0a12;
  --card-glass: rgba(255, 255, 255, 0.08);
  --accent-primary: #8b5cf6;
  --glass-blur: blur(24px) saturate(180%);
  --border-specular: 1px solid rgba(255, 255, 255, 0.12);
}

body {
  margin: 0;
  background: var(--bg-dark);
  color: #ffffff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  overflow-x: hidden;
}

.glass-card {
  background: var(--card-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--border-specular);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 60px rgba(139, 92, 246, 0.25);
}`
  }

  return css.trim()
}

function extractCleanReact(rawReact: string, cleanHtml: string): string {
  let react = rawReact ? unescapeString(rawReact).trim() : ""

  if (!react || react.includes("not generated") || react.length < 30 || react.startsWith("{")) {
    // Generate clean React JSX from HTML
    let bodyContent = cleanHtml
    const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch && bodyMatch[1]) {
      bodyContent = bodyMatch[1]
    }

    bodyContent = bodyContent
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/\sclass=/g, " className=")
      .replace(/\sfor=/g, " htmlFor=")
      .replace(/\stabindex=/g, " tabIndex=")
      .replace(/<!--([\s\S]*?)-->/g, "{/* $1 */}")
      .replace(/<img([^>]*[^\/])>/gi, "<img$1 />")
      .replace(/<input([^>]*[^\/])>/gi, "<input$1 />")
      .replace(/<br>/gi, "<br />")
      .replace(/<hr>/gi, "<hr />")
      .trim()

    react = `import React, { useState } from 'react';
import './styles.css';

export default function LivingPrototype() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white selection:bg-purple-500/30 font-sans">
      ${bodyContent}
    </div>
  );
}`
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
