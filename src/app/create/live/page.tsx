"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlassCard } from "@/components/ui/glass-card"
import Silk from "@/components/react-bits/Silk"
import MoltenMetal from "@/components/react-bits/MoltenMetal"
import { useThemeColor } from "@/context/theme-context"
import { motion, AnimatePresence } from "framer-motion"
import { createProject, saveProject } from "@/lib/storage"
import { processAndEnhanceImage } from "@/lib/image-processor"
import { analyzeOfflineHeuristics } from "@/lib/offline-heuristic"
import { useRouter } from "next/navigation"
import {
  Camera,
  Paintbrush,
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  Zap,
  Undo,
  Square,
  Circle,
  Eraser,
  Eye,
  ArrowRight,
  AlertCircle,
  Video,
  Loader2,
} from "lucide-react"

export default function LiveStudioPage() {
  const router = useRouter()
  const {
    themeColor,
    backgroundType,
    silkConfig,
    moltenMetalConfig,
  } = useThemeColor()

  // Tab State: "camera" | "canvas"
  const [activeTab, setActiveTab] = React.useState<"camera" | "canvas">("camera")

  // ── Webcam States ──────────────────────────────────────────────────────────
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null)
  const [cameraError, setCameraError] = React.useState<string | null>(null)
  const [isCameraLoading, setIsCameraLoading] = React.useState(false)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  // ── Canvas States ──────────────────────────────────────────────────────────
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [brushColor, setBrushColor] = React.useState("#ffffff")
  const [brushSize, setBrushSize] = React.useState(4)
  const [tool, setTool] = React.useState<"pen" | "eraser" | "rect" | "circle">("pen")
  const [canvasHistory, setCanvasHistory] = React.useState<string[]>([])
  const [startX, setStartX] = React.useState(0)
  const [startY, setStartY] = React.useState(0)
  const [snapshot, setSnapshot] = React.useState<ImageData | null>(null)

  // ── Voice States ───────────────────────────────────────────────────────────
  const [isListening, setIsListening] = React.useState(false)
  const [voiceText, setVoiceText] = React.useState("")
  const [speechSupported, setSpeechSupported] = React.useState(false)
  const recognitionRef = React.useRef<any>(null)

  // ── Initialize Speech Recognition ─────────────────────────────────────────
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setSpeechSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onresult = (event: any) => {
          let transcript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          setVoiceText(transcript)
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const toggleVoiceRecording = () => {
    if (!speechSupported || !recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setVoiceText("")
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  // ── Webcam Controls ───────────────────────────────────────────────────────
  const streamRef = React.useRef<MediaStream | null>(null)

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
          track.enabled = false
        } catch (e) {
          // ignore
        }
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStream(null)
  }, [])

  const startCamera = async () => {
    setCameraError(null)
    setIsCameraLoading(true)
    try {
      stopCamera()
      
      let mediaStream: MediaStream
      try {
        // Try rear camera first (critical for mobile scanning whiteboard)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        })
      } catch (err) {
        // Fallback to any default camera (webcam on desktop)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        })
      }

      streamRef.current = mediaStream
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setCameraError("Could not access camera. Please check permissions.")
    } finally {
      setIsCameraLoading(false)
    }
  }

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch((e) => console.warn("Video play error:", e))
    }
  }, [stream])

  React.useEffect(() => {
    if (activeTab === "camera") {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [activeTab, stopCamera])

  // Global unmount cleanup: ensures hardware webcam light turns off when navigating to any other route
  React.useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Draw the current video frame onto the temporary canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL("image/png")
        setCapturedImage(dataUrl)
        stopCamera()
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  // ── Canvas Board Actions ─────────────────────────────────────────────────
  React.useEffect(() => {
    if (activeTab === "canvas") {
      initCanvas()
    }
  }, [activeTab])

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions relative to dynamic container scale
    canvas.width = canvas.parentElement?.clientWidth || 700
    canvas.height = 450

    // Whiteboard styling default background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveCanvasState()
  }

  const saveCanvasState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setCanvasHistory((prev) => [...prev, canvas.toDataURL()])
  }

  const handleUndo = () => {
    const canvas = canvasRef.current
    if (!canvas || canvasHistory.length <= 1) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const newHistory = [...canvasHistory]
    newHistory.pop() // remove current state
    const prevState = newHistory[newHistory.length - 1]

    const img = new Image()
    img.src = prevState
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      setCanvasHistory(newHistory)
    }
  }

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setStartX(x)
    setStartY(y)
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height))

    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "pen") {
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === "eraser") {
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = brushSize * 4
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === "rect") {
      if (snapshot) ctx.putImageData(snapshot, 0, 0)
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushSize
      ctx.strokeRect(startX, startY, x - startX, y - startY)
    } else if (tool === "circle") {
      if (snapshot) ctx.putImageData(snapshot, 0, 0)
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushSize
      ctx.beginPath()
      const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveCanvasState()
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setCanvasHistory([])
    saveCanvasState()
  }

  // ── Project Creation & Real Analysis Trigger ─────────────────────────────
  const handleProceedToAnalysis = async (imageDataUrl: string) => {
    setIsAnalyzing(true)
    try {
      // 1. Client-Side Image Pre-Processing & Auto-Contrast Boost
      const { enhancedDataUrl } = await processAndEnhanceImage(imageDataUrl, {
        maxDimension: 1024,
        boostContrast: true,
        quality: 0.85,
      })

      let finalAnalysis: any

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: enhancedDataUrl }),
        })
        if (!response.ok) throw new Error("API analysis unavailable")
        finalAnalysis = await response.json()
      } catch (apiErr) {
        console.warn("Cloud API fallback triggered in Live Studio, running in-browser heuristic...", apiErr)
        finalAnalysis = await analyzeOfflineHeuristics(enhancedDataUrl)
      }

      // Save as local storage project
      const proj = createProject(
        finalAnalysis.description || `Paper Wireframe ${new Date().toLocaleDateString()}`,
        enhancedDataUrl
      )
      proj.analysis = finalAnalysis
      saveProject(proj)

      if (voiceText) {
        sessionStorage.setItem("live_voice_instruction", voiceText)
      }

      router.push(`/project/${proj.id}`)
    } catch (err) {
      console.error("Live analysis failed:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCanvasAnalyze = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL("image/png")
    handleProceedToAnalysis(dataUrl)
  }

  const handleCameraAnalyze = () => {
    if (capturedImage) {
      handleProceedToAnalysis(capturedImage)
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-background selection:bg-primary/30 flex flex-col transition-colors duration-500 font-serif">
      {/* Dynamic Background system */}
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
        <div className="absolute inset-0 bg-white/20 dark:bg-black/25 pointer-events-none transition-colors duration-500" />
      </div>

      <Navbar />
      <ThemeToggle />

      <section className="relative z-10 pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Header with Title & Beta Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 flex flex-col items-center"
        >
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-white">
              Live Sketch <span style={{ color: themeColor }}>Studio</span>
            </h1>
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border text-white backdrop-blur-md"
              style={{ backgroundColor: themeColor, borderColor: `${themeColor}60` }}
            >
              Beta
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans max-w-md">
            Capture a live whiteboard wireframe with your camera or draw directly using our canvas.
          </p>
        </motion.div>

        {/* Tab switcher: Camera vs Canvas */}
        <div className="flex items-center p-1 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 mb-8 w-full max-w-xs justify-between">
          <button
            onClick={() => setActiveTab("camera")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
              activeTab === "camera"
                ? "bg-white dark:bg-white/20 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900"
            }`}
            style={{ color: activeTab === "camera" ? themeColor : undefined }}
          >
            <Camera className="w-4 h-4" />
            Live Camera
          </button>
          <button
            onClick={() => setActiveTab("canvas")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
              activeTab === "canvas"
                ? "bg-white dark:bg-white/20 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900"
            }`}
            style={{ color: activeTab === "canvas" ? themeColor : undefined }}
          >
            <Paintbrush className="w-4 h-4" />
            Draw Canvas
          </button>
        </div>

        {/* ── TAB 1: Camera ────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "camera" && (
            <motion.div
              key="camera-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-6 relative overflow-hidden" interactive={false}>
                {cameraError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4 animate-bounce" />
                    <p className="text-sm font-bold text-zinc-900 dark:text-white mb-2 font-sans">
                      Camera Connection Failed
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans max-w-xs mb-6">
                      {cameraError}
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-2.5 rounded-full text-xs font-bold text-white flex items-center gap-2 transition-all font-sans"
                      style={{ backgroundColor: themeColor }}
                    >
                      <RefreshCw className="w-4 h-4" /> Retry Connection
                    </button>
                  </div>
                ) : capturedImage ? (
                  <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5">
                      <img src={capturedImage} alt="Captured" className="w-full object-contain max-h-[400px]" />
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={retakePhoto}
                        className="px-6 py-2.5 rounded-full text-xs font-bold border border-black/15 dark:border-white/15 text-zinc-700 dark:text-zinc-300 hover:scale-105 transition-all font-sans"
                      >
                        Retake Photo
                      </button>
                      <button
                        onClick={handleCameraAnalyze}
                        disabled={isAnalyzing}
                        className="px-6 py-2.5 rounded-full text-xs font-bold text-white flex items-center gap-2 transition-all font-sans hover:scale-105 disabled:opacity-60 shadow-lg"
                        style={{ backgroundColor: themeColor }}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing Wireframe...
                          </>
                        ) : (
                          <>
                            Analyze Sketch <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-black/15 dark:border-white/20 bg-zinc-900 flex items-center justify-center shadow-2xl">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />

                      {isCameraLoading && (
                        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-zinc-400 z-20">
                          <Loader2 className="w-8 h-8 animate-spin" style={{ color: themeColor }} />
                          <span className="text-xs font-sans">Connecting camera stream...</span>
                        </div>
                      )}

                      {/* Optical Viewfinder HUD Alignment Guide */}
                      <div className="absolute inset-4 pointer-events-none flex flex-col justify-between z-10">
                        {/* Top row corner brackets */}
                        <div className="flex justify-between items-start">
                          <div className="w-6 h-6 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: themeColor }} />
                          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider font-sans shadow-md">
                            📄 Hold Paper Wireframe Inside Frame
                          </div>
                          <div className="w-6 h-6 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: themeColor }} />
                        </div>

                        {/* Center subtle crosshair */}
                        <div className="self-center w-12 h-12 border border-dashed border-white/30 rounded-2xl flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                        </div>

                        {/* Bottom row corner brackets */}
                        <div className="flex justify-between items-end">
                          <div className="w-6 h-6 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: themeColor }} />
                          <div className="text-[10px] text-zinc-300 bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-md font-sans">
                            💡 Good lighting = 98% accuracy
                          </div>
                          <div className="w-6 h-6 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: themeColor }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={capturePhoto}
                        disabled={!stream}
                        className="w-16 h-16 rounded-full flex items-center justify-center border border-white/35 transition-transform hover:scale-110 active:scale-95 disabled:opacity-40"
                        style={{
                          backgroundColor: `${themeColor}20`,
                          boxShadow: `0 0 25px ${themeColor}40`,
                        }}
                      >
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full border-2 border-zinc-200" style={{ backgroundColor: themeColor }} />
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* ── TAB 2: Drawing Canvas ────────────────────────────────────────── */}
          {activeTab === "canvas" && (
            <motion.div
              key="canvas-tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="w-full max-w-3xl"
            >
              <GlassCard className="p-5" interactive={false}>
                {/* Canvas Drawing Tools header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-black/10 dark:border-white/10 font-sans">
                  {/* Tools */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                    {[
                      { key: "pen" as const, label: "Pen", icon: Paintbrush },
                      { key: "eraser" as const, label: "Eraser", icon: Eraser },
                      { key: "rect" as const, label: "Rectangle", icon: Square },
                      { key: "circle" as const, label: "Circle", icon: Circle },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTool(t.key)}
                        className={`p-2 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors ${
                          tool === t.key ? "bg-white dark:bg-white/20 shadow-sm" : ""
                        }`}
                        style={{ color: tool === t.key ? themeColor : undefined }}
                        title={t.label}
                      >
                        <t.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>

                  {/* Settings */}
                  <div className="flex items-center gap-4">
                    {/* Brush Size */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Size</span>
                      <input
                        type="range"
                        min="2"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-20 accent-primary"
                      />
                    </div>
                    {/* Color Swatch Picker */}
                    <div className="flex items-center gap-1.5">
                      {["#000000", "#3b82f6", "#ef4444", "#10b981", "#8b5cf6"].map((color) => (
                        <button
                          key={color}
                          onClick={() => setBrushColor(color)}
                          className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${
                            brushColor === color ? "scale-110 ring-2 ring-offset-2 ring-primary" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={canvasHistory.length <= 1}
                      className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-500 hover:text-zinc-900 disabled:opacity-40"
                      title="Undo"
                    >
                      <Undo className="w-4 h-4" />
                    </button>
                    <button
                      onClick={clearCanvas}
                      className="px-3.5 py-1.5 rounded-lg border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-black/10"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Main drawing board viewport */}
                <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="block cursor-crosshair"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleCanvasAnalyze}
                    disabled={isAnalyzing}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-white flex items-center gap-2 transition-all font-sans hover:scale-105 disabled:opacity-60 shadow-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Canvas...
                      </>
                    ) : (
                      <>
                        Analyze Sketch Canvas <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Speech Recognition voice settings panel ────────────────────── */}
        {speechSupported && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mt-8"
          >
            <GlassCard className="p-5 flex flex-col md:flex-row items-center gap-4" interactive={false}>
              <button
                onClick={toggleVoiceRecording}
                className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${
                  isListening
                    ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse"
                    : "bg-white/80 dark:bg-black/50 border-black/15 dark:border-white/15 text-zinc-600 dark:text-zinc-300"
                }`}
              >
                {isListening ? <Mic className="w-6 h-6 animate-bounce" /> : <MicOff className="w-6 h-6" />}
              </button>

              <div className="flex-1 text-center md:text-left font-sans">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider mb-1 block"
                  style={{ color: themeColor }}
                >
                  Optional Voice Instruction
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {isListening
                    ? "Listening... Speak your structural layout details..."
                    : voiceText
                    ? `Voice input captured: "${voiceText}"`
                    : "Click to dictate design cues (e.g. 'Generate with dark sidebar')"
                  }
                </p>
              </div>

              {voiceText && (
                <button
                  onClick={() => setVoiceText("")}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-600"
                >
                  Clear
                </button>
              )}
            </GlassCard>
          </motion.div>
        )}
      </section>
    </main>
  )
}
