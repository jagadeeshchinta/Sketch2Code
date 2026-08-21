"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlassCard } from "@/components/ui/glass-card"
import { UploadZone } from "@/components/ui/upload-zone"
import { CodeViewer } from "@/components/ui/code-viewer"
import { LivePreview } from "@/components/ui/live-preview"
import { ComponentCard } from "@/components/ui/component-card"
import { IterationBar } from "@/components/ui/iteration-bar"
import { VersionTimeline } from "@/components/ui/version-timeline"
import { StepIndicator } from "@/components/ui/step-indicator"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { StreamingTerminal } from "@/components/ui/streaming-terminal"
import { ObservabilityHud } from "@/components/ui/observability-hud"
import { VoicePromptHud } from "@/components/ui/voice-prompt-hud"
import { generateWireframeFromVoicePrompt } from "@/lib/voice-wireframe-generator"
import { analyzeOfflineHeuristics, generateOfflineCode } from "@/lib/offline-heuristic"
import { processAndEnhanceImage } from "@/lib/image-processor"
import { parseCodeOutput } from "@/lib/gemini"
import Silk from "@/components/react-bits/Silk"
import MoltenMetal from "@/components/react-bits/MoltenMetal"
import { useThemeColor } from "@/context/theme-context"
import { motion, AnimatePresence } from "framer-motion"
import { saveProject, createProject } from "@/lib/storage"
import { cn } from "@/lib/utils"
import type { AnalysisResult, GeneratedCode, Version, Project, DetectedComponent } from "@/lib/types"
import {
  Upload,
  Cpu,
  Code2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Layers,
  Save,
  Wand2,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  Mic,
  LayoutDashboard,
} from "lucide-react"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import Link from "next/link"

type Step = 0 | 1 | 2

