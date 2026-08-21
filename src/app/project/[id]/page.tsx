"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlassCard } from "@/components/ui/glass-card"
import { CodeViewer } from "@/components/ui/code-viewer"
import { LivePreview } from "@/components/ui/live-preview"
import { IterationBar } from "@/components/ui/iteration-bar"
import { VersionTimeline } from "@/components/ui/version-timeline"
import { ConfidenceBadge } from "@/components/ui/confidence-badge"
import { ComponentCard } from "@/components/ui/component-card"
import { StreamingTerminal } from "@/components/ui/streaming-terminal"
import { generateOfflineCode } from "@/lib/offline-heuristic"
import { parseCodeOutput } from "@/lib/gemini"
import Silk from "@/components/react-bits/Silk"
import MoltenMetal from "@/components/react-bits/MoltenMetal"
import { useThemeColor } from "@/context/theme-context"
import { motion, AnimatePresence } from "framer-motion"
import { getProject, saveProject } from "@/lib/storage"
import type { Project, GeneratedCode, Version, DetectedComponent } from "@/lib/types"
import Link from "next/link"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import {
  ArrowLeft,
  Download,
  Layers,
  Sparkles,
  Loader2,
  Clock,
  FolderOpen,
  Eye,
  Code2,
  Image as ImageIcon,
  Wand2,
  Cpu,
  CheckCircle2,
  Zap,
} from "lucide-react"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params?.id as string

  const {
    themeColor,
    backgroundType,
    silkConfig,
    moltenMetalConfig,
  } = useThemeColor()

  const [project, setProject] = React.useState<Project | null>(null)
  const [components, setComponents] = React.useState<DetectedComponent[]>([])
  const [currentCode, setCurrentCode] = React.useState<GeneratedCode | null>(null)
  const [currentVersionIdx, setCurrentVersionIdx] = React.useState(-1)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [streamBuffer, setStreamBuffer] = React.useState("")
  const [isIterating, setIsIterating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<"preview" | "sketch" | "components">("preview")

  const quickSuggestions = [
    "Make buttons neon purple",
    "Add sticky navigation header",
    "Add pricing plans section",
    "Switch to dark obsidian theme",
  ]

  React.useEffect(() => {
    if (projectId) {
      const proj = getProject(projectId)
      if (proj) {
        setProject(proj)
        setComponents(proj.analysis?.components || [])
        if (proj.versions.length > 0) {
          const idx =
            proj.currentVersionIndex >= 0
              ? proj.currentVersionIndex
              : proj.versions.length - 1
          setCurrentVersionIdx(idx)
          setCurrentCode(proj.versions[idx].code)
        }
      }
    }
  }, [projectId])

  const handleToggleComponent = (id: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, included: !c.included } : c))
    )
  }

  const handleGenerate = async () => {
    if (!project || !project.analysis) return
    setIsGenerating(true)
    setError(null)
    setStreamBuffer("")

    try {
      const includedComponents = components.filter((c) => c.included)
      const response = await fetch("/api/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          components: includedComponents,
          layout: project.analysis.layout,
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
      setCurrentCode(code)

      const version: Version = {
        id: crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}`,
        timestamp: Date.now(),
        code,
      }

      const newVersions = [...project.versions, version]
      const updatedProject = {
        ...project,
        versions: newVersions,
        currentVersionIndex: newVersions.length - 1,
      }

      setProject(updatedProject)
      setCurrentVersionIdx(newVersions.length - 1)
      saveProject(updatedProject)
      setViewMode("preview")
    } catch (err: unknown) {
      console.warn("Cloud streaming encountered an issue, compiling via in-browser Liquid Engine...", err)
      try {
        const offlineCode = generateOfflineCode(components.filter((c) => c.included), project.analysis.layout)
        setCurrentCode(offlineCode)
        const version: Version = {
          id: crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}`,
          timestamp: Date.now(),
          code: offlineCode,
        }
        const newVersions = [...project.versions, version]
        const updatedProject = {
          ...project,
          versions: newVersions,
          currentVersionIndex: newVersions.length - 1,
        }
        setProject(updatedProject)
        setCurrentVersionIdx(newVersions.length - 1)
        saveProject(updatedProject)
        setViewMode("preview")
      } catch (fallbackErr) {
        const message = err instanceof Error ? err.message : "Generation failed"
        setError(message)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleVersionSelect = (index: number) => {
    if (!project) return
    setCurrentVersionIdx(index)
    setCurrentCode(project.versions[index].code)
  }

  const handleIterate = async (command: string) => {
    if (!project || !currentCode) return
    setIsIterating(true)
    setError(null)

    try {
      const response = await fetch("/api/iterate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCode: currentCode.html,
          command,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || err.details || "Iteration failed")
      }

      const result = await response.json()
      const newCode: GeneratedCode = {
        html: result.html,
        css: result.css || currentCode.css,
        react: result.react || currentCode.react,
      }

      const version: Version = {
        id: crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}`,
        timestamp: Date.now(),
        code: newCode,
        command,
        changesSummary: result.changesSummary,
      }

      const updatedProject = {
        ...project,
        versions: [...project.versions, version],
        currentVersionIndex: project.versions.length,
      }

      setProject(updatedProject)
      setCurrentCode(newCode)
      setCurrentVersionIdx(updatedProject.versions.length - 1)
      saveProject(updatedProject)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Iteration failed")
    } finally {
      setIsIterating(false)
    }
  }

  const handleDownloadZip = async () => {
    if (!currentCode) return
    const zip = new JSZip()
    zip.file("index.html", currentCode.html)
    zip.file("styles.css", currentCode.css)
    zip.file("Component.jsx", currentCode.react)
    zip.file(
      "README.md",
      `# WhiteboardOS Living Prototype\n\nProject: ${project?.name || "Untitled"}\nGenerated with Liquid Glass Architecture.\n`
    )
    const blob = await zip.generateAsync({ type: "blob" })
    saveAs(
      blob,
      `whiteboardos-${project?.name?.replace(/\s+/g, "-") || "export"}-${Date.now()}.zip`
    )
  }

  if (!project) {
    return (
      <main className="min-h-screen relative overflow-hidden bg-background flex flex-col items-center justify-center font-serif">
        <div className="fixed inset-0 z-0 h-full w-full pointer-events-none">
          {backgroundType === "silk" ? (
            <div className="absolute inset-0 opacity-90">
              <Silk
                color={themeColor}
                speed={silkConfig.speed}
                scale={silkConfig.scale}
                noiseIntensity={silkConfig.noiseIntensity}
                rotation={silkConfig.rotation}
              />
            </div>
          ) : (
            <div className="absolute inset-0">
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
          <div className="absolute inset-0 bg-white/35 dark:bg-black/25 pointer-events-none" />
        </div>
        <Navbar />
        <ThemeToggle />
        <GlassCard className="relative z-10 p-12 flex flex-col items-center justify-center text-center max-w-md shadow-2xl" interactive={false}>
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-black/10 dark:border-white/15"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <FolderOpen className="w-8 h-8" style={{ color: themeColor }} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">Project Not Found</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans mb-8">
            This project may have been deleted or the link is invalid.
          </p>
          <Link
            href="/gallery"
            className="px-8 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-sans"
            style={{
              backgroundColor: themeColor,
              color: themeColor.toLowerCase() === "#ffffff" ? "#000" : "#fff",
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Gallery
          </Link>
        </GlassCard>
      </main>
    )
  }

  const hasCode = !!currentCode

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
        <div className="absolute inset-0 bg-white/35 dark:bg-black/25 pointer-events-none" />
      </div>

      <Navbar />
      <ThemeToggle />

      {/* ── Center Aligned Content ── */}
      <section className="relative z-10 pt-32 pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Header with Clean Symmetrical Layout */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-8 p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-2xl flex flex-col items-center text-center"
        >
          <div className="w-full flex items-center justify-between gap-4 mb-4">
            <Link
              href="/gallery"
              className="px-3.5 py-2 rounded-xl bg-white/90 dark:bg-white/10 border border-black/10 dark:border-white/15 flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-sm font-sans"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Gallery</span>
            </Link>

            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase font-sans border shadow-sm"
                style={{
                  backgroundColor: `${themeColor}15`,
                  borderColor: `${themeColor}40`,
                  color: themeColor,
                }}
              >
                {hasCode ? "Active Prototype" : "Analysis Ready"}
              </span>
            </div>

            {hasCode ? (
              <button
                onClick={handleDownloadZip}
                className="px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 font-sans"
                style={{
                  backgroundColor: themeColor,
                  color: themeColor.toLowerCase() === "#ffffff" ? "#000" : "#fff",
                }}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span> ZIP
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white font-serif max-w-3xl leading-snug mb-2">
            {project.name.length > 50 ? `${project.name.substring(0, 50)}...` : project.name}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans max-w-2xl leading-relaxed mb-4">
            {project.analysis?.description || "Structured wireframe prototype with Liquid Glass architecture."}
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-sans text-zinc-500 dark:text-zinc-400 border-t border-black/10 dark:border-white/10 pt-3 w-full max-w-md">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(project.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>&bull;</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {components.length} Elements
            </span>
            <span>&bull;</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {project.versions.length} Versions
            </span>
            {project.analysis && (
              <>
                <span>&bull;</span>
                <ConfidenceBadge confidence={project.analysis.overallConfidence} size="sm" />
              </>
            )}
          </div>
        </motion.div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full max-w-2xl mb-8 flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-300 font-sans">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs font-bold text-red-500 font-sans"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CASE 1: Live Code Streaming Terminal during Synthesis ── */}
        {isGenerating && (
          <div className="w-full max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-black/50 border border-black/10 dark:border-white/15 text-xs font-bold font-sans shadow-md">
                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: themeColor }} />
                <span>Live Code Synthesizer Active</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white font-serif">
                Synthesizing Living Prototype
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans">
                Writing index.html, styles.css, and Component.jsx with Liquid Glass tokens
              </p>
            </div>

            <StreamingTerminal
              isRealGenerating={isGenerating}
              liveStreamText={streamBuffer}
              realCode={currentCode}
            />
          </div>
        )}

        {/* ── CASE 2: No Code Generated Yet (Show Elements & Generate Button) ── */}
        {!hasCode && !isGenerating && (
          <div className="w-full space-y-8">
            {/* Generate Code Callout Card */}
            <GlassCard className="p-8 sm:p-10 text-center flex flex-col items-center shadow-2xl" interactive={false}>
              <div
                className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-5 border border-black/10 dark:border-white/15 shadow-md"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Zap className="w-8 h-8" style={{ color: themeColor }} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white font-serif mb-2">
                Ready to Generate Living Code?
              </h2>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans max-w-lg mb-8 leading-relaxed">
                Your wireframe has been analyzed with {components.length} detected elements. Click below to synthesize the complete, interactive website prototype.
              </p>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || components.filter((c) => c.included).length === 0}
                className="group relative px-10 py-4 rounded-full font-bold text-sm shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden disabled:opacity-50 font-sans"
                style={{
                  backgroundColor: themeColor,
                  color: themeColor.toLowerCase() === "#ffffff" ? "#000" : "#fff",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Generate Living Code Now
                </span>
              </button>
            </GlassCard>

            {/* Symmetrical Dual Panel: Sketch & Components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Original Sketch */}
              <GlassCard className="p-6 flex flex-col justify-between shadow-xl" interactive={false}>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-black/10 dark:border-white/10 text-center">
                    <ImageIcon className="w-4 h-4" style={{ color: themeColor }} />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-sans">
                      Wireframe Sketch
                    </span>
                  </div>
                  {project.sketchDataUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-center p-3">
                      <img
                        src={project.sketchDataUrl}
                        alt={project.name}
                        className="w-full object-contain max-h-[380px] rounded-xl shadow-md"
                      />
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Detected Components Tree */}
              <GlassCard className="p-6 flex flex-col justify-between shadow-xl" interactive={false}>
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" style={{ color: themeColor }} />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-sans">
                        Component Tree
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
          </div>
        )}

        {/* ── CASE 2: Code Generated (Show Prototype, Code Viewer & Iteration Bar) ── */}
        {hasCode && (
          <div className="w-full space-y-6">
            {/* Version Timeline */}
            {project.versions.length > 0 && (
              <div className="w-full p-4 rounded-2xl bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-md">
                <VersionTimeline
                  versions={project.versions}
                  currentIndex={currentVersionIdx}
                  onSelect={handleVersionSelect}
                />
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="w-full flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-black/10 dark:border-white/15 max-w-md mx-auto shadow-md">
              {[
                { key: "preview" as const, label: "Living Prototype", icon: Eye },
                { key: "sketch" as const, label: "Original Sketch", icon: ImageIcon },
                { key: "components" as const, label: "Component Tree", icon: Layers },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setViewMode(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
                    viewMode === tab.key
                      ? "bg-white dark:bg-white/20 text-zinc-950 dark:text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                  style={{ color: viewMode === tab.key ? themeColor : undefined }}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Prototype + Code */}
            {viewMode === "preview" && (
              <div className="w-full space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  <LivePreview htmlCode={currentCode.html} className="h-full min-h-[480px] shadow-2xl" />
                  <CodeViewer
                    html={currentCode.html}
                    css={currentCode.css}
                    react={currentCode.react}
                    className="h-full min-h-[480px] shadow-2xl"
                  />
                </div>

                {/* Iteration Bar & Prompts */}
                <div className="space-y-3">
                  <IterationBar onSubmit={handleIterate} isLoading={isIterating} />

                  <div className="flex flex-wrap items-center justify-center gap-2 font-sans">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mr-1">
                      Quick Edits:
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
              </div>
            )}

            {/* Tab 2: Original Sketch */}
            {viewMode === "sketch" && (
              <GlassCard className="w-full max-w-2xl mx-auto p-8 shadow-2xl flex flex-col items-center" interactive={false}>
                <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" style={{ color: themeColor }} />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-sans">
                      Uploaded Sketch Reference
                    </span>
                  </div>
                  {project.analysis && (
                    <ConfidenceBadge confidence={project.analysis.overallConfidence} size="md" />
                  )}
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3 w-full flex items-center justify-center">
                  <img
                    src={project.sketchDataUrl}
                    alt={project.name}
                    className="w-full object-contain max-h-[460px] rounded-xl shadow-lg"
                  />
                </div>
              </GlassCard>
            )}

            {/* Tab 3: Component Tree */}
            {viewMode === "components" && (
              <div className="w-full max-w-2xl mx-auto space-y-3">
                <GlassCard className="p-5 flex items-center justify-between mb-4" interactive={false}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-sans">
                      Detected Architectural Components
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300 font-sans">
                    {components.length} Elements
                  </span>
                </GlassCard>

                {components.map((comp, idx) => (
                  <ComponentCard
                    key={comp.id}
                    component={comp}
                    index={idx}
                    onToggle={handleToggleComponent}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
