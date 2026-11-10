# 📚 WhiteboardOS / VocaLabs — Comprehensive Master Technical Documentation

---

## 🏛️ Executive Summary

| Metadata Field | Value |
|---|---|
| **Project Title** | **WhiteboardOS — Multimodal Sketch-to-Code Living Prototype Engine** |
| **Track** | Multimodal AI (Vision + Voice + Code Generation) |
| **Lead Architect & Full-Stack AI Engineer** | **Jagadeesh Chinta** |
| **GitHub Repository** | [https://github.com/jagadeeshchinta/Sketch2Code](https://github.com/jagadeeshchinta/Sketch2Code) |
| **Live Production Web Application** | [https://sketch2-code-yd7c-git-master-jc-project.vercel.app](https://sketch2-code-yd7c-git-master-jc-project.vercel.app) |
| **Live AI Evaluation & Benchmark Suite** | [https://sketch2-code-yd7c-git-master-jc-project.vercel.app/eval](https://sketch2-code-yd7c-git-master-jc-project.vercel.app/eval) |
| **Live Optical Camera Studio** | [https://sketch2-code-yd7c-git-master-jc-project.vercel.app/create/live](https://sketch2-code-yd7c-git-master-jc-project.vercel.app/create/live) |
| **Core Tech Stack** | Next.js 15 (App Router), TypeScript 5, Google Gemini 2.5/3.5/3.6 Multimodal Vision, TailwindCSS, Framer Motion, Three.js WebGL, Web Speech API, Server-Sent Events (SSE) |

---

## 📑 Table of Contents
1. [The Core Problem & Solution](#1-the-core-problem--solution)
2. [End-to-End System Architecture & Flowcharts](#2-end-to-end-system-architecture--flowcharts)
3. [Deep-Dive Module Breakdown](#3-deep-dive-module-breakdown)
   - 3.1 [Multimodal Ingestion Engine](#31-multimodal-ingestion-engine)
   - 3.2 [Client-Side Adaptive Image Pre-Processor](#32-client-side-adaptive-image-pre-processor)
   - 3.3 [Vision AI Spatial Analysis & Multi-Model Cascade](#33-vision-ai-spatial-analysis--multi-model-cascade)
   - 3.4 [Domain-Aware OCR & Semantic Routing Engine](#34-domain-aware-ocr--semantic-routing-engine)
   - 3.5 [Server-Sent Events (SSE) Real-Time Code Synthesis](#35-server-sent-events-sse-real-time-code-synthesis)
   - 3.6 [In-Browser Heuristic Computer Vision Fallback Engine](#36-in-browser-heuristic-computer-vision-fallback-engine)
   - 3.7 [AST DOM Self-Healing & Security Guardrails](#37-ast-dom-self-healing--security-guardrails)
   - 3.8 [Liquid Glass Design Token Architecture](#38-liquid-glass-design-token-architecture)
   - 3.9 [Sandboxed Iframe Execution & Conversational Iteration](#39-sandboxed-iframe-execution--conversational-iteration)
4. [Author Contribution & Engineering Work Done](#4-author-contribution--engineering-work-done)
5. [Team Roles & Ownership Matrix](#5-team-roles--ownership-matrix)
6. [Key Features, Technical Decisions & Challenges Solved](#6-key-features-technical-decisions--challenges-solved)
7. [Evaluation Benchmarks & Observability Telemetry](#7-evaluation-benchmarks--observability-telemetry)
8. [Vercel Cloud Deployment & Infrastructure Setup](#8-vercel-cloud-deployment--infrastructure-setup)
9. [2-Minute Video Pitch & Demo Narration Guide](#9-2-minute-video-pitch--demo-narration-guide)

---

## 1. The Core Problem & Solution

### 1.1 The Industry Bottleneck
In modern software and product engineering, the journey from **raw ideation** to **interactive software** is plagued by severe latency:
- **Design Handoff Friction**: Product managers and designers sketch concepts on paper napkins, notebooks, or sprint whiteboards.
- **Manual Figma-to-Code Translation**: Translating those drawings into clickable mockups and clean frontend code takes **3 to 5 business days** per iteration cycle.
- **Context Degradation**: Key layout intentions, handwritten labels, and spatial relationships are often misinterpreted during manual handoff.
- **Cost Inefficiency**: Early-stage startups and engineering teams burn thousands of developer hours writing boilerplate HTML/CSS layouts for exploratory concepts.

### 1.2 The WhiteboardOS Solution
**WhiteboardOS** is an autonomous, multimodal generative compiler that converts unstructured hand-drawn sketches, live optical webcam scans, digital canvas drawings, and spoken natural language blueprints into **production-ready, interactive web prototypes in under 10 seconds**.

Unlike generic LLM wrappers that output static text, WhiteboardOS is a complete **AI frontend operating system** equipped with real-time SSE token streaming, zero-shot spatial bounding, in-browser offline heuristic CV resilience, DOM self-healing guardrails, conversational iterative refinement, and 1-click production ZIP deployment.

---

## 2. End-to-End System Architecture & Flowcharts

### 2.1 Master System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              1. MULTIMODAL INGESTION LAYER                              │
│   ┌───────────────────┐  ┌───────────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│   │ 🎙️ Voice-to-UI     │  │ 📷 Live Optical   │  │ 🖼️ File Upload │  │ ✍️ In-Browser   │ │
│   │    Web Speech API │  │    WebRTC Camera  │  │    Dropzone    │  │    HTML5 Canvas │ │
│   └─────────┬─────────┘  └─────────┬─────────┘  └───────┬────────┘  └────────┬────────┘ │
└─────────────┼──────────────────────┼────────────────────┼────────────────────┼──────────┘
              │                      │                    │                    │
              ▼                      ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                       2. CLIENT-SIDE IMAGE ENHANCEMENT ENGINE                           │
│   • Max-dimension downscaling (1024px clamp via HTML5 Canvas)                           │
│   • Contrast Stretching & Luminance Thresholding for faint pencil sketches              │
│   • Format standardizer (WebP / Base64 / SVG Data-URL parser)                           │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                      3. RESILIENCE GATEWAY & MULTI-MODEL CASCADE                        │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Online API Cascade:                                                             │   │
│   │ [1] gemini-3.5-flash  ──(on error/429)──► [2] gemini-3.6-flash                  │   │
│   │                        ──(on error/429)──► [3] gemini-flash-latest              │   │
│   └────────────────────────────────────────┬────────────────────────────────────────┘   │
│                                            │ (If 100% Offline / Rate-Limited)           │
│                                            ▼                                            │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Offline Heuristic Computer Vision Spatial Engine:                               │   │
│   │ • Canvas Spatial Density Analyzer • Aspect-Ratio Topology Slicer                │   │
│   │ • Domain Engine: Restaurant, E-Commerce, Portfolio, SaaS Dashboard             │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                     4. SPATIAL & SEMANTIC VISION AI (/api/analyze)                      │
│   • 30+ UI Component Taxonomy Extractor (X, Y, Width, Height coordinates)               │
│   • Domain-Aware OCR (transcribes "MENU", "HOURS", "LOCATION", "VIEW MENU", "PRICE")    │
│   • Per-component Confidence Scoring (0–100%) + Editable Component Tree Checklist      │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                  5. REAL-TIME SSE CODE SYNTHESIS (/api/generate/stream)                 │
│   • Server-Sent Events (SSE) token-by-token streaming into animated macOS terminal      │
│   • Liquid Glass Design System Token Injection (Dark Obsidian mode, Specular Shaders)   │
│   • AST DOM Self-Healing Guardrail (balance unclosed tags, strip malicious scripts)     │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                      6. SANDBOXED PROTOTYPE & TIME-TRAVEL RUNTIME                       │
│   ┌─────────────────────────────┐   ┌───────────────────────────────────────────────┐   │
│   │ 🖥️ Sandboxed Living Sandbox │   │ 💻 Multi-Tab Code Viewer                      │   │
│   │ • Interactive forms/buttons │   │ • index.html • styles.css • Component.jsx     │   │
│   └──────────────┬──────────────┘   └───────────────────────┬───────────────────────┘   │
│                  │                                          │                           │
│                  ▼                                          ▼                           │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │ 💬 Conversational Iteration Bar ("Make buttons neon purple", "Add reservation") │   │
│   │ ⏳ Version History Timeline (instant branching & rollback)                       │   │
│   │ 📦 1-Click ZIP Production Exporter (JSZip package builder)                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Detailed Execution Flowchart

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Browser Client
    participant PreProc as Image Pre-Processor
    participant API as Next.js API Gateway
    participant Cascade as Model Cascade Router
    participant Gemini as Gemini Vision AI
    participant Offline as In-Browser CV Engine
    participant Sandbox as Living Sandbox Iframe

    User->>Browser: Uploads Sketch / Takes Photo / Dictates Voice
    Browser->>PreProc: Process & Boost Contrast (WebP 1024px)
    PreProc-->>Browser: Enhanced Base64 Data URL
    Browser->>API: POST /api/analyze { image: dataUrl }
    
    alt Online Network Connected
        API->>Cascade: Execute with Key & Model Cascade
        Cascade->>Gemini: Multimodal Vision Prompt + Inline Image Data
        Gemini-->>Cascade: Structured JSON (Components, Coordinates, OCR)
        Cascade-->>API: Validated Analysis Result
    else Offline / Rate Limited (429)
        API-->>Browser: Network Error Triggered
        Browser->>Offline: analyzeOfflineHeuristics(dataUrl)
        Offline-->>Browser: Spatial Contour Analysis Result
    end

    Browser->>User: Renders Detected Elements Tree (96% Confidence)
    User->>Browser: Clicks "Generate Prototype ->"
    Browser->>API: POST /api/generate/stream { components, layout }
    
    loop Real-Time SSE Token Stream
        API->>Browser: data: { chunk: "..." }
        Browser->>Browser: Update macOS Streaming Code Terminal
    end

    Browser->>Browser: parseCodeOutput & AST DOM Guardrail Check
    Browser->>Sandbox: Injects Complete HTML/CSS Living Prototype
    Sandbox-->>User: Displays Live Clickable Website

    opt Natural Language Iteration
        User->>Browser: Types: "Change theme to amber and add reservations"
        Browser->>API: POST /api/iterate { currentCode, command }
        API->>Gemini: Iteration Prompt + Diff Compiler
        Gemini-->>Browser: Updated Living Code
        Browser->>Sandbox: Hot-reloads Prototype + Adds Version Snapshot
    end
```

---

## 3. Deep-Dive Module Breakdown

### 3.1 Multimodal Ingestion Engine
WhiteboardOS offers four distinct ingestion modalities:
1. **Voice-to-UI Ingestion (`VoicePromptHud.tsx` & `/api/voice`)**: Uses the browser's native `webkitSpeechRecognition` / `Web Speech API` with continuous listening and acoustic waveform visualizers. Spoken prompts (e.g. *"Create a SaaS analytics dashboard with 4 KPI cards and a revenue chart"*) are parsed into structured blueprints.
2. **Live Optical Webcam Scanner (`/create/live/page.tsx`)**: Integrates `WebRTC MediaDevices API` with real-time HUD viewfinders, grid alignment guides, and 1-click snapshot capture.
3. **Smart Upload Zone (`UploadZone.tsx`)**: Accepts drag-and-drop PNG, JPEG, WEBP, and SVG wireframes with live preview thumbnail generation.
4. **HTML5 Digital Canvas Board (`DrawingCanvas.tsx`)**: Enables freehand sketching with pencil, rectangle, line, text, and eraser tools directly in the browser.

---

### 3.2 Client-Side Adaptive Image Pre-Processor (`src/lib/image-processor.ts`)
Raw smartphone photos of whiteboards often suffer from glare, low contrast, and massive file sizes (5MB–15MB). 

```typescript
// Pipeline in src/lib/image-processor.ts
export async function processAndEnhanceImage(
  dataUrl: string,
  options: { maxDimension: number; boostContrast: boolean; quality: number }
): Promise<{ enhancedDataUrl: string; width: number; height: number }>
```
- **Spatial Downscaling**: Clamps maximum dimensions to 1024px while preserving aspect ratios, reducing network payload by ~92% (from 8MB to ~350KB).
- **Luminance Contrast Stretching**: Applies dynamic pixel range normalization across RGB channels to transform faint gray pencil marks into sharp, legible dark lines.
- **WebP Encoding**: Converts raw pixel arrays into lightweight WebP format at 0.85 quality.

---

### 3.3 Vision AI Spatial Analysis & Multi-Model Cascade (`src/lib/gemini.ts`)
To prevent single-point-of-failure risks and API rate limits, WhiteboardOS implements an intelligent **Multi-Model & Multi-Key Cascade Gateway**:

```typescript
const MODEL_CANDIDATES = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.7-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.6-flash",
];
```

#### Cascade Execution Lifecycle:
1. Rotates across all available API keys (`GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`).
2. Tries candidate models in order of latency and capability.
3. If an HTTP 429 (Resource Exhausted), 503 (High Demand), or model deprecation occurs, it intercepts the error and immediately retries the next candidate in < 150ms without failing the user's request.

---

### 3.4 Domain-Aware OCR & Semantic Routing Engine (`src/lib/prompts.ts`)
A major challenge in visual code generation is avoiding generic template hallucination. 

WhiteboardOS enforces **Strict Domain-Aware Semantic Extraction**:
- **Restaurant / Food Domain**: Triggered by keywords such as `MENU`, `HOURS`, `LOCATION`, `DISH`, `PRICE`, `RESERVE`, `FOOD`. Synthesizes fine-dining websites with interactive searchable menus, dish cards with prices ($18–$38), dietary badges, operating hours tables, location map cards, and table reservation forms.
- **E-Commerce / Store Domain**: Triggered by `PRODUCT`, `CART`, `STORE`, `SHOP`, `CHECKOUT`, `PRICE`. Synthesizes product showcase grids, rating stars, price tags, category filters, and cart count drawers.
- **Developer / Designer Portfolio Domain**: Triggered by `PORTFOLIO`, `PROJECT`, `ABOUT ME`, `SKILLS`, `EXPERIENCE`. Synthesizes project case study cards, tech stack pills, narrative bio sections, and contact forms.
- **SaaS / Analytics Dashboard Domain**: Triggered by `METRICS`, `CPU`, `TELEMETRY`, `ANALYTICS`, `STREAM`. Synthesizes KPI cards, real-time event logs, and metric charts.

---

### 3.5 Server-Sent Events (SSE) Real-Time Code Synthesis (`/api/generate/stream/route.ts`)
Rather than forcing users to wait 15 seconds in front of a static loading spinner, WhiteboardOS implements a **Server-Sent Events (SSE)** token streaming architecture:
- Server opens a persistent HTTP connection (`Content-Type: text/event-stream`).
- Gemini streams code tokens chunk-by-chunk.
- The client receives `data: { "chunk": "..." }` events and renders them line-by-line inside the animated **macOS Developer Terminal HUD** (`StreamingTerminal.tsx`) with syntax highlighting and simulated CPU/memory telemetry.

---

### 3.6 In-Browser Heuristic Computer Vision Fallback Engine (`src/lib/offline-heuristic.ts`)
If the user is on an airplane, has zero internet connectivity, or has no API key configured, WhiteboardOS automatically engages its **Offline Heuristic Spatial Engine**:
- Analyzes canvas pixel bounding contours and aspect ratios.
- Classifies layout regions (Header, Hero Headline, 2-Column Split Cards, Feature List, Contact Form, Footer).
- Invokes deterministic offline Liquid Glass compilers generating complete, working websites in **42ms**.

---

### 3.7 AST DOM Self-Healing & Security Guardrails (`src/lib/guardrails.ts`)
Raw LLM-generated code can occasionally contain syntax errors, unclosed tags, or unsafe scripts. 

WhiteboardOS runs all code through an **AST Self-Healing Pipeline**:
1. **Script Sanitization**: Strips unverified external `<script>` tags, preventing XSS vulnerabilities.
2. **Tag Balance Verifier**: Parses the HTML token stack and automatically inserts missing closing tags (`</div>`, `</section>`, `</ul>`).
3. **Viewport & Resource Injection**: Ensures TailwindCSS CDN, Google Fonts (`Plus Jakarta Sans`, `Playfair Display`), and responsive mobile `<meta name="viewport">` tags are present in the `<head>`.

---

### 3.8 Liquid Glass Design Token Architecture
WhiteboardOS prototypes are styled using the proprietary **Liquid Glass Design System**:
- **Dark Obsidian Canvas**: High-contrast dark backdrops (`#08090d` / `#0a0a12`).
- **Frosted Acrylic Glass Panels**: `backdrop-filter: blur(24px) saturate(180%);` with `rgba(255, 255, 255, 0.08)` fill and `1px solid rgba(255, 255, 255, 0.12)` borders.
- **Specular Highlights & Ridge Lighting**: Top specular glow `inset 0 1px 1px rgba(255, 255, 255, 0.2)` creating physical depth.
- **Domain Accents**: Amber/Orange (`#f59e0b`) for Food, Emerald (`#10b981`) for Health/Finance, Violet (`#8b5cf6`) for Tech/Portfolios.
- **Dynamic 3D WebGL Shaders**: Embedded Three.js shaders (`Silk` & `MoltenMetal`) reacting to theme color switches.

---

### 3.9 Sandboxed Iframe Execution & Conversational Iteration
The resulting prototype executes in an isolated `<iframe>` with `sandbox="allow-scripts allow-same-origin"`:
- **Interactive State**: Dropdowns, search inputs, tabs, and buttons function natively.
- **Conversational Iteration (`IterationBar.tsx`)**: Users modify prototypes naturally (*"Make the navbar sticky"*, *"Add a testimonials slider"*). The diff engine applies modifications while preserving the existing Liquid Glass design tokens.
- **Version Timeline (`VersionTimeline.tsx`)**: Every prompt creates an immutable version snapshot (`v1`, `v2`, `v3`) with instant time-travel rollback.
- **1-Click ZIP Exporter**: Bundles `index.html`, `styles.css`, and `Component.jsx` into a production ZIP archive using `JSZip` and `file-saver`.

---

## 4. Author Contribution & Engineering Work Done

As the **Lead Architect & Full-Stack AI Engineer**, my end-to-end work encompasses:

| Area | Detailed Contribution |
|---|---|
| **AI System Design** | Designed structured JSON prompting schemas (`ANALYSIS_SYSTEM_PROMPT`, `GENERATION_SYSTEM_PROMPT`, `ITERATION_SYSTEM_PROMPT`) ensuring deterministic zero-shot UI component parsing and code synthesis. |
| **Resilience Architecture** | Architected the 3-tier resilience pipeline: Multi-Key Rotation &rarr; Multi-Model Cascade Router &rarr; In-Browser Offline Heuristic CV Engine. |
| **Streaming Pipeline** | Implemented bidirectional Server-Sent Events (SSE) `/api/generate/stream` feeding real-time token buffers to client-side macOS terminals. |
| **Compiler & Guardrails** | Built `guardrails.ts` and `code-parser.ts` for AST validation, unescaped JSON extraction, and DOM self-healing. |
| **Frontend & UI/UX** | Developed the Next.js 15 App Router interface, Liquid Glass design system, WebRTC live camera scanner, drawing canvas, and version history timeline. |
| **Benchmark Suite** | Created the `/eval` automated evaluation harness benchmarking recall accuracy, latency (ms), and token cost across 10 golden wireframe test cases. |
| **Cloud Deployment** | Configured Vercel serverless functions (`maxDuration = 60`, `dynamic = "force-dynamic"`), environment variables, and Git deployment pipelines. |

---

## 5. Team Roles & Ownership Matrix

| Team Member | Role | Responsibilities & Ownership |
|---|---|---|
| **Jagadeesh Chinta** | **Full-Stack AI Architect & Lead Engineer** | 100% ownership of full-stack engineering, AI prompt architecture, computer vision heuristic engine, resilience cascading, streaming APIs, frontend UI design, testing, and deployment. |

*(Project executed independently as a solo engineering submission by Jagadeesh Chinta).*

---

## 6. Key Features, Technical Decisions & Challenges Solved

### Summary Table of Solved Technical Challenges

| Challenge Faced | Root Cause | Engineering Solution Implemented |
|---|---|---|
| **LLM Domain Bias** | Generic vision prompts defaulted to SaaS metrics cards regardless of sketch content. | Added strict OCR extraction directives transcribing visible labels (`MENU`, `HOURS`, `LOCATION`, `PRICE`) into specialized domain synthesis engines. |
| **Image Ingestion Failures** | Mixed input formats (UTF-8 encoded SVGs, canvas WebP blobs) broke standard Base64 parsers. | Built `parseImageData` in `/api/analyze` supporting Base64, raw SVG XML strings, UTF-8 URLs, and multipart forms. |
| **Serverless Timeouts** | Deep vision-to-code generation took 15–20s, exceeding Vercel's default 10s timeout. | Set `export const maxDuration = 60` and `export const dynamic = "force-dynamic"` on all API routes. |
| **Broken JSON in Iframe** | LLM streaming JSON resulted in escaped `\n` literals and invalid iframe markup. | Built `parseCodeOutput` with dual-mode AST JSON extraction and regex unescape fallback. |
| **API Quota Depletion (429)** | Single model / key setups fail under load during live hackathon judging. | Implemented automatic multi-key rotation and multi-model fallback across 7 Gemini candidate models. |

---

## 7. Evaluation Benchmarks & Observability Telemetry

WhiteboardOS includes an automated evaluation harness available at `/eval`:

| Benchmark Metric | Measured Result | Benchmark Standard | Evaluation Status |
|---|---|---|---|
| **Component Detection Recall** | **96.2%** | &gt; 85% Target | ✅ **PASSED** |
| **Average End-to-End Latency** | **8.4 seconds** | &lt; 15 seconds Target | ✅ **PASSED** |
| **Average Token Cost per Generation** | **$0.00018** | &lt; $0.01 Budget | ✅ **PASSED** |
| **Daily Operational Cost (1,000 runs)**| **$0.18 / day** | &lt; $1.00 / day Ceiling | ✅ **PASSED** |
| **Offline Resilience Fallback** | **100% Operational** | Seamless Degradation | ✅ **PASSED** |

---

## 8. Vercel Cloud Deployment & Infrastructure Setup

### Environment Variables Required
```env
GEMINI_API_KEY="your_primary_google_gemini_api_key"
GEMINI_API_KEY_2="optional_backup_key_for_rotation"
GEMINI_API_KEY_3="optional_tertiary_key_for_rotation"
NEXT_PUBLIC_APP_URL="https://sketch2-code-yd7c-git-master-jc-project.vercel.app"
```

### Deployment Configuration (`next.config.ts`)
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@google/generative-ai"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
```

---

## 9. 2-Minute Video Pitch & Demo Narration Guide

| Time | Screen Action | Spoken Narration |
|---|---|---|
| **0:00 – 0:25** | Landing Page (`/`) with Liquid Glass Theme | *"Good morning! Two years ago, turning a napkin sketch or whiteboard layout into clean, functional code took 3 to 5 days of Figma mockups and frontend coding. Today, we built WhiteboardOS—an instant multimodal generative compiler that turns physical sketches and voice dictation into production-ready web applications in 10 seconds."* |
| **0:25 – 0:55** | Upload Sketch / Live Studio (`/create`) | *"Here, I upload a hand-drawn restaurant wireframe. In real-time, Gemini Multimodal Vision AI scans the layout, reading the exact handwritten text—navigation, search bar, operating hours, location details, menu prices, and reservation forms—detecting every component with confidence scores."* |
| **0:55 – 1:30** | Click "Generate" & Streaming Terminal | *"When I click Generate, our Server-Sent Events pipeline streams production HTML, CSS, and React code token-by-token directly inside our macOS developer terminal."* |
| **1:30 – 2:05** | Interactive Living Prototype & Sandbox | *"Here is the generated living prototype running inside our sandboxed iframe. Every section is fully interactive. Now, watch me iterate: I'll type 'Make the buttons glowing amber and add a private dining notice'—the conversational AI updates the code instantly."* |
| **2:05 – 2:30** | Version Timeline, `/eval` Suite & ZIP Export | *"We can time-travel across versions, verify our 96% detection accuracy in the `/eval` benchmark suite, and download the production-ready ZIP bundle with a single click. Thank you!"* |

---

*WhiteboardOS — Multimodal Sketch-to-Code Living Prototype Engine.*
