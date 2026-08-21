// ============================================================================
// WhiteboardOS — Gemini Multi-Model & Multi-Key Cascading Client
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai"
import {
  ANALYSIS_SYSTEM_PROMPT,
  GENERATION_SYSTEM_PROMPT,
  ITERATION_SYSTEM_PROMPT,
  buildGenerationPrompt,
  buildIterationPrompt,
} from "./prompts"
import type { AnalysisResult, GeneratedCode } from "./types"

// Model Priority List: gemini-2.0-flash is primary
const MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-lite",
]

function getApiKeys(): string[] {
  const keys: string[] = []
  if (process.env.GEMINI_API_KEY) {
    keys.push(...process.env.GEMINI_API_KEY.split(",").map((k) => k.trim()).filter(Boolean))
  }
  if (process.env.GEMINI_API_KEY_2) {
    keys.push(process.env.GEMINI_API_KEY_2.trim())
  }
  if (process.env.GEMINI_API_KEY_3) {
    keys.push(process.env.GEMINI_API_KEY_3.trim())
  }
  if (keys.length === 0) {
    throw new Error("GEMINI_API_KEY is not set in environment variables")
  }
  return keys
}

// Executes an operation with automatic API Key rotation and Model cascading
async function executeWithModelCascade<T>(
  operation: (model: any, modelName: string, apiKey: string) => Promise<T>
): Promise<T> {
  const apiKeys = getApiKeys()
  let lastError: any = null

  for (const apiKey of apiKeys) {
    const genAI = new GoogleGenerativeAI(apiKey)

    for (const modelName of MODEL_CANDIDATES) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: "application/json",
            },
          })
          return await operation(model, modelName, apiKey)
        } catch (err: any) {
          lastError = err
          const msg = err?.message || ""
          const isQuotaOrRate =
            msg.includes("429") ||
            msg.includes("RESOURCE_EXHAUSTED") ||
            msg.includes("quota") ||
            msg.includes("Quota exceeded") ||
            msg.includes("not found") ||
            msg.includes("404") ||
            msg.includes("unsupported")

          if (isQuotaOrRate) {
            console.warn(
              `[Multi-Model Cascade] Model ${modelName} hit quota limit on key (...${apiKey.slice(-4)}). Switching candidate...`
            )
            break // Break to next candidate model
          }

          // Transient error: wait briefly
          await new Promise((resolve) => setTimeout(resolve, 400 * Math.pow(2, attempt)))
        }
      }
    }
  }

  throw lastError || new Error("All Gemini models and API keys exhausted")
}

// Clean JSON from Gemini response (strip markdown fences if present)
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim()
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "")
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

// ── Analyze a sketch image with multi-model & multi-key cascade ─────────────
export async function analyzeSketch(imageBase64: string, mimeType: string): Promise<AnalysisResult> {
  return executeWithModelCascade(async (model) => {
    const result = await model.generateContent([
      { text: ANALYSIS_SYSTEM_PROMPT },
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      },
      { text: "Analyze this sketch/wireframe image and return structured JSON." },
    ])

    const responseText = result.response.text()
    const cleaned = cleanJsonResponse(responseText)

    try {
      const parsed = JSON.parse(cleaned) as AnalysisResult
      if (parsed.components) {
        parsed.components = parsed.components.map((c) => ({
          ...c,
          confidence: c.confidence > 1 ? c.confidence / 100 : c.confidence,
          included: true,
        }))
      }
      if (parsed.overallConfidence && parsed.overallConfidence > 1) {
        parsed.overallConfidence = parsed.overallConfidence / 100
      }
      return parsed
    } catch {
      throw new Error(`Failed to parse Gemini analysis response: ${cleaned.substring(0, 200)}`)
    }
  })
}

// ── Generate code from detected components with multi-model cascade ─────────
export async function generateCode(
  components: string,
  layout: string
): Promise<GeneratedCode> {
  return executeWithModelCascade(async (model) => {
    const prompt = buildGenerationPrompt(components, layout)

    const result = await model.generateContent([
      { text: GENERATION_SYSTEM_PROMPT },
      { text: prompt },
    ])

    const responseText = result.response.text()
    return parseCodeOutput(responseText)
  })
}

// ── Stream code generation from Gemini token-by-token ───────────────────────
export async function* generateCodeStream(
  components: string,
  layout: string
): AsyncGenerator<string, GeneratedCode, void> {
  const apiKeys = getApiKeys()
  const prompt = buildGenerationPrompt(components, layout)
  let fullText = ""

  for (const apiKey of apiKeys) {
    const genAI = new GoogleGenerativeAI(apiKey)

    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        })

        const streamResult = await model.generateContentStream([
          { text: GENERATION_SYSTEM_PROMPT },
          { text: prompt },
        ])

        for await (const chunk of streamResult.stream) {
          const chunkText = chunk.text()
          fullText += chunkText
          yield chunkText
        }

        return parseCodeOutput(fullText)
      } catch (err: any) {
        console.warn(`[Streaming Cascade] Model ${modelName} stream error, cascading...`, err?.message)
      }
    }
  }

  throw new Error("All streaming models failed")
}

// ── Iterate on existing code with multi-model cascade ───────────────────────
export async function iterateCode(
  currentCode: string,
  command: string
): Promise<GeneratedCode & { changesSummary: string }> {
  return executeWithModelCascade(async (model) => {
    const prompt = buildIterationPrompt(currentCode, command)

    const result = await model.generateContent([
      { text: ITERATION_SYSTEM_PROMPT },
      { text: prompt },
    ])

    const responseText = result.response.text()
    const extracted = parseCodeOutput(responseText)

    return {
      ...extracted,
      changesSummary: `Updated prototype for request: "${command}"`,
    }
  })
}
