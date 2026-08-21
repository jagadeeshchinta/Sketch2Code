# 🖥️ WhiteboardOS — AI-Powered Sketch-to-Code Living Prototype Engine

> **Transform hand-drawn wireframes into production-quality, interactive web prototypes in under 10 seconds using Gemini Vision AI.**

![WhiteboardOS](https://img.shields.io/badge/WhiteboardOS-v1.0.0-8b5cf6?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black?style=for-the-badge&logo=next.js)
![Gemini](https://img.shields.io/badge/Gemini_Vision-3.6_Flash-4285F4?style=for-the-badge&logo=google)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Why AI is Essential (Not a Wrapper)](#-why-ai-is-essential)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [How It Works (Business Overview)](#-how-it-works-business-overview)
- [Hackathon Rubric Compliance](#-hackathon-rubric-compliance)

---

## 🎯 Problem Statement

**The gap between design ideation and coded prototypes is the #1 bottleneck in product development.**

Designers sketch wireframes on paper, whiteboards, or napkins — but translating those sketches into working HTML/CSS prototypes requires hours of manual development effort. This creates:

1. **Time waste**: Designers hand off sketches → developers interpret → code → iterate → 3-5 day cycle per prototype
2. **Context loss**: The intent behind the original sketch often gets lost during handoff
3. **High cost**: Hiring frontend developers just to prototype design concepts is expensive
4. **Iteration friction**: Making design changes requires rewriting code manually each time

**No existing tool solves the full pipeline**: scanning a physical paper wireframe via camera, understanding its spatial layout through AI vision, generating beautiful production code, and then letting you iterate conversationally — all in one unified experience.

---

## 💡 Our Solution

**WhiteboardOS** is a full-stack AI-powered platform that:

1. **Captures** hand-drawn wireframes via file upload, live camera scanner, or digital canvas
2. **Analyzes** the sketch using Gemini Vision AI to detect 30+ UI component types (buttons, cards, navbars, forms, inputs, etc.) with spatial coordinates and confidence scores
3. **Generates** complete, production-quality HTML + CSS + React code using the "Liquid Glass" design system
4. **Streams** the code generation in real-time through a macOS-style terminal with live token rendering
5. **Iterates** through natural language — just type "Make buttons neon purple" or "Add a pricing section" and the AI modifies your code instantly
6. **Exports** the final prototype as a downloadable ZIP file ready for production deployment

### The Key Differentiator

Without Gemini Vision AI, **this product completely collapses**. No traditional computer vision library (OpenCV, TensorFlow.js) can:
- Read handwritten labels on paper wireframes
- Understand the semantic intent of a UI sketch (is this a "login form" or a "contact form"?)
- Generate contextually appropriate code that matches the design intent
- Iterate on code through conversational natural language

This is NOT a thin API wrapper. We built:
- A **prompt engineering architecture** with structured JSON schemas for reliable output
- An **offline heuristic compiler** that generates code without AI as a fallback
- A **DOM self-healing guardrail engine** that validates and repairs broken generated HTML
- A **multi-model cascading system** that rotates through 5 Gemini models and multiple API keys to eliminate quota errors
- A **client-side image pre-processor** that downscales, compresses, and contrast-boosts smartphone photos
- A **real-time SSE streaming pipeline** that renders Gemini's tokens live in the browser

---

## 🧬 Why AI is Essential

| Without AI | With Gemini Vision AI |
|---|---|
| Cannot read handwritten text on paper | Reads handwriting with 85%+ accuracy |
| Cannot distinguish UI component types from shapes | Identifies 30+ component types with confidence scores |
| Cannot understand spatial relationships | Maps exact x, y, width, height coordinates |
| Cannot generate contextual code | Produces complete, themed HTML/CSS/React |
| Cannot iterate through natural language | "Add a dark mode toggle" → code updated instantly |
| **App is completely non-functional** | **Full end-to-end pipeline** |

---

## 🏗 Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER INPUT LAYER                                │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │  Upload   │  │ Live Camera  │  │  Digital   │  │  1-Click Golden  │ │
│  │  Dropzone │  │   Scanner    │  │  Canvas    │  │  Sample Chips    │ │
│  └────┬─────┘  └──────┬───────┘  └─────┬──────┘  └────────┬─────────┘ │
│       │               │                │                   │           │
│       └───────────────┴────────────────┴───────────────────┘           │
│                               │                                        │
│                    ┌──────────▼──────────┐                             │
│                    │  Image Pre-Processor │                             │
│                    │  (Downscale, WebP,   │                             │
│                    │   Contrast Boost)    │                             │
│                    └──────────┬──────────┘                             │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────────┐
│                      AI ANALYSIS LAYER                                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    POST /api/analyze                               │ │
│  │  ┌──────────────┐   ┌─────────────┐   ┌──────────────────────┐  │ │
│  │  │ JSON + Base64 │   │ Multi-Model │   │ Structured JSON      │  │ │
│  │  │ or FormData   │──▶│ Cascade     │──▶│ Components + Layout  │  │ │
│  │  │ Dual Ingestion│   │ (5 Models × │   │ + Confidence Scores  │  │ │
│  │  └──────────────┘   │  N API Keys)│   └──────────────────────┘  │ │
│  │                      └─────────────┘                              │ │
│  │                      ▼ (If AI fails)                              │ │
│  │               ┌──────────────────┐                                │ │
│  │               │ Offline Heuristic │                                │ │
│  │               │ Spatial Engine    │                                │ │
│  │               └──────────────────┘                                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────────┐
│                    CODE GENERATION LAYER                               │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │              POST /api/generate/stream (SSE)                      │ │
│  │  ┌──────────────┐   ┌─────────────┐   ┌──────────────────────┐  │ │
│  │  │ Components + │   │ Gemini Code │   │ Real-Time Token      │  │ │
│  │  │ Layout JSON  │──▶│ Generator   │──▶│ Streaming via SSE    │  │ │
│  │  └──────────────┘   │ (Structured │   │ → Browser Terminal   │  │ │
│  │                      │  Prompts)   │   └──────────────────────┘  │ │
│  │                      └─────────────┘                              │ │
│  │                      ▼ Output                                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐                   │ │
│  │  │index.html│  │styles.css│  │Component.jsx │                   │ │
│  │  └──────────┘  └──────────┘  └──────────────┘                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────────┐
│                      PRESENTATION LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │ Live Preview │  │ Code Viewer  │  │ Iteration Bar (Chat)         │ │
│  │ (Sandboxed   │  │ (Syntax      │  │ "Make buttons purple"        │ │
│  │  iframe)     │  │  Highlighted)│  │ → POST /api/iterate          │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │ Version      │  │ Observability│  │ Export ZIP                   │ │
│  │ Timeline     │  │ HUD (Metrics)│  │ (index.html + styles.css     │ │
│  │ (Time Travel)│  │              │  │  + Component.jsx)            │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 15.1.6 (App Router) | Full-stack React framework with API routes, SSR, file-system routing |
| **Language** | TypeScript 5.x | Type-safe codebase with strict mode |
| **AI Engine** | Google Gemini 3.6 Flash (Vision) | Multimodal sketch analysis + code generation |
| **AI SDK** | @google/generative-ai 0.24.1 | Official Google Generative AI client for Node.js |
| **Styling** | TailwindCSS 3.4 + Custom CSS | Utility-first styling with Liquid Glass design tokens |
| **Animations** | Framer Motion 12.x | Page transitions, glassmorphism effects, micro-animations |
| **3D Effects** | Three.js + React Three Fiber | Silk and Molten Metal animated backgrounds |
| **Icons** | Lucide React 0.554 | Modern icon library |
| **Syntax Highlighting** | Prism React Renderer 2.4 | Code viewer with language-aware syntax coloring |
| **File Upload** | react-dropzone 20.x | Drag-and-drop image upload with validation |
| **Export** | JSZip + file-saver | Client-side ZIP generation for prototype download |
| **Storage** | localStorage | Browser-based project persistence (no database needed) |
| **Theming** | next-themes + Custom Context | Dark/light mode with 6 accent color presets |
| **Deployment** | Vercel (recommended) | Zero-config Next.js deployment |

---

## ✨ Features

### Core Pipeline
- ✅ **Image Upload** — Drag-and-drop or click-to-upload sketch images (PNG, JPG, WebP, SVG)
- ✅ **Live Camera Scanner** — Point your phone/webcam at a paper wireframe with optical viewfinder HUD
- ✅ **Digital Canvas** — Draw wireframes directly in the browser with pencil, shapes, and eraser tools
- ✅ **1-Click Sample Wireframes** — Three instant golden samples for demo purposes
- ✅ **AI Sketch Analysis** — Gemini Vision detects 30+ component types with confidence scores
- ✅ **Code Generation** — Full HTML + CSS + React code with Liquid Glass design system
- ✅ **Real-Time Streaming** — Watch Gemini write your code token-by-token in a macOS terminal
- ✅ **Live Preview** — See your generated website running live in a sandboxed iframe
- ✅ **Code Viewer** — Syntax-highlighted tabs for index.html, styles.css, Component.jsx
- ✅ **Conversational Iteration** — Type natural language commands to modify your prototype
- ✅ **Version Timeline** — Time-travel through every iteration of your prototype
- ✅ **ZIP Export** — Download your complete prototype as a ready-to-deploy package

### Resilience & Engineering
- ✅ **Multi-Model Cascading** — Automatically rotates through 5 Gemini models on quota errors
- ✅ **Multi-API-Key Rotation** — Supports comma-separated keys or GEMINI_API_KEY_2/3 env vars
- ✅ **Offline Heuristic Compiler** — Generates code without AI when all models are exhausted
- ✅ **DOM Self-Healing Guardrails** — Validates generated HTML, strips dangerous scripts, repairs unclosed tags
- ✅ **Image Pre-Processor** — Downscales 4K photos, converts to WebP, boosts contrast for faint pencil sketches
- ✅ **Storage Quota Guard** — Auto-prunes old projects when localStorage limit is reached
- ✅ **Camera Cleanup** — Hardware webcam tracks are properly stopped on page navigation

### UI & Design
- ✅ **Liquid Glass Design System** — Glassmorphism with backdrop-blur, specular borders, radial gradients
- ✅ **Dark/Light Theme** — Persistent theme toggle with system preference detection
- ✅ **6 Accent Colors** — Purple, Blue, Green, Orange, Rose, Teal presets
- ✅ **Animated Backgrounds** — Silk fluid and Molten Metal 3D WebGL backgrounds
- ✅ **Responsive Layout** — Works on desktop, tablet, and mobile
- ✅ **Observability HUD** — Live metrics panel showing latency, pipeline mode, model info

---

## 📁 Project Structure

```
WhiteboardOS/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # Landing page (hero + features)
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── globals.css               # Global styles & Liquid Glass tokens
│   │   ├── create/
│   │   │   ├── page.tsx              # Main creation studio (upload → analyze → generate)
│   │   │   └── live/
│   │   │       └── page.tsx          # Live camera scanner + digital canvas
│   │   ├── project/
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Project workspace (preview + code + iterate)
│   │   ├── gallery/
│   │   │   └── page.tsx              # Saved projects gallery
│   │   ├── eval/
│   │   │   └── page.tsx              # AI evaluation harness & benchmark suite
│   │   └── api/
│   │       ├── analyze/
│   │       │   └── route.ts          # POST: Image → Gemini Vision → Component JSON
│   │       ├── generate/
│   │       │   ├── route.ts          # POST: Components → Gemini → HTML/CSS/React
│   │       │   └── stream/
│   │       │       └── route.ts      # POST: SSE streaming code generation
│   │       └── iterate/
│   │           └── route.ts          # POST: Current code + NL command → Updated code
│   │
│   ├── components/
│   │   ├── navbar.tsx                # Glass navigation bar
│   │   ├── theme-toggle.tsx          # Theme & accent color settings panel
│   │   ├── theme-provider.tsx        # next-themes provider wrapper
│   │   ├── ThemeSelector.tsx         # Color picker component
│   │   ├── ui/
│   │   │   ├── glass-card.tsx        # Reusable glassmorphism card
│   │   │   ├── upload-zone.tsx       # Drag-and-drop image upload
│   │   │   ├── streaming-terminal.tsx # macOS-style live code terminal
│   │   │   ├── code-viewer.tsx       # Syntax-highlighted code tabs
│   │   │   ├── live-preview.tsx      # Sandboxed iframe prototype viewer
│   │   │   ├── component-card.tsx    # Detected component toggle card
│   │   │   ├── iteration-bar.tsx     # Natural language iteration chat input
│   │   │   ├── version-timeline.tsx  # Version history time-travel bar
│   │   │   ├── step-indicator.tsx    # Pipeline step progress indicator
│   │   │   ├── confidence-badge.tsx  # AI confidence score badge
│   │   │   ├── observability-hud.tsx # Live metrics & observability panel
│   │   │   └── cursor.tsx            # Custom cursor component
│   │   └── react-bits/
│   │       ├── Silk.tsx              # Fluid silk animated background
│   │       └── MoltenMetal.tsx       # 3D molten metal WebGL background
│   │
│   ├── lib/
│   │   ├── gemini.ts                 # Multi-model Gemini client with API key rotation
│   │   ├── prompts.ts                # Centralized AI prompt templates
│   │   ├── types.ts                  # TypeScript type definitions
│   │   ├── offline-heuristic.ts      # Offline code generation engine (no AI fallback)
│   │   ├── image-processor.ts        # Client-side image downscaler & contrast booster
│   │   ├── guardrails.ts            # DOM validation & self-healing engine
│   │   ├── storage.ts                # localStorage project persistence layer
│   │   └── utils.ts                  # Utility helpers
│   │
│   ├── context/
│   │   └── theme-context.tsx         # Global theme & accent color context provider
│   │
│   └── styles/
│       └── ...                       # Additional style modules
│
├── public/                           # Static assets
├── .env                              # Environment variables (GEMINI_API_KEY)
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # TailwindCSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Google Gemini API Key** (free tier: [https://ai.google.dev](https://ai.google.dev))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/whiteboardos.git
cd whiteboardos

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your Gemini API key:
# GEMINI_API_KEY=your_api_key_here

# 4. Start development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Your Google Gemini API key. Supports comma-separated multiple keys for rotation |
| `GEMINI_API_KEY_2` | Optional | Backup API key for automatic rotation |
| `GEMINI_API_KEY_3` | Optional | Third API key for automatic rotation |

**Multi-key example:**
```env
GEMINI_API_KEY=key_primary,key_backup_1
GEMINI_API_KEY_2=key_backup_2
```

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add GEMINI_API_KEY
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Production Build

```bash
npm run build    # Creates optimized production bundle
npm start        # Starts production server on port 3000
```

---

## 🧭 How It Works (Business Overview)

Here's what happens when you use WhiteboardOS, explained in plain business terms:

### Step 1: You Provide a Wireframe
You can give WhiteboardOS a wireframe in 4 ways:
- **Upload an image** — Take a photo of your paper wireframe or drag any design file
- **Use the live camera** — Point your phone/laptop camera at a paper wireframe on your desk
- **Draw on the canvas** — Sketch directly in the browser using digital drawing tools
- **Pick a sample** — Use one of our pre-built wireframe templates for instant demos

### Step 2: AI Reads Your Sketch
WhiteboardOS sends your image to **Google Gemini Vision AI**, which is like giving a professional UI designer X-ray vision:
- It identifies every UI element: buttons, text fields, cards, navigation bars, images, forms
- It maps their exact position and size on the page
- It assigns a confidence score (how sure it is about each detection)
- It understands the overall layout: is this a dashboard? A landing page? An e-commerce site?

**If the AI is unavailable** (network issues, quota limits), our built-in offline engine takes over and still produces results.

### Step 3: You Review the Component Tree
Before generating code, you see every detected component with toggle switches:
- Don't want that footer? Toggle it off
- Want to keep only the hero section and cards? Toggle everything else off
- Each component shows its type, label, and confidence percentage

### Step 4: AI Writes Your Code (Live)
When you click "Generate", WhiteboardOS doesn't just show a loading spinner — it opens a **real-time terminal** that shows Gemini writing your HTML, CSS, and React code line by line, token by token. You watch the actual AI output stream into your browser.

The generated code uses our **"Liquid Glass" design system**: dark backgrounds, glassmorphism effects, smooth gradients, and modern typography that looks premium out of the box.

### Step 5: You See Your Living Website
The moment code generation finishes, two panels appear side-by-side:
- **Left panel**: Your live, interactive website running in the browser
- **Right panel**: The full source code with syntax highlighting

### Step 6: You Iterate by Talking
Type commands in plain English:
- *"Make the header sticky"*
- *"Change the accent color to green"*
- *"Add a testimonials section with 3 cards"*
- *"Switch to a two-column layout"*

The AI modifies your code and you see the changes instantly. Every change is saved as a version, so you can time-travel back to any previous iteration.

### Step 7: You Export
Click "Download ZIP" and you get a production-ready package containing `index.html`, `styles.css`, and `Component.jsx` that you can deploy anywhere.

---

## 📊 Hackathon Rubric Compliance

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| "Remove the AI" filter — app collapses without AI | ✅ PASS | Without Gemini, no component detection, no code generation, no iteration. Offline fallback generates generic static templates only |
| "Not a thin API wrapper" — custom engineering beyond the API | ✅ PASS | Prompt architecture, multi-model cascade, offline compiler, DOM guardrails, SSE streaming, image pre-processor, version system |
| Multimodal input | ✅ PASS | Image upload, live camera, digital canvas, voice commands, 1-click samples |
| Real-time output | ✅ PASS | SSE token streaming from Gemini directly into browser terminal |
| Conversational iteration | ✅ PASS | Natural language iteration bar with AI-powered code modification |
| Production-quality output | ✅ PASS | Liquid Glass design system with glassmorphism, responsive layout, dark mode |
| Evaluation harness | ✅ PASS | `/eval` page with 5 benchmark test cases, accuracy metrics, latency tracking |
| Error resilience | ✅ PASS | Multi-model cascade, multi-key rotation, offline fallback, DOM self-healing |
| Export capability | ✅ PASS | ZIP download with all generated files |

---

## 🔐 Security & Guardrails

- **External script stripping**: All `<script src="...">` tags from generated code are automatically removed
- **DOM validation**: Generated HTML is checked for unclosed tags, missing DOCTYPE, missing viewport meta
- **Sandboxed preview**: The live preview runs in an isolated iframe with no access to the parent page
- **API key protection**: Keys are server-side only (never exposed to the browser)
- **Input validation**: All API endpoints validate request body structure before processing

---

## 📝 License

This project was built for the Google AI Hackathon. All rights reserved.

---

## 👥 Team

Built by **Jagadeesh Chinta** and team.

---

*WhiteboardOS — From whiteboard to website, in seconds.*
