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

/// Model Priority List: verified active Gemini models
const MODEL_CANDIDATES = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.7-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.6-flash",
]

function getApiKeys(): string[] {
  const keys: string[] = []
  if (process.env.GEMINI_API_KEY) {
    keys.push(...process.env.GEMINI_API_KEY.split(",").map((k) => k.trim().replace(/^["']|["']$/g, "")).filter(Boolean))
  }
  if (process.env.GEMINI_API_KEY_2) {
    keys.push(process.env.GEMINI_API_KEY_2.trim().replace(/^["']|["']$/g, ""))
  }
  if (process.env.GEMINI_API_KEY_3) {
    keys.push(process.env.GEMINI_API_KEY_3.trim().replace(/^["']|["']$/g, ""))
  }
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    keys.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY.trim().replace(/^["']|["']$/g, ""))
  }
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)))
  if (uniqueKeys.length === 0) {
    throw new Error("GEMINI_API_KEY is not set in environment variables")
  }
  return uniqueKeys
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
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        })
        const result = await operation(model, modelName, apiKey)
        return result
      } catch (err: any) {
        lastError = err
        const msg = err?.message || ""
        const isQuotaOrRateOrService =
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("503") ||
          msg.includes("quota") ||
          msg.includes("Quota exceeded") ||
          msg.includes("not found") ||
          msg.includes("404") ||
          msg.includes("unsupported") ||
          msg.includes("high demand") ||
          msg.includes("Service Unavailable")

        console.warn(
          `[Multi-Model Cascade] Model ${modelName} encountered issue: ${msg.slice(0, 100)}. Cascading to next candidate...`
        )
        // Immediately try next candidate model
        continue
      }
    }
  }

  throw lastError || new Error("All Gemini models and API keys exhausted")
}

import {
  cleanJsonResponse,
  extractCssFromHtml,
  convertHtmlToReact,
  parseCodeOutput,
} from "./code-parser"

export {
  cleanJsonResponse,
  extractCssFromHtml,
  convertHtmlToReact,
  parseCodeOutput,
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
      { text: "Analyze this sketch/wireframe image thoroughly and return structured JSON matching the exact UI components and text in the drawing." },
    ])

    const responseText = result.response.text()
    const cleaned = cleanJsonResponse(responseText)

    try {
      const parsed = JSON.parse(cleaned) as AnalysisResult
      if (parsed.components && Array.isArray(parsed.components)) {
        parsed.components = parsed.components.map((c, i) => {
          const rawConf = typeof c.confidence === "number" ? c.confidence : 95
          const confidence = rawConf <= 1 ? Math.round(rawConf * 100) : Math.min(100, Math.round(rawConf))
          return {
            id: c.id || `comp_${i + 1}`,
            type: c.type || "card",
            label: c.label || (c as any).description || (c as any).name || `Component ${i + 1}`,
            confidence,
            x: typeof c.x === "number" ? c.x : 10,
            y: typeof c.y === "number" ? c.y : 10,
            width: typeof c.width === "number" ? c.width : 80,
            height: typeof c.height === "number" ? c.height : 20,
            included: true,
            properties: c.properties || {
              text: (c as any).text || c.label || "",
            },
          }
        })
      }
      if (parsed.overallConfidence) {
        const rawOverall = typeof parsed.overallConfidence === "number" ? parsed.overallConfidence : 95
        parsed.overallConfidence = rawOverall <= 1 ? Math.round(rawOverall * 100) : Math.min(100, Math.round(rawOverall))
      } else {
        parsed.overallConfidence = 95
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

        if (fullText.length > 50) {
          return parseCodeOutput(fullText)
        }
      } catch (err: any) {
        console.warn(`[Streaming Cascade] Model ${modelName} stream error, cascading...`, err?.message)
      }
    }
  }

  // Fallback: If streaming is unavailable on all models, use non-streaming generateCode
  const nonStreamResult = await generateCode(components, layout)
  const fullOutput = JSON.stringify(nonStreamResult, null, 2)
  const chunkSize = 60
  for (let i = 0; i < fullOutput.length; i += chunkSize) {
    yield fullOutput.slice(i, i + chunkSize)
  }
  return nonStreamResult
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

// ── Synthesize complete UI blueprint & code from spoken voice prompt ────────
export async function synthesizeVoiceUI(voicePrompt: string): Promise<any> {
  return executeWithModelCascade(async (model) => {
    const prompt = `You are an elite Principal UI Architect at VocalLabs.
The user spoke this natural language voice prompt: "${voicePrompt}".

Analyze the spoken intent and return a rich, structured JSON object:
{
  "title": "Application, Store, Restaurant or Dashboard Title",
  "category": "E.g., Restaurant & Dining, Mobile Dashboard, Healthcare, Crypto, E-Commerce, SaaS, Portfolio",
  "description": "2-sentence summary of the synthesized architecture",
  "components": [
    {
      "id": "comp_1",
      "type": "navbar",
      "label": "Descriptive component title tailored to the domain",
      "confidence": 96,
      "x": 5,
      "y": 5,
      "width": 90,
      "height": 10,
      "included": true,
      "properties": { "text": "Specific domain details" }
    }
  ],
  "layout": {
    "type": "grid",
    "direction": "column",
    "alignment": "stretch",
    "gap": 20,
    "sections": [
      { "id": "sec_1", "name": "Header", "components": ["comp_1"], "layout": "row" }
    ]
  },
  "code": {
    "html": "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'/><meta name='viewport' content='width=device-width, initial-scale=1.0'/><script src='https://cdn.tailwindcss.com'></script><style>/* Liquid Glass styles */</style></head><body class='bg-[#08090d] text-white p-6'>...complete rich HTML...</body></html>",
    "css": "/* Liquid Glass CSS */",
    "react": "import React from 'react'; export default function App() { return <div>...</div>; }"
  }
}

CRITICAL RULES:
1. The generated HTML must be complete, stunning, beautifully styled with Liquid Glass tokens (frosted glass blur, backdrop-filter, gradients, specular highlights, dark background #08090d, Plus Jakarta Sans).
2. The HTML, components, labels, and copy must be 100% SPECIFIC and TAILORED to what was spoken in "${voicePrompt}" (e.g. if restaurant/food, show authentic dishes and pricing; if mobile app, format as a sleek mobile layout; if crypto, show real token tickers; if healthcare, show medical cards).
3. Return ONLY valid JSON.`

    const result = await model.generateContent([
      { text: prompt },
    ])

    const responseText = result.response.text()
    const cleaned = cleanJsonResponse(responseText)
    return JSON.parse(cleaned)
  })
}

