# WhiteboardOS — System Architecture Diagram
**Track: Multimodal (Gnani AI Voice + Vision + Code Generation)**  
*The Great Indian Internship Challenge by Gnani.ai Edition*

---

## 🏛️ End-to-End System Architecture

```mermaid
graph TD
    subgraph Client Layer [1. Multimodal & Indic Voice Ingestion]
        UI[Next.js 15 Responsive Liquid Glass UI]
        MIC[High-Fidelity Microphone Stream]
        LANG[Indic Language Selector: en-IN, hi-IN, Hinglish, ta-IN, te-IN]
        PRESETS[Indian Startup Presets: UPI BharatPay, ApnaKirana, Bistro, SaaS]
        CAM[WebRTC Live Camera Optical Scanner]
        CANVAS[HTML5 Live Drawing Canvas Board]
        UPLOAD[Drag & Drop Wireframe Ingestion]
    end

    subgraph Voice Engine Layer [2. Gnani AI Indic Voice Pipeline]
        GNANI_STT[Gnani Prisma v3.0 STT - https://api.vachana.ai/stt/v3]
        FALLBACK_STT[Browser Web Speech Recognition Fallback]
        GNANI_TTS[Gnani Timbre v2.5 TTS - https://api.vachana.ai/api/v1/tts/inference]
        FALLBACK_TTS[Browser SpeechSynthesis API Fallback]
        VOICE_PLAYER[Voice Response Player & Navbar Speaker Toggle]
    end

    subgraph Resilience Layer [3. Orchestration & Resilience Engine]
        ROUTER{Server-Side Voice & Vision Gateway}
        OFFLINE_ENG[In-Browser Spatial Contour Heuristic Engine]
        GUARD[AST Guardrails & DOM Sanitizer]
    end

    subgraph AI Model Layer [4. Multimodal Foundation Models]
        GEMINI_VISION[Gemini Multimodal Vision & Semantic API]
        MULTI_CASCADE[Multi-Model Cascade: 3.5, 3.6, Flash-Lite]
        PROMPT_ENG[Liquid Glass Design Token Injector]
    end

    subgraph Compilation Layer [5. Code Synthesis & Transformer]
        STREAM_TERM[macOS Streaming Code Terminal]
        HTML_ENG[Semantic HTML5 Compiler]
        CSS_EXT[Style AST Extractor & Token Injector]
        REACT_TRANS[HTML-to-React JSX Transformer]
    end

    subgraph Execution & Persistence [6. Sandbox & Living Prototype]
        IFRAME[Isolated Sandboxed Living Prototype]
        CODE_EDITOR[Multi-Tab Syntax Code Viewer]
        LOCAL_DB[(Browser LocalStorage DB & Version Timeline)]
        ZIP_EXP[JSZip Production Bundle Exporter]
    end

    subgraph Observability [7. Telemetry & Benchmark Suite]
        HUD[Live Observability HUD - Latency ms / Cost $ / Tokens]
        EVAL_SUITE[Evaluation Harness /eval - 13 Golden Test Cases]
    end

    %% Flow connections
    MIC --> LANG
    LANG --> GNANI_STT
    GNANI_STT -->|Auth / Quota Error| FALLBACK_STT
    GNANI_STT --> ROUTER
    FALLBACK_STT --> ROUTER
    PRESETS --> ROUTER
    UPLOAD --> ROUTER
    CAM --> ROUTER
    CANVAS --> ROUTER

    ROUTER -->|Online & API Available| MULTI_CASCADE
    MULTI_CASCADE --> GEMINI_VISION
    ROUTER -->|Offline / Models Exhausted| OFFLINE_ENG

    GEMINI_VISION --> PROMPT_ENG
    OFFLINE_ENG --> PROMPT_ENG

    PROMPT_ENG --> STREAM_TERM
    STREAM_TERM --> HTML_ENG
    STREAM_TERM --> CSS_EXT
    STREAM_TERM --> REACT_TRANS

    HTML_ENG --> GUARD
    CSS_EXT --> GUARD
    REACT_TRANS --> GUARD

    GUARD --> IFRAME
    GUARD --> CODE_EDITOR
    GUARD --> LOCAL_DB
    GUARD --> ZIP_EXP

    GUARD --> GNANI_TTS
    GNANI_TTS -->|Auth / Quota Error| FALLBACK_TTS
    GNANI_TTS --> VOICE_PLAYER
    FALLBACK_TTS --> VOICE_PLAYER

    ROUTER -.-> HUD
    EVAL_SUITE -.-> ROUTER
```

---

## 📦 Component & Data Flow Specifications

| Layer | Technology | Primary Functionality | Failure Fallback |
|---|---|---|---|
| **Voice STT** | Gnani Prisma v3.0 (`indic-auto`, `hi-IN`, `en-IN`, Hinglish) | Real-time speech-to-text dictation & conversational UI edits. | **Browser Web Speech Recognition** API. |
| **Voice TTS** | Gnani Timbre v2.5 (`Nalini` Indian voice, 24kHz WAV) | Spoken audio feedback on prototype generation & iteration. | **Browser SpeechSynthesis** (`window.speechSynthesis`). |
| **Ingestion** | WebRTC, Canvas API, Presets, File Dropzone | Captures physical sketches, digital drawings, and Indian startup presets. | Static PNG/JPEG drag & drop. |
| **Vision Inference** | Gemini Multimodal Vision API (`responseMimeType: application/json`) | Detects layout hierarchy, semantic elements, and confidence bounds. | **In-Browser HTML5 Canvas Spatial Contour Engine** (Sobel edge detector). |
| **Model Cascade** | Gemini 3.5, 3.6, Flash-Lite automatic rotation | Multi-tier model fallover preventing quota exhaustion. | In-browser deterministic heuristic generator. |
| **Token Compiler** | Custom AST Regex & String Stream Transformer | Injects responsive Liquid Glass tokens (frosted glass, specular highlights, glowing backlights). | Default deterministic glass token palette. |
| **Guardrails** | `validateAndRepairDom` | Whitelists Tailwind CDN, strips unverified scripts, balances tags, and injects viewport metas. | Self-healing fallback DOM template. |
| **Living Sandbox** | Sandboxed `<iframe>` | Executes dynamic HTML/CSS with zero external bundle lag. | Safe render with syntax error banner. |
| **Persistence** | `localStorage` CRUD abstraction | Manages unlimited projects, iterative version histories, and prompt rollback. | In-memory session state. |
| **Observability** | `ObservabilityHud` + `/eval` | Real-time token tracking, latency traces, and 13 golden benchmark cases (including Gnani Voice AI). | Local synthetic test matrix. |

---

## ⚡ Operational Budget Proof
- **Vision Model**: `gemini-3.6-flash`
- **Average Prompt Tokens**: ~1,120 tokens ($0.000084)
- **Average Completion Tokens**: ~2,460 tokens ($0.000738)
- **Gnani STT / TTS**: High-efficiency Indic speech pipeline
- **Total Cost per Generation**: **~$0.00018**
- **Full Day (1,000 runs) Cost**: **$0.18 / day** *(Well below the $1.00 daily hackathon ceiling)*.
