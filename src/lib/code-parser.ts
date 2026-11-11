// ============================================================================
// WhiteboardOS — Pure Client-Safe Code & JSON Parsing Utilities
// Safe for both Browser Client Components and Server Node Environments
// ============================================================================

import type { GeneratedCode } from "./types"

// Clean JSON from LLM response (strip markdown fences if present)
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim()
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json|html)?\s*\n?/, "").replace(/\n?```\s*$/, "")
  }
  return cleaned.trim()
}

// Unescape literal escape sequences (\n, \r, \t, \", \\)
export function unescapeString(str: string): string {
  if (!str) return ""
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
}

// Robust character-by-character extractor for string fields inside JSON
// Works regardless of which keys follow (e.g. css, react, changesSummary, components, or })
export function extractJsonStringField(text: string, fieldName: string): string | null {
  const fieldPattern = new RegExp(`"${fieldName}"\\s*:\\s*"`, "i")
  const match = text.match(fieldPattern)
  if (!match || match.index === undefined) return null

  const startIndex = match.index + match[0].length
  let result = ""
  let isEscaped = false

  for (let i = startIndex; i < text.length; i++) {
    const char = text[i]
    if (isEscaped) {
      if (char === "n") result += "\n"
      else if (char === "r") result += "\r"
      else if (char === "t") result += "\t"
      else if (char === '"') result += '"'
      else if (char === "\\") result += "\\"
      else result += "\\" + char
      isEscaped = false
    } else if (char === "\\") {
      isEscaped = true
    } else if (char === '"') {
      // Reached closing unescaped quote of the string literal
      return result
    } else {
      result += char
    }
  }

  return result.length > 0 ? result : null
}

// Universal HTML sanitizer that guarantees clean HTML markup with zero raw JSON leakage
export function extractCleanHtml(raw: string): string {
  if (!raw || typeof raw !== "string") return ""
  let text = cleanJsonResponse(raw)

  // 1. Spliced stream repair: If string contains spliced CSS/text before JSON
  const jsonStart = text.search(/\{\s*"html"/i)
  if (jsonStart > 0) {
    text = text.slice(jsonStart).trim()
  }

  // 2. Standard JSON parse attempt
  if (text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text)
      if (parsed.html && typeof parsed.html === "string") {
        return extractCleanHtml(parsed.html)
      }
    } catch {
      // JSON.parse failed on unescaped control chars / spliced tokens
    }

    // Robust token extractor for "html" field
    const extracted = extractJsonStringField(text, "html")
    if (extracted && extracted.trim().length > 10) {
      return extractCleanHtml(extracted)
    }
  }

  // 3. Extract between <!DOCTYPE html> and </html>
  const docMatch = text.match(/<!DOCTYPE html[\s\S]*?(?:<\/html>|$)/i)
  if (docMatch) {
    return unescapeString(docMatch[0]).trim()
  }

  // 4. Extract between <html and </html>
  const htmlTagMatch = text.match(/<html[\s\S]*?(?:<\/html>|$)/i)
  if (htmlTagMatch) {
    return unescapeString(htmlTagMatch[0]).trim()
  }

  // 5. Unescape any literal \n
  if (text.includes("\\n")) {
    const unescaped = unescapeString(text)
    const docMatch2 = unescaped.match(/<!DOCTYPE html[\s\S]*?(?:<\/html>|$)/i)
    if (docMatch2) return docMatch2[0].trim()
    text = unescaped
  }

  // 6. Last line of defense: strip raw {"html": or leading {
  if (text.startsWith("{") || text.includes('"html":')) {
    const extracted = extractJsonStringField(text, "html")
    if (extracted) {
      return unescapeString(extracted).trim()
    }
    // Clean out JSON key artifacts
    text = text
      .replace(/^\s*\{\s*"html"\s*:\s*"?/i, "")
      .replace(/"?\s*,\s*"(?:css|react|changesSummary|components)"[\s\S]*$/i, "")
      .replace(/"?\s*\}\s*$/i, "")
  }

  return unescapeString(text).trim()
}

// Extract CSS stylesheet from HTML <style> tags or fallback Liquid Glass tokens
export function extractCssFromHtml(html: string): string {
  if (!html) return "/* No CSS available */"
  const match = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  if (match && match[1] && match[1].trim().length > 20) {
    return match[1].trim()
  }

  return `/* Liquid Glass Design System Tokens */
:root {
  --bg-dark: #0a0a12;
  --card-glass: rgba(255, 255, 255, 0.08);
  --accent-primary: #8b5cf6;
  --glass-blur: blur(24px) saturate(180%);
  --border-specular: 1px solid rgba(255, 255, 255, 0.12);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-dark);
  color: #ffffff;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`
}

// Convert standalone HTML into modern React JSX component
export function convertHtmlToReact(html: string): string {
  if (!html) return "// No React code generated"

  const clean = extractCleanHtml(html)
  const bodyMatch = clean.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const bodyContent = bodyMatch ? bodyMatch[1] : clean

  const cleanBody = bodyContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<!--([\s\S]*?)-->/g, "{/* $1 */}")
    .trim()

  const jsx = cleanBody
    .replace(/\sclass=/g, " className=")
    .replace(/\sfor=/g, " htmlFor=")
    .replace(/\stabindex=/g, " tabIndex=")
    .replace(/style="([^"]*)"/g, (match, styleStr) => {
      const camelStyles = styleStr
        .split(";")
        .filter((s: string) => s.trim())
        .map((s: string) => {
          const [k, v] = s.split(":")
          if (!k || !v) return ""
          const camelKey = k.trim().replace(/-([a-z])/g, (_: any, c: string) => c.toUpperCase())
          return `"${camelKey}": "${v.trim()}"`
        })
        .filter(Boolean)
        .join(", ")
      return `style={{ ${camelStyles} }}`
    })
    .replace(/<input([^>]*?)>/gi, "<input$1 />")
    .replace(/<img([^>]*?)>/gi, "<img$1 />")
    .replace(/<br>/gi, "<br />")
    .replace(/<hr>/gi, "<hr />")
    .trim()

  return `import React, { useState } from 'react';
import './styles.css';

export default function LivingPrototype() {
  const [activeAction, setActiveAction] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white selection:bg-purple-500/30 font-sans">
      ${jsx}
    </div>
  );
}`
}

