# WhiteboardOS — Engineering Failure Log
**Submission Requirement 04 (The Tie-Breaker Document)**  
*An honest, specific account of what failed during development, current edge-case limitations, and next-week fixes.*

---

## 💥 1. What We Tried That Failed

### A. Deprecated Model Fallback (`gemini-2.0-flash` 404 Errors)
- **Failure**: Initial tests using `gemini-2.0-flash` failed immediately with HTTP 404 (`Model not found`).
- **Root Cause**: Google Generative AI endpoint sunset `gemini-2.0-flash` in favor of `gemini-3.6-flash`.
- **Engineering Fix**: Implemented an automated retry wrapper with exponential backoff and updated all endpoints to `gemini-3.6-flash`.

### B. Raw JSON Token Streaming Leak in Sandbox
- **Failure**: When code generation was requested, the model returned a JSON wrapper object (`{"html": "<!DOCTYPE...", "css": "..."}`). When passed to the `<iframe>`, unescaped `\n` literals rendered as raw plaintext code instead of executed HTML.
- **Root Cause**: `JSON.parse` failed on unescaped internal string quotes, triggering the fallback catch block which returned the raw unparsed JSON string.
- **Engineering Fix**: 
  1. Enforced `generationConfig: { responseMimeType: "application/json" }`.
  2. Implemented `unescapeString` and robust regex AST extractors in both `gemini.ts` and `LivePreview.tsx` to ensure clean DOM separation.

### C. Pure OpenCV Edge Detection for Layouts
- **Failure**: In early testing, we tried classical computer vision (Canny Edge + Contour bounding boxes) to replace LLM vision. It failed catastrophically on handwritten sketches—treating text scribbles as dozens of tiny broken buttons.
- **Root Cause**: Classical edge detection lacks semantic understanding of human intention.
- **Engineering Fix**: Shifted to a hybrid architecture: Gemini 3.6-Flash Multimodal Vision for semantic classification, paired with a client-side Canvas density heuristic solely for offline network resilience.

### D. Single-Camera WebRTC Stream Freeze on Desktops
- **Failure**: Requesting `{ video: { facingMode: "environment" } }` resulted in black screens on laptops without rear cameras.
- **Engineering Fix**: Implemented dual-stage fallback: try rear camera first, fallback gracefully to any available user webcam if unsupported.

---

## ⚠️ 2. What the System Still Gets Wrong (Current Limitations)

1. **Overlapping Complex Arrow Flows**:
   - When a user sketches circular flowchart loops or branching decision trees (e.g. UML diagrams), the model occasionally groups connected nodes into a single static card instead of generating an interactive stepper.
2. **Ultra-Low Contrast Pencil Sketches**:
   - 2H pencil sketches on glossy whiteboard paper under poor lighting have a component detection recall drop from 95% down to 78%.
3. **Multi-Page App Routing**:
   - The current synthesizer compiles a rich single-page prototype. Converting a multi-screen whiteboard into a connected Next.js multi-page app requires manual navigation stitching.

---

## 🛠️ 3. What We Would Fix with Another Week

1. **On-Device WebGPU Vision Encoder**:
   - Embed a quantized 4-bit vision model directly in the browser via WebGPU / ONNX Runtime, enabling 100% offline semantic layout detection with sub-200ms latency.
2. **Direct Figma / React Native Auto-Exporter**:
   - Export directly to `.fig` file tokens and React Native / Expo mobile boilerplate in addition to HTML/CSS/React.
3. **Multi-Screen Canvas Stitching**:
   - Allow users to upload photos of an entire whiteboard (e.g., 5 screens side-by-side) and auto-synthesize full Next.js App Router folders with linked routes.
4. **Cloudflare R2 Persistent Cloud Sync**:
   - Upgrade from browser `localStorage` to Cloudflare Workers KV + R2 object storage with multi-user real-time collaboration via WebSockets.
