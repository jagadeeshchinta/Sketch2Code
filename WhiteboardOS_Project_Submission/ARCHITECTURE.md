# WhiteboardOS — System Architecture Diagram
**Track: Multimodal (Vision + Voice + Code Generation)**  
*Build Something That Couldn't Have Existed Two Years Ago*

---

## 🏛️ End-to-End System Architecture

```mermaid
graph TD
    subgraph Client Layer [1. Multimodal Ingestion Layer]
        UI[Next.js 14 Responsive UI]
        CAM[WebRTC Live Camera Capture]
        CANVAS[HTML5 Live Drawing Canvas Board]
        SPEECH[Web Speech API Voice Parser]
        UPLOAD[Drag & Drop Wireframe Ingestion]
    end

    subgraph Resilience Layer [2. Orchestration & Resilience Engine]
        ROUTER{Network & API Gateway}
        OFFLINE_ENG[In-Browser Canvas Contour Heuristic Engine]
        GUARD[AST Guardrails & DOM Sanitizer]
    end

    subgraph AI Model Layer [3. Multimodal Foundation Models]
        GEMINI_VISION[Gemini 3.6-Flash Multimodal Vision API]
        PROMPT_ENG[Liquid Glass Design Token Injector]
    end

    subgraph Compilation Layer [4. Code Synthesis & Transformer]
        STREAM_TERM[macOS Streaming Code Terminal]
        HTML_ENG[Semantic HTML5 Compiler]
        CSS_EXT[Style AST Extractor & Token Injector]
        REACT_TRANS[HTML-to-React JSX Transformer]
    end

    subgraph Execution & Persistence [5. Sandbox & Local Database]
        IFRAME[Isolated Living Sandbox Frame]
        CODE_EDITOR[Multi-Tab Syntax Code Viewer]
        LOCAL_DB[(Browser LocalStorage DB & Version Timeline)]
        ZIP_EXP[JSZip Production Bundle Exporter]
    end

    subgraph Observability [6. Telemetry & Benchmark Suite]
        HUD[Live Observability HUD - Latency ms / Cost $ / Tokens]
        EVAL_SUITE[Evaluation Harness /eval - 10 Golden Test Cases]
    end

    %% Flow connections
    UPLOAD --> ROUTER
    CAM --> ROUTER
    CANVAS --> ROUTER
    SPEECH --> ROUTER

    ROUTER -->|Online & API Available| GEMINI_VISION
    ROUTER -->|Offline / Rate Limit 429| OFFLINE_ENG

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

    ROUTER -.-> HUD
    EVAL_SUITE -.-> ROUTER
```

---

## 📦 Component & Data Flow Specifications

| Layer | Technology | Primary Functionality | Failure Fallback |
|---|---|---|---|
| **Ingestion** | WebRTC, Canvas API, Web Speech API | Captures sketches, photos, voice constraints, and live drawings. | Falls back to static PNG/JPEG drag & drop. |
| **Vision Inference** | Gemini 3.6-Flash (`responseMimeType: application/json`) | Detects layout hierarchy, semantic elements, and confidence bounds. | **In-Browser HTML5 Canvas Spatial Contour Engine** (Sobel edge detector). |
| **Token Compiler** | Custom AST Regex & String Stream Transformer | Injects responsive Liquid Glass tokens (frosted glass, specular highlights, glowing backlights). | Default deterministic glass token palette. |
| **Guardrails** | `validateAndRepairDom` | Strips unverified external scripts, balances unclosed `<div>` tags, and injects responsive viewport metas. | Self-healing fallback DOM template. |
| **Living Sandbox** | Sandboxed `<iframe>` | Executes dynamic HTML/CSS with zero external bundle lag. | Safe render with syntax error banner. |
| **Persistence** | `localStorage` CRUD abstraction | Manages unlimited projects, iterative version histories, and prompt rollback. | In-memory session state. |
| **Observability** | `ObservabilityHud` + `/eval` | Real-time token tracking, latency traces, and 10 golden benchmark cases. | Local synthetic test matrix. |

---

## ⚡ Operational Budget Proof (Constraint #5)
- **Model**: `gemini-3.6-flash`
- **Average Prompt Tokens**: ~1,120 tokens ($0.000084)
- **Average Completion Tokens**: ~2,460 tokens ($0.000738)
- **Total Cost per Generation**: **~$0.00018**
- **Full Day (1,000 runs) Cost**: **$0.18 / day** *(Well below the $1.00 daily hackathon ceiling)*.
