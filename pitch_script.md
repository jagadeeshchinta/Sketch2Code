# WhiteboardOS — 2-Minute Spoken Pitch Script
**The Great Indian Internship Challenge by Gnani.ai**  
*Memorize or reference this 2-minute pitch when judges arrive at your table.*

---

## 🎤 Spoken Pitch (Time: 120 Seconds)

### [00:00 - 00:20] The Hook & Gnani AI Voice Studio
> *"Good morning judges! Two years ago, turning napkin sketches and verbal whiteboard brainstorms into functional, interactive web applications took 3 to 5 days of manual frontend coding. Today, we built **WhiteboardOS: Gnani AI Voice Studio** — an instant multimodal compiler combining **Gnani AI's Indic Speech Engine (Prisma STT v3.0 & Timbre TTS v2.5)** with **Gemini Vision AI** to turn Indian-language voice dictation and physical sketches into production-ready web applications in under 10 seconds."*

---

### [00:20 - 01:20] Answering The 5 Mandatory Questions

#### 1. What problem, and who exactly has it?
> *"**Indian Founders, Students, and Product Builders**. They think and brainstorm in Hindi, Hinglish, Tamil, Telugu, and English. But existing AI coding tools are rigid, text-only, and English-centric. WhiteboardOS lets them speak naturally in their mother tongue or hold a paper sketch up to the camera and get a working web application immediately."*

#### 2. What is the non-obvious hard part?
> *"Seamlessly coordinating **real-time Indic audio streaming**, zero-shot vision coordinate extraction, and structured AST code synthesis with our signature Liquid Glass design tokens — while providing a dual-engine fallback (Gnani Cloud <-> Browser Web Speech) for 100% uptime resilience."*

#### 3. What did you build versus what did the API give you?
> *"Gnani provided the raw STT and TTS inference endpoints. We built everything else around it:
> 1. A **Server-Side Audio Ingestion Pipeline** handling real-time multipart audio streaming.
> 2. A **Dual-Engine Speech Redundancy System** guaranteeing zero-failover during live demos.
> 3. An **Automated Multi-Model Vision Cascade** rotating across models to defeat quota exhaustion.
> 4. **Four Indian Startup Presets**: UPI BharatPay, ApnaKirana, Royal Spice Bistro, and BharatCloud SaaS.
> 5. A **DOM Self-Healing Engine** ensuring sandboxed iframes render clean Tailwind styling with zero script injection vulnerabilities.
> 6. An **AI Evaluation Benchmark Suite (`/eval`)** with 13 golden test cases measuring recall, latency, and cost."*

#### 4. Why does this break if you remove the AI?
> *"Without Gnani's Indic acoustic models, speech-to-intent collapses in code-mixed Indian environments. Without Gemini Multimodal Vision, handwritten labels on paper wireframes cannot be interpreted. Without AI, the application completely non-functions."*

#### 5. What breaks at ten thousand users?
> *"API rate limits (RPM) and client-side storage quotas. We would scale to 10k users by implementing an asynchronous BullMQ queue with Redis for audio chunk processing, offloading assets to Cloudflare R2 object storage, and caching common UI templates in pgvector."*

---

### [01:20 - 02:00] Live Demonstration Flow
1. **Show the Voice Studio**: Click the microphone, select Hindi/Hinglish, or click the **"🇮🇳 UPI BharatPay Wallet"** golden preset.
2. **Show the Vision Analysis**: Point out the component tree with 96% confidence scores.
3. **Show the Real-Time Terminal**: Watch the code synthesize live in the streaming macOS terminal.
4. **Hear Spoken Feedback**: Listen to **Gnani Timbre TTS** audibly confirm prototype generation (show the speaker toggle in the navbar).
5. **Demonstrate Hinglish Voice Iteration**: Dictate *"Theme dark kardo aur 3-tier pricing section add karo"* and watch the prototype hot-reload.
6. **Open `/eval` Suite**: Show judges the live benchmark score (TC-01 through TC-13, 96.2% recall accuracy, $0.00018/run).
7. **Show Observability HUD**: Prove the platform operates for < $0.20/day with 100% server-side API key containment.
