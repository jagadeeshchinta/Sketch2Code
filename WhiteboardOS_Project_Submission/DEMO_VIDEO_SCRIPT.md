# WhiteboardOS — 2-Minute Spoken Pitch Script
**Submission Requirement 02: "Why Shortlist Us" Pitch**  
*Memorize or reference this 2-minute pitch when judges arrive at your table.*

---

## 🎤 Spoken Pitch (Time: 120 Seconds)

### [00:00 - 00:20] The Hook & Theme Filter
> *"Good morning judges! Two years ago, if you scribbled a website layout on a napkin or a whiteboard during a sprint meeting, turning that sketch into an interactive, responsive website required 48 hours of tedious Figma design and manual CSS coding. Today, we built **WhiteboardOS** — an instant multimodal compiler that turns physical whiteboard drawings, camera photos, and live voice notes into production-ready Liquid Glass prototypes in 5 seconds."*

---

### [00:20 - 01:20] Answering The 5 Mandatory Questions

#### 1. What problem, and who exactly has it?
> *"**Sneha, a Solo Founder & Product Manager** at an early-stage startup. She spends 15+ hours wireframing on notebooks and whiteboards during sprint planning, but translating those sketches into a clickable, responsive frontend prototype requires days of tedious Figma-to-code translation. WhiteboardOS eliminates that 48-hour gap in 10 seconds."*

#### 2. What is the non-obvious hard part?
> *"Translating 2D spatial bounding boxes into **nested, responsive Flexbox/Grid container hierarchies** while enforcing an isolated, deterministic design system (Liquid Glass tokens) without hallucinating broken external CDN dependencies."*

#### 3. What did you build versus what did the API give you?
> *"The API only gave raw text and vision tokens. We built everything around it:*
> 1. *An **In-Browser Canvas Contour Fallback Engine** that works even when the network is dead.*
> 2. *A **Deterministic Liquid Glass AST Compiler** that structures CSS variables, specular ridges, and animations.*
> 3. *An **AST Guardrail & DOM Self-Healing Engine** that validates and repairs unclosed containers.*
> 4. *A **Streaming macOS Code Terminal** with real-time file tabs and latency/cost telemetry.*
> 5. *An **Automated Evaluation Benchmark Suite (`/eval`)** testing 10 distinct wireframe topologies."*

#### 4. Why does this break if you remove the AI?
> *"Because computer vision heuristics (OpenCV edge detection) cannot distinguish between a handwritten 'Submit' button, a search bar, or an image placeholder box with an 'X'. Without the multimodal LLM, the system cannot parse semantic intent from messy drawings."*

#### 5. What breaks at ten thousand users?
> *"Two things: First, free-tier Gemini API rate limits (15 RPM). Second, browser `localStorage` quotas (5MB). To scale to 10k users, we'd implement an async job queue with Redis/BullMQ, offload image base64 blobs to Cloudflare R2 object storage with signed URLs, and cache common component embeddings in pgvector."*

---

### [01:20 - 02:00] Live Demonstration Flow
1. **Show the Upload / Live Studio**: Upload a messy hand-drawn sketch or live webcam photo.
2. **Show the AI Analysis & Component Tree**: Point out the confidence scores and toggle switches.
3. **Show the Live Streaming macOS Terminal**: Watch the code compile in real-time.
4. **Show the Split Screen**: Live interactive website on the right, multi-tab code viewer (`HTML`, `CSS`, `React`) on the left.
5. **Demonstrate AI Iteration**: Type *"Make buttons neon purple"* and watch the sandbox update instantly.
6. **Open `/eval` Suite**: Show judges the live benchmark score (96% recall accuracy, $0.00018/run).
7. **Show Observability HUD**: Prove the system operates for &lt; $0.20/day (Constraint #5).