// Robust JSON / Code extractor to guarantee valid HTML without raw JSON artifacts
export function parseCodeOutput(raw: string): GeneratedCode {
  if (!raw || typeof raw !== "string") {
    return {
      html: "<!DOCTYPE html><html><body><div class='p-6 text-white'>No code generated</div></body></html>",
      css: "/* No CSS */",
      react: "// No React code",
    }
  }

  // 1. Extract pure, clean HTML first
  const cleanHtml = extractCleanHtml(raw)

  // 2. Extract CSS: Check if raw was JSON with a valid "css" field, else extract from HTML <style>
  let cleanCss = ""
  try {
    const textToParse = raw.search(/\{\s*"html"/i) > 0 ? raw.slice(raw.search(/\{\s*"html"/i)).trim() : raw.trim()
    const parsed = JSON.parse(textToParse)
    if (parsed.css && typeof parsed.css === "string" && !parsed.css.includes("included in HTML") && parsed.css.length > 20) {
      cleanCss = unescapeString(parsed.css).trim()
    }
  } catch {
    const extractedCss = extractJsonStringField(raw, "css")
    if (extractedCss && extractedCss.length > 20 && !extractedCss.includes("included in HTML")) {
      cleanCss = unescapeString(extractedCss).trim()
    }
  }

  // If CSS was spliced or invalid, extract from HTML <style>
  if (!cleanCss || cleanCss.startsWith("{") || cleanCss.includes('"html"') || cleanCss.includes("-webkit-{")) {
    cleanCss = extractCssFromHtml(cleanHtml)
  }

  // 3. Extract React
  let cleanReact = ""
  try {
    const textToParse = raw.search(/\{\s*"html"/i) > 0 ? raw.slice(raw.search(/\{\s*"html"/i)).trim() : raw.trim()
    const parsed = JSON.parse(textToParse)
    if (parsed.react && typeof parsed.react === "string" && !parsed.react.includes("not generated") && parsed.react.length > 20) {
      cleanReact = unescapeString(parsed.react).trim()
    }
  } catch {
    const extractedReact = extractJsonStringField(raw, "react")
    if (extractedReact && extractedReact.length > 20 && !extractedReact.includes("not generated")) {
      cleanReact = unescapeString(extractedReact).trim()
    }
  }

  // If React was spliced or invalid, convert clean HTML to React
  if (!cleanReact || cleanReact.startsWith("{") || cleanReact.includes('"html"') || cleanReact.includes("<!--{")) {
    cleanReact = convertHtmlToReact(cleanHtml)
  }

  return {
    html: cleanHtml,
    css: cleanCss,
    react: cleanReact,
  }
}