export default function CreatePage() {
  const {
    themeColor,
    backgroundType,
    silkConfig,
    moltenMetalConfig,
  } = useThemeColor()

  // ── State ─────────────────────────────────────────────────────
  const [step, setStep] = React.useState<Step>(0)
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [analysis, setAnalysis] = React.useState<AnalysisResult | null>(null)
  const [components, setComponents] = React.useState<DetectedComponent[]>([])
  const [generatedCode, setGeneratedCode] = React.useState<GeneratedCode | null>(null)
  const [versions, setVersions] = React.useState<Version[]>([])
  const [currentVersionIdx, setCurrentVersionIdx] = React.useState(-1)
  const [project, setProject] = React.useState<Project | null>(null)

  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [streamBuffer, setStreamBuffer] = React.useState("")
  const [isIterating, setIsIterating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [statusText, setStatusText] = React.useState("")
  const [pipelineMode, setPipelineMode] = React.useState<"online" | "offline">("online")
  const [latencyMs, setLatencyMs] = React.useState(1240)

  const [isVoiceModalOpen, setIsVoiceModalOpen] = React.useState(false)
  const [spokenPrompt, setSpokenPrompt] = React.useState<string | null>(null)

  // 1-Click Golden Sample Wireframes for instant judging demonstration
  const SAMPLE_WIREFRAMES = [
    {
      name: "🎙️ Voice: 4-Card Dashboard",
      category: "Navbar + 4 KPIs",
      prompt: "I need a dashboard with a navbar and 4 cards",
      isVoice: true,
      svg: generateWireframeFromVoicePrompt("I need a dashboard with a navbar and 4 cards").svgDataUrl,
    },
    {
      name: "SaaS Landing Page",
      category: "Hero + Pricing",
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="%23ffffff"><rect width="800" height="600" fill="%23ffffff"/><rect x="40" y="30" width="720" height="50" rx="25" fill="none" stroke="%23333333" stroke-width="3"/><line x1="80" y1="55" x2="160" y2="55" stroke="%23333333" stroke-width="8" stroke-linecap="round"/><circle cx="680" cy="55" r="14" fill="%23333333"/><rect x="150" y="130" width="500" height="40" rx="10" fill="none" stroke="%23333333" stroke-width="4"/><line x1="200" y1="190" x2="600" y2="190" stroke="%23666666" stroke-width="4"/><rect x="320" y="230" width="160" height="45" rx="22" fill="%23333333"/><rect x="40" y="320" width="220" height="230" rx="18" fill="none" stroke="%23333333" stroke-width="3"/><line x1="70" y1="360" x2="160" y2="360" stroke="%23333333" stroke-width="6"/><rect x="290" y="320" width="220" height="230" rx="18" fill="none" stroke="%23333333" stroke-width="3"/><line x1="320" y1="360" x2="410" y2="360" stroke="%23333333" stroke-width="6"/><rect x="540" y="320" width="220" height="230" rx="18" fill="none" stroke="%23333333" stroke-width="3"/><line x1="570" y1="360" x2="660" y2="360" stroke="%23333333" stroke-width="6"/></svg>`,
    },
    {
      name: "E-Commerce Showcase",
      category: "Product & Cart",
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="%23ffffff"><rect width="800" height="600" fill="%23ffffff"/><rect x="40" y="30" width="720" height="50" rx="15" fill="none" stroke="%23333333" stroke-width="3"/><rect x="40" y="110" width="340" height="440" rx="20" fill="none" stroke="%23333333" stroke-width="3"/><line x1="40" y1="110" x2="380" y2="550" stroke="%23999999" stroke-width="2"/><line x1="380" y1="110" x2="40" y2="550" stroke="%23999999" stroke-width="2"/><line x1="420" y1="150" x2="720" y2="150" stroke="%23333333" stroke-width="8" stroke-linecap="round"/><line x1="420" y1="200" x2="600" y2="200" stroke="%23666666" stroke-width="5"/><rect x="420" y="260" width="140" height="40" rx="8" fill="none" stroke="%23333333" stroke-width="3"/><rect x="420" y="340" width="320" height="55" rx="28" fill="%23333333"/><rect x="420" y="420" width="320" height="130" rx="15" fill="none" stroke="%23cccccc" stroke-width="2"/></svg>`,
    },
    {
      name: "Mobile App Dashboard",
      category: "Cards & Metrics",
      svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="450" height="700" viewBox="0 0 450 700" fill="%23ffffff"><rect width="450" height="700" fill="%23ffffff"/><rect x="25" y="25" width="400" height="650" rx="35" fill="none" stroke="%23333333" stroke-width="4"/><circle cx="60" cy="70" r="18" fill="%23333333"/><line x1="100" y1="70" x2="220" y2="70" stroke="%23333333" stroke-width="6"/><rect x="45" y="120" width="165" height="100" rx="15" fill="none" stroke="%23333333" stroke-width="3"/><rect x="240" y="120" width="165" height="100" rx="15" fill="none" stroke="%23333333" stroke-width="3"/><rect x="45" y="245" width="360" height="180" rx="18" fill="none" stroke="%23333333" stroke-width="3"/><rect x="45" y="450" width="360" height="150" rx="18" fill="none" stroke="%23333333" stroke-width="3"/><rect x="45" y="620" width="360" height="40" rx="20" fill="%23f0f0f0" stroke="%23333333" stroke-width="2"/></svg>`,
    },
  ]

  // Quick suggestion chips for iteration
  const quickSuggestions = [
    "Make buttons neon purple",
    "Add sticky navigation header",
    "Add pricing plans section",
    "Switch to dark obsidian theme",
    "Add testimonial card slider",
  ]

  // ── Handlers ──────────────────────────────────────────────────
  const handleFileAccepted = async (file: File, dataUrl: string) => {
    try {
      const { enhancedDataUrl } = await processAndEnhanceImage(dataUrl, {
        maxDimension: 1024,
        boostContrast: true,
        quality: 0.85,
      })
      setUploadedFile(file)
      setPreviewUrl(enhancedDataUrl)
    } catch {
      setUploadedFile(file)
      setPreviewUrl(dataUrl)
    }
    setSpokenPrompt(null)
    setError(null)
  }

  const handleSelectSample = (sample: (typeof SAMPLE_WIREFRAMES)[0]) => {
    setUploadedFile(null)
    setPreviewUrl(sample.svg)
    if (sample.isVoice && sample.prompt) {
      handleVoicePromptSynthesize(sample.prompt)
    } else {
      setSpokenPrompt(null)
      setError(null)
    }
  }

  const handleVoicePromptSynthesize = async (promptText: string) => {
    setIsAnalyzing(true)
    setError(null)
    setSpokenPrompt(promptText)
    setStep(1)
    setStatusText(`Synthesizing UI with Gemini AI for: "${promptText}"...`)
    const startTime = Date.now()

    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      })

      if (!response.ok) {
        throw new Error("Voice synthesis request failed")
      }

      const data = await response.json()
      setUploadedFile(null)
      setPreviewUrl(data.svgDataUrl)
      setAnalysis(data.analysis)
      setComponents(data.analysis.components || [])
      if (data.code) {
        setGeneratedCode(data.code)
      }
      setPipelineMode(data.source === "gemini-ai" ? "online" : "offline")
      setLatencyMs(Date.now() - startTime)

      const proj = createProject(
        `🎙️ Voice: ${data.title || promptText.slice(0, 35)}`,
        data.svgDataUrl
      )
      proj.analysis = data.analysis
      saveProject(proj)
      setProject(proj)
    } catch (err: unknown) {
      console.warn("Backend voice synthesis fetch failed, running local engine:", err)
      const localResult = generateWireframeFromVoicePrompt(promptText)
      setUploadedFile(null)
      setPreviewUrl(localResult.svgDataUrl)
      setAnalysis(localResult.analysis)
      setComponents(localResult.analysis.components)
      setGeneratedCode(localResult.offlineCode)
      setPipelineMode("offline")
      setLatencyMs(Date.now() - startTime)

      const proj = createProject(
        `🎙️ Voice: ${localResult.title || promptText.slice(0, 35)}`,
        localResult.svgDataUrl
      )
      proj.analysis = localResult.analysis
      saveProject(proj)
      setProject(proj)
    } finally {
      setIsAnalyzing(false)
      setStatusText("")
    }
  }

  const handleClearUpload = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setAnalysis(null)
    setComponents([])
    setGeneratedCode(null)
    setVersions([])
    setCurrentVersionIdx(-1)
    setProject(null)
    setSpokenPrompt(null)
    setError(null)
    setStep(0)
  }

  const handleAnalyze = async () => {
    if (!previewUrl) return
    setIsAnalyzing(true)
    setError(null)
    setStep(1)
    const startTime = Date.now()

    const stages = [
      "Scanning visual geometry and aspect ratios...",
      "Identifying navigation, buttons and cards...",
      "Extracting spatial hierarchy...",
      "Synthesizing Liquid Glass design tokens...",
    ]

    let stageIdx = 0
    setStatusText(stages[0])
    const statusInterval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length
      setStatusText(stages[stageIdx])
    }, 1800)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: previewUrl }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || err.details || "Analysis failed")
      }

      const result: AnalysisResult = await response.json()
      setAnalysis(result)
      setComponents(result.components || [])
      setPipelineMode("online")
      setLatencyMs(Date.now() - startTime)

      // Create project in storage
      const proj = createProject(
        result.description || `Wireframe ${new Date().toLocaleDateString()}`,
        previewUrl
      )
      proj.analysis = result
      saveProject(proj)
      setProject(proj)
    } catch (err: unknown) {
      console.warn("Cloud AI analysis offline, activating in-browser heuristic engine...", err)
      if (previewUrl) {
        const offlineResult = await analyzeOfflineHeuristics(previewUrl)
        setAnalysis(offlineResult)
        setComponents(offlineResult.components || [])
        setPipelineMode("offline")
        setLatencyMs(Date.now() - startTime)

        const proj = createProject(
          offlineResult.description || `Offline Wireframe ${new Date().toLocaleDateString()}`,
          previewUrl
        )
        proj.analysis = offlineResult
        saveProject(proj)
        setProject(proj)
      } else {
        const message = err instanceof Error ? err.message : "Analysis failed"
        setError(message)
        setStep(0)
      }
    } finally {
      clearInterval(statusInterval)
      setIsAnalyzing(false)
      setStatusText("")
    }
  }

  const handleGenerate = async () => {
    if (!analysis) return
    setIsGenerating(true)
    setError(null)
    setStreamBuffer("")
    setStatusText("Synthesizing living prototype with Liquid Glass tokens...")
    const startTime = Date.now()

    try {
      const includedComponents = components.filter((c) => c.included)
      const response = await fetch("/api/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          components: includedComponents,
          layout: analysis.layout,
        }),
      })

      if (!response.ok) {
        throw new Error(`Generation stream failed (${response.status})`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value, { stream: true })
          const lines = text.split("\n\n")
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.chunk) {
                  accumulated += data.chunk
                  setStreamBuffer(accumulated)
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }
      }

      const code: GeneratedCode = parseCodeOutput(accumulated)
      setGeneratedCode(code)
      setPipelineMode("online")
      setLatencyMs(Date.now() - startTime)

      // Save as version
      const version: Version = {
        id: crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}`,
        timestamp: Date.now(),
        code,
      }
      const newVersions = [...versions, version]
      setVersions(newVersions)
      setCurrentVersionIdx(newVersions.length - 1)
      setStep(2)

      // Save to project
      if (project) {
        project.versions = newVersions
        project.currentVersionIndex = newVersions.length - 1
        saveProject(project)
      }
    } catch (err: unknown) {
      console.warn("Cloud AI generation unavailable, falling back to offline compiler...", err)
      const includedComponents = components.filter((c) => c.included)
      const offlineCode = generateOfflineCode(includedComponents, analysis?.layout)
      setGeneratedCode(offlineCode)
      setPipelineMode("offline")
      setLatencyMs(Date.now() - startTime)

      const version: Version = {
        id: crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}`,
        timestamp: Date.now(),
        code: offlineCode,
      }
      const newVersions = [...versions, version]
      setVersions(newVersions)
      setCurrentVersionIdx(newVersions.length - 1)
      setStep(2)

      if (project) {
        project.versions = newVersions
        project.currentVersionIndex = newVersions.length - 1
        saveProject(project)
      }
    } finally {
      setIsGenerating(false)
      setStatusText("")
    }
  }

  const handleIterate = async (command: string) => {
    if (!generatedCode) return
    setIsIterating(true)
    setError(null)

    try {
      const response = await fetch("/api/iterate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCode: generatedCode.html,
          command,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || err.details || `Iteration failed (${response.status})`)
      }

      const result = await response.json()
      const newCode: GeneratedCode = {
        html: result.html,
        css: result.css || generatedCode.css,
        react: result.react || generatedCode.react,
      }
      setGeneratedCode(newCode)

      // Save as new version
      const version: Version = {
        id: crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}`,
        timestamp: Date.now(),
        code: newCode,
        command,
        changesSummary: result.changesSummary,
      }
      const newVersions = [...versions, version]
      setVersions(newVersions)
      setCurrentVersionIdx(newVersions.length - 1)

      if (project) {
        project.versions = newVersions
        project.currentVersionIndex = newVersions.length - 1
        saveProject(project)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Iteration failed"
      setError(message)
    } finally {
      setIsIterating(false)
    }
  }

  const handleVersionSelect = (index: number) => {
    setCurrentVersionIdx(index)
    setGeneratedCode(versions[index].code)
  }

  const handleToggleComponent = (id: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, included: !c.included } : c))
    )
  }

  const handleDownloadZip = async () => {
    if (!generatedCode) return
    const zip = new JSZip()
    zip.file("index.html", generatedCode.html)
    zip.file("styles.css", generatedCode.css)
    zip.file("Component.jsx", generatedCode.react)
    zip.file(
      "README.md",
      `# WhiteboardOS Living Prototype\n\nGenerated by WhiteboardOS with Liquid Glass Architecture.\n\n## Quick Start\nOpen \`index.html\` directly in any browser.\n`
    )
    const blob = await zip.generateAsync({ type: "blob" })
    saveAs(blob, `whiteboardos-prototype-${Date.now()}.zip`)
  }

  const handleStartOver = () => {
    setStep(0)
    setUploadedFile(null)
    setPreviewUrl(null)
    setAnalysis(null)
    setComponents([])
    setGeneratedCode(null)
    setVersions([])
    setCurrentVersionIdx(-1)
    setProject(null)
    setError(null)
  }

  const stepItems = [
    { label: "Upload Wireframe", icon: <Upload className="w-3.5 h-3.5" /> },
    { label: "AI Analysis", icon: <Cpu className="w-3.5 h-3.5" /> },
    { label: "Living Prototype", icon: <Code2 className="w-3.5 h-3.5" /> },
  ]

  return (
    <main className="min-h-screen relative overflow-hidden bg-background selection:bg-primary/30 flex flex-col transition-colors duration-500 font-serif">
      {/* ── WebGL Shader Backdrop ── */}
      <div className="fixed inset-0 z-0 h-full w-full pointer-events-none transition-opacity duration-700">
        {backgroundType === "silk" ? (
          <div className="absolute inset-0 h-full w-full opacity-90">
            <Silk
              color={themeColor}
              speed={silkConfig.speed}
              scale={silkConfig.scale}
              noiseIntensity={silkConfig.noiseIntensity}
              rotation={silkConfig.rotation}
            />
          </div>
        ) : (
          <div className="absolute inset-0 h-full w-full">
            <MoltenMetal
              color1={moltenMetalConfig.color1}
              color2={moltenMetalConfig.color2}
              color3={moltenMetalConfig.color3}
              speed={moltenMetalConfig.speed}
              scale={moltenMetalConfig.scale}
              detail={moltenMetalConfig.detail}
              glow={moltenMetalConfig.glow}
              coreSize={moltenMetalConfig.coreSize}
              swirl={moltenMetalConfig.swirl}
              fold={moltenMetalConfig.fold}
              blackPoint={moltenMetalConfig.blackPoint}
              brightness={moltenMetalConfig.brightness}
              colorMode={moltenMetalConfig.colorMode}
              grain={moltenMetalConfig.grain}
              grainIntensity={moltenMetalConfig.grainIntensity}
              mouseInteraction={moltenMetalConfig.mouseInteraction}
              mouseStrength={moltenMetalConfig.mouseStrength}
              opacity={moltenMetalConfig.opacity}
            />
          </div>
        )}
        <div
          className={
            backgroundType === "metal"
              ? "absolute inset-0 bg-white/30 dark:bg-black/25 pointer-events-none transition-colors duration-500"
              : "absolute inset-0 bg-white/40 dark:bg-black/30 pointer-events-none transition-colors duration-500"
          }
        />
      </div>

      <Navbar />
      <ThemeToggle />

      {/* ── Main Center Aligned Container ── */}
      <section className="relative z-10 pt-32 pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Header with Title & Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-md mb-4">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
            <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-800 dark:text-zinc-200 font-sans">
              AI Vision Model Engine
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-zinc-950 dark:text-white mb-3">
            Create{" "}
            <span
              className="font-bold text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, var(--hero-title-from, #ffffff) 30%, ${themeColor} 100%)`,
              }}
            >
              Studio
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-sans max-w-lg leading-relaxed">
            Upload any sketch, wireframe, or whiteboard photo to generate living, interactive code.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator steps={stepItems} currentStep={step} className="mb-10" />

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              className="w-full max-w-2xl mb-8 flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-2xl shadow-xl"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-300 font-sans font-medium">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-300 font-sans px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STEP 0: Upload Zone ────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-upload"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-3xl flex flex-col items-center"
            >
              {/* Voice-to-UI Spotlight Bar */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-indigo-500/10 border border-indigo-500/40 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="relative flex items-center justify-center shrink-0">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg shadow-indigo-500/25"
                      style={{ backgroundColor: `${themeColor}25` }}
                    >
                      <Mic className="w-6 h-6 animate-pulse" style={{ color: themeColor }} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                        Voice-to-UI Engine
                      </h3>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                        style={{
                          backgroundColor: `${themeColor}20`,
                          borderColor: `${themeColor}40`,
                          color: themeColor,
                        }}
                      >
                        VocalLabs
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans mt-0.5">
                      Speak: <span className="font-semibold text-indigo-500 dark:text-indigo-300">&quot;I need a dashboard with a navbar and 4 cards&quot;</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-xs shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0 group"
                  style={{
                    backgroundColor: themeColor,
                    color: themeColor.toLowerCase() === "#ffffff" ? "#000" : "#fff",
                  }}
                >
                  <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Speak UI Vision</span>
                </button>
              </motion.div>

              <GlassCard className="p-8 sm:p-10 w-full shadow-2xl" interactive={false}>
                <UploadZone
                  onFileAccepted={handleFileAccepted}
                  currentPreview={previewUrl}
                  onClear={handleClearUpload}
                />

                {!previewUrl && (
                  <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 font-sans">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: themeColor }} />
                      <span>Or Try 1-Click Golden Sample Wireframes:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                      {SAMPLE_WIREFRAMES.map((sample, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSample(sample)}
                          className={cn(
                            "flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all hover:scale-105 active:scale-95 group font-sans shadow-sm",
                            sample.isVoice
                              ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-indigo-500/40"
                              : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-black/10 dark:border-white/15"
                          )}
                        >
                          <span className="text-xs font-bold text-zinc-950 dark:text-white group-hover:opacity-80 transition-opacity">
                            {sample.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium mt-0.5" style={{ color: themeColor }}>
                            {sample.category} &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {previewUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex items-center justify-center gap-4"
                  >
                    <button
                      onClick={handleClearUpload}
                      className="px-6 py-3.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 font-bold text-xs text-zinc-700 dark:text-zinc-300 font-sans transition-all hover:scale-105 active:scale-95"
                    >
                      Clear Image
                    </button>

                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="group relative px-8 py-3.5 rounded-full font-bold text-sm shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden disabled:opacity-50 font-sans"
                      style={{
                        backgroundColor: themeColor,
                        color: themeColor.toLowerCase() === "#ffffff" ? "#000" : "#fff",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center gap-2">
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing Wireframe...
                          </>
                        ) : (
                          <>
                            <Cpu className="w-4 h-4" />
                            Analyze Sketch
                          </>
                        )}
                      </span>
                    </button>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* ── STEP 1: Analysis Results ───────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step-analysis"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-5xl"
            >
              {isAnalyzing ? (
                <div className="w-full max-w-2xl mx-auto">
                  <GlassCard className="p-12 flex flex-col items-center justify-center text-center shadow-2xl" interactive={false}>
                    {/* Glowing radar pulse ring — Center Aligned */}
                    <div className="relative w-20 h-20 mb-6 mx-auto flex items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-3xl animate-ping opacity-25"
                        style={{ backgroundColor: themeColor }}
                      />
                      <div
                        className="relative w-20 h-20 rounded-3xl flex items-center justify-center border border-black/10 dark:border-white/20 shadow-xl backdrop-blur-2xl"
                        style={{ backgroundColor: `${themeColor}20` }}
                      >
                        <Cpu className="w-9 h-9 animate-pulse" style={{ color: themeColor }} />
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white mb-2">
                      AI is Analyzing Your Wireframe
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 font-sans tracking-wide">
                      {statusText || "Processing visual architecture..."}
                    </p>

                    {/* Themed Shimmering Skeleton Bars */}
                    <div className="w-full max-w-md mt-10 space-y-4">
                      {[85, 60, 95, 70].map((width, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md"
                        >
                          <div
                            className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-[10px] font-bold"
                            style={{
                              backgroundColor: `${themeColor}25`,
                              color: themeColor,
                            }}
                          >
                            0{idx + 1}
                          </div>
                          <div className="flex-1 bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                            <motion.div
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: idx * 0.2 }}
                              className="h-full rounded-full"
                              style={{ width: `${width}%`, backgroundColor: themeColor }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              ) : isGenerating ? (
                <div className="w-full max-w-3xl mx-auto space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-black/50 border border-black/10 dark:border-white/15 text-xs font-bold font-sans shadow-md">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: themeColor }} />
                      <span>Live Code Synthesizer Active</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white font-serif">
                      Writing Production Code
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans">
                      Generating index.html, styles.css, and Component.jsx with Liquid Glass tokens
                    </p>
                  </div>

                  <StreamingTerminal
                    isRealGenerating={isGenerating}
                    liveStreamText={streamBuffer}
                    realCode={generatedCode}
                  />
                </div>
              ) : analysis ? (
                <div className="space-y-8">
                  {/* Analysis Summary Top Banner — Perfectly Centered */}
                  <GlassCard className="p-8 text-center flex flex-col items-center justify-center shadow-2xl" interactive={false}>
                    <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: themeColor }} />
                        Wireframe Mapped Successfully
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white font-serif">
                        Architecture & Component Breakdown
                      </h2>

                      {spokenPrompt && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold font-sans mt-1">
                          <Mic className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                          <span>Voice Blueprint Intent: <strong>&quot;{spokenPrompt}&quot;</strong></span>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
                        {analysis.description || "Components successfully identified from visual sketch"}
                      </p>

                      {/* Centered Key Metrics */}
                      <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-black/10 dark:border-white/10 w-full max-w-md">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-zinc-950 dark:text-white font-sans">
                            {components.length}
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans uppercase font-bold tracking-wider mt-0.5">
                            Total Elements
                          </div>
                        </div>

                        <div className="w-px h-10 bg-black/10 dark:bg-white/10" />

                        <div className="text-center flex flex-col items-center">
                          <ConfidenceBadge confidence={analysis.overallConfidence} size="md" />
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans uppercase font-bold tracking-wider mt-1">
                            Detection Accuracy
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Symmetrical Dual Panel: Original Sketch & Detected Components */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* Left: Original Sketch with Glass Frame */}
                    <GlassCard className="p-6 flex flex-col justify-between" interactive={false}>
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-black/10 dark:border-white/10 text-center">
                          <Layers className="w-4 h-4" style={{ color: themeColor }} />
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-sans">
                            Original Input Sketch
                          </span>
                        </div>
                        {previewUrl && (
                          <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-center p-3">
                            <img
                              src={previewUrl}
                              alt="Uploaded wireframe"
                              className="w-full object-contain max-h-[380px] rounded-xl shadow-md"
                            />
                          </div>
                        )}
                      </div>
                    </GlassCard>

                    {/* Right: Detected Components Toggle List */}
                    <GlassCard className="p-6 flex flex-col justify-between" interactive={false}>
                      <div>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10 dark:border-white/10">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-sans">
                              Detected Elements Tree
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 font-sans">
                            {components.filter((c) => c.included).length}/{components.length} Included
                          </span>
                        </div>

                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                          {components.map((comp, idx) => (
                            <ComponentCard
                              key={comp.id}
                              component={comp}
                              index={idx}
                              onToggle={handleToggleComponent}
                            />
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  {/* AI Design Suggestions — Centered Heading */}
                  {analysis.suggestions && analysis.suggestions.length > 0 && (
                    <GlassCard className="p-6 sm:p-8 text-center" interactive={false}>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Wand2 className="w-4 h-4" style={{ color: themeColor }} />
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-sans">
                          AI Architectural Suggestions
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto text-left">
                        {analysis.suggestions.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 font-sans"
                          >
                            <span className="font-bold text-sm" style={{ color: themeColor }}>
                              &bull;
                            </span>
                            <span className="leading-relaxed">{s}</span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Centered Navigation Buttons */}
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        setStep(0)
                        setAnalysis(null)
                        setComponents([])
                      }}
                      className="px-7 py-3.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 font-bold text-xs sm:text-sm text-zinc-900 dark:text-white hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 font-sans"
                    >
                      <ArrowLeft className="w-4 h-4" /> Re-upload Sketch
                    </button>

                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || components.filter((c) => c.included).length === 0}
                      className="group relative px-9 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden disabled:opacity-50 font-sans"
                      style={{
                        backgroundColor: themeColor,
                        color: themeColor.toLowerCase() === "#ffffff" ? "#000" : "#fff",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center gap-2">
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Synthesizing Prototype...
                          </>
                        ) : (
                          <>
                            <Code2 className="w-4 h-4" />
                            Generate Living Code
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* ── STEP 2: Living Prototype & Code Studio ────────────────────────── */}
          {step === 2 && generatedCode && (
            <motion.div
              key="step-preview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-6xl space-y-6"
            >
              {/* Version History Horizontal Pills */}
              {versions.length > 0 && (
                <div className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-lg">
                  <VersionTimeline
                    versions={versions}
                    currentIndex={currentVersionIdx}
                    onSelect={handleVersionSelect}
                  />
                </div>
              )}

              {/* Changes Summary Banner if applied */}
              {currentVersionIdx >= 0 && versions[currentVersionIdx]?.changesSummary && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/15 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 shrink-0" style={{ color: themeColor }} />
                  <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-sans font-medium">
                    Iteration Note: {versions[currentVersionIdx].changesSummary}
                  </span>
                </motion.div>
              )}

              {/* Symmetrical Split View: Live Preview + Code Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <LivePreview htmlCode={generatedCode.html} className="h-full min-h-[480px] shadow-2xl" />
                <CodeViewer
                  html={generatedCode.html}
                  css={generatedCode.css}
                  react={generatedCode.react}
                  className="h-full min-h-[480px] shadow-2xl"
                />
              </div>

              {/* Natural Language Iteration Bar */}
              <div className="space-y-3">
                <IterationBar onSubmit={handleIterate} isLoading={isIterating} />

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 font-sans">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mr-1">
                    Quick Prompts:
                  </span>
                  {quickSuggestions.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleIterate(chip)}
                      disabled={isIterating}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-black/10 dark:border-white/15 text-zinc-700 dark:text-zinc-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                    >
                      &quot;{chip}&quot;
                    </button>
                  ))}
                </div>
              </div>

              {/* Centered Export & Navigation Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 font-sans">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 font-bold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit Elements
                </button>

                <button
                  onClick={handleDownloadZip}
                  className="px-7 py-3 rounded-full font-bold text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  style={{
                    backgroundColor: themeColor,
                    color: themeColor.toLowerCase() === "#ffffff" ? "#000" : "#fff",
                  }}
                >
                  <Download className="w-4 h-4" /> Download Complete ZIP
                </button>

                <Link
                  href="/gallery"
                  className="px-6 py-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 font-bold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Open in Gallery
                </Link>

                <button
                  onClick={handleStartOver}
                  className="px-6 py-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 font-bold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> New Sketch
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Observability & Cost Telemetry HUD */}
      <ObservabilityHud mode={pipelineMode} latencyMs={latencyMs} />

      {/* Voice-to-UI Speech Recognition & Synthesis Modal */}
      <VoicePromptHud
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSynthesizeVoicePrompt={handleVoicePromptSynthesize}
      />
    </main>
  )
}
