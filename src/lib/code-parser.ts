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

// Extract CSS stylesheet from HTML <style> tags
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`
}

// Convert standalone HTML into modern React JSX component
export function convertHtmlToReact(html: string): string {
  if (!html) return "// No React code generated"

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const bodyContent = bodyMatch ? bodyMatch[1] : html

  const cleanBody = bodyContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .trim()

  const jsx = cleanBody
    .replace(/class=/g, "className=")
    .replace(/for=/g, "htmlFor=")
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
    <div className="min-h-screen bg-[#0a0a12] text-white selection:bg-purple-500/30">
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

  const cleaned = cleanJsonResponse(raw)

  // 1. Try standard JSON.parse
  try {
    const parsed = JSON.parse(cleaned)
    if (parsed.html && typeof parsed.html === "string") {
      const cleanHtml = parsed.html
      const cleanCss =
        parsed.css && parsed.css.length > 20 && !parsed.css.includes("included in HTML")
          ? parsed.css
          : extractCssFromHtml(cleanHtml)
      const cleanReact =
        parsed.react && parsed.react.length > 20 && !parsed.react.includes("not generated")
          ? parsed.react
          : convertHtmlToReact(cleanHtml)

      return {
        html: cleanHtml,
        css: cleanCss,
        react: cleanReact,
      }
    }
  } catch (e) {
    // Continue to regex extractor
  }

  // 2. Extract between <!DOCTYPE html> and </html>
  const docMatch = cleaned.match(/<!DOCTYPE html[\s\S]*?<\/html>/i)
  if (docMatch) {
    const html = docMatch[0]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\")

    return {
      html,
      css: extractCssFromHtml(html),
      react: convertHtmlToReact(html),
    }
  }

  // 3. Fallback unescape
  let fallbackHtml = cleaned
  if (fallbackHtml.startsWith("{") && fallbackHtml.includes('"html"')) {
    const match = fallbackHtml.match(/"html"\s*:\s*"([\s\S]*?)"\s*,\s*"(?:css|react)"/i)
    if (match && match[1]) {
      fallbackHtml = match[1]
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\t/g, "\t")
        .replace(/\\\\/g, "\\")
    }
  }

  return {
    html: fallbackHtml,
    css: extractCssFromHtml(fallbackHtml),
    react: convertHtmlToReact(fallbackHtml),
  }
}
