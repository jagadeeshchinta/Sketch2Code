"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlassCard } from "@/components/ui/glass-card"
import Silk from "@/components/react-bits/Silk"
import MoltenMetal from "@/components/react-bits/MoltenMetal"
import { useThemeColor } from "@/context/theme-context"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowUpRight,
  Sliders,
  Sparkles,
  Eye,
  Cpu,
  Download,
  MessageSquare,
  Clock,
  Shield,
  Upload,
  Zap,
  Code2,
  Mic,
  LayoutDashboard,
} from "lucide-react"

export default function Home() {
  const {
    themeColor,
    backgroundType,
    silkConfig,
    moltenMetalConfig,
  } = useThemeColor()

  const features = [
    {
      icon: Mic,
      title: "Voice-to-UI Engine",
      description: "Speak naturally: 'I need a dashboard with a navbar and 4 cards' and get living code generated in seconds",
      metric: "Voice",
      metricLabel: "Synthesis",
    },
    {
      icon: Eye,
      title: "AI Vision Detection",
      description: "Gemini identifies buttons, inputs, cards, lists and 30+ component types from any sketch",
      metric: "30+",
      metricLabel: "Components",
    },
    {
      icon: Sparkles,
      title: "Instant Prototypes",
      description: "Generated code uses the Liquid Glass design system — beautiful output guaranteed",
      metric: "< 10s",
      metricLabel: "Generation",
    },
    {
      icon: MessageSquare,
      title: "Iterate with Voice or Text",
      description: "Speak or type 'make buttons glowing purple' and watch changes apply instantly",
      metric: "∞",
      metricLabel: "Iterations",
    },
    {
      icon: Clock,
      title: "Version Timeline",
      description: "Every iteration saved automatically. Compare side-by-side, rollback anytime",
      metric: "Auto",
      metricLabel: "Saved",
    },
    {
      icon: Download,
      title: "Export Anywhere",
      description: "Download as HTML, CSS, React component, or complete ZIP — ready to run",
      metric: "3",
      metricLabel: "Formats",
    },
  ]

  const steps = [
    {
      step: "01",
      icon: Upload,
      title: "Upload Sketch",
      description: "Drag & drop your wireframe, whiteboard photo, or hand-drawn sketch",
    },
    {
      step: "02",
      icon: Cpu,
      title: "AI Analyzes",
      description: "Gemini Vision detects every component, layout structure, and text content",
    },
    {
      step: "03",
      icon: Code2,
      title: "Get Living Code",
      description: "Receive a beautiful, interactive prototype — then iterate with natural language",
    },
  ]

  return (
    <main className="min-h-screen relative overflow-hidden bg-background selection:bg-primary/30 flex flex-col transition-colors duration-500 font-serif">
      {/* Background System */}
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
              ? "absolute inset-0 bg-white/25 dark:bg-black/20 pointer-events-none transition-colors duration-500"
              : "absolute inset-0 bg-white/35 dark:bg-black/25 pointer-events-none transition-colors duration-500"
          }
        />
      </div>

      <Navbar />
      <ThemeToggle />

      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-36 pb-20 px-6 max-w-6xl mx-auto w-full flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-xl mb-8"
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
          <span className="text-xs font-semibold tracking-widest uppercase text-zinc-800 dark:text-zinc-200 font-sans">
            AI-Powered Sketch Intelligence
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal font-serif tracking-tight text-zinc-950 dark:text-white max-w-5xl leading-[1.2] sm:leading-[1.24] mb-6 drop-shadow-sm dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
        >
          <span className="block pb-2">WhiteboardOS</span>
          <span
            className="block font-bold text-transparent bg-clip-text drop-shadow-md py-1"
            style={{
              backgroundImage: `linear-gradient(135deg, var(--hero-title-from, #ffffff) 30%, ${themeColor === "#ffffff" ? "#aaaaaa" : themeColor} 100%)`,
            }}
          >
            Sketch to Code
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-lg sm:text-xl md:text-2xl text-zinc-700 dark:text-zinc-200 max-w-2xl font-light mb-10 leading-relaxed text-center font-sans drop-shadow-sm"
        >
          Upload wireframes, whiteboard photos, or hand-drawn sketches.
          Get live, interactive prototypes powered by AI Vision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4 font-sans"
        >
          <Link
            href="/create"
            className="group relative px-9 py-4 rounded-full font-bold text-sm shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
            style={{
              backgroundColor: themeColor,
              color: themeColor.toLowerCase() === "#ffffff" ? "#000000" : "#ffffff",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center gap-2">
              Start Creating <ArrowUpRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            href="/gallery"
            className="px-9 py-4 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 font-bold text-sm text-zinc-900 dark:text-white hover:bg-white/95 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" style={{ color: themeColor }} />
            View Gallery
          </Link>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400 font-sans">
            Three Simple Steps
          </span>
          <h2 className="text-3xl sm:text-5xl font-normal text-zinc-950 dark:text-white mt-2 mb-3">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans">
            From sketch to living code in seconds — no design tools required
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <GlassCard key={index} className="p-8 flex flex-col items-center text-center min-h-[260px]" interactive={true}>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border border-black/10 dark:border-white/15"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                <step.icon className="w-6 h-6" style={{ color: themeColor }} />
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest mb-2 font-sans"
                style={{ color: themeColor }}
              >
                Step {step.step}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 font-serif">
                {step.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                {step.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400 font-sans">
            Powerful Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-normal text-zinc-950 dark:text-white mt-2 mb-3">
            Why WhiteboardOS
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans">
            Not just another sketch tool — intelligent, honest, and beautiful
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <GlassCard key={index} className="p-7 flex flex-col justify-between min-h-[240px]" interactive={true}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-black/10 dark:border-white/15"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: themeColor }} />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-zinc-900 dark:text-white font-sans">
                      {feature.metric}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans uppercase tracking-wider">
                      {feature.metricLabel}
                    </div>
                  </div>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2 font-serif">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                  {feature.description}
                </p>
              </div>
              {/* Bottom accent line */}
              <div className="mt-5 w-full bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${60 + index * 8}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: themeColor }}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6 max-w-4xl mx-auto w-full text-center">
        <GlassCard className="p-12 flex flex-col items-center" interactive={false}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-black/10 dark:border-white/15"
            style={{ backgroundColor: `${themeColor}15` }}
          >
            <Zap className="w-7 h-7" style={{ color: themeColor }} />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Ready to Transform Your Sketches?
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans mb-8 max-w-lg">
            Upload your first wireframe and watch AI bring it to life in seconds.
            No design tools. No coding required.
          </p>
          <Link
            href="/create"
            className="group relative px-10 py-4 rounded-full font-bold text-sm shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden font-sans"
            style={{
              backgroundColor: themeColor,
              color: themeColor.toLowerCase() === "#ffffff" ? "#000000" : "#ffffff",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center gap-2">
              Start Creating Now <ArrowUpRight className="w-4 h-4" />
            </span>
          </Link>
        </GlassCard>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 mt-auto py-10 px-6 border-t border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400 font-sans text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
            <span>
              Powered by <strong className="text-zinc-900 dark:text-white">Gemini 2.0 Flash Vision</strong> &bull; Engine: <strong className="capitalize text-zinc-900 dark:text-white font-serif">{backgroundType}</strong>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span>WhiteboardOS</span>
            <span>&bull;</span>
            <span>AI Hackathon 2026</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
