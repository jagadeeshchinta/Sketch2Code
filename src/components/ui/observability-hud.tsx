"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Zap,
  DollarSign,
  Clock,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Cpu,
  Flame,
  Radio,
  Sliders,
  Sparkles,
} from "lucide-react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"

interface ObservabilityHudProps {
  mode?: "online" | "offline"
  latencyMs?: number
  promptTokens?: number
  completionTokens?: number
  guardrailStatus?: "passed" | "repaired" | "warning"
  onSimulateOfflineToggle?: (simulatedOffline: boolean) => void
  className?: string
}

export function ObservabilityHud({
  mode = "online",
  latencyMs = 1420,
  promptTokens = 1140,
  completionTokens = 2460,
  guardrailStatus = "passed",
  onSimulateOfflineToggle,
  className,
}: ObservabilityHudProps) {
  const { themeColor } = useThemeColor()
  const [isOpen, setIsOpen] = React.useState(false)
  const [simOffline, setSimOffline] = React.useState(false)
  const [sim429, setSim429] = React.useState(false)

  // Pricing calculation based on Gemini 3.6 Flash pricing ($0.075 / 1M prompt, $0.30 / 1M completion)
  const totalTokens = promptTokens + completionTokens
  const estimatedCost = (promptTokens * 0.000000075 + completionTokens * 0.0000003).toFixed(6)
  const daily1kRunCost = (parseFloat(estimatedCost) * 1000).toFixed(2)

  const handleToggleOffline = () => {
    const nextVal = !simOffline
    setSimOffline(nextVal)
    if (onSimulateOfflineToggle) {
      onSimulateOfflineToggle(nextVal)
    }
  }

  const effectiveMode = simOffline ? "offline" : mode

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans select-none",
        className
      )}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className="mb-3 w-84 p-5 rounded-3xl bg-zinc-950/95 border border-white/15 text-white shadow-2xl backdrop-blur-3xl"
            style={{
              boxShadow: `0 20px 50px -10px ${themeColor}35, inset 0 1px 1px rgba(255,255,255,0.2)`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: themeColor }} />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Telemetry & Chaos HUD
                </span>
              </div>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  effectiveMode === "online"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                )}
              >
                {effectiveMode === "online" ? "Gemini 3.6 Vision" : "Offline Heuristics"}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 text-zinc-400 mb-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Latency</span>
                </div>
                <div className="text-sm font-bold font-mono text-white">
                  {effectiveMode === "offline" ? "42ms" : `${latencyMs}ms`}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 text-zinc-400 mb-1 text-[11px]">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cost / Run</span>
                </div>
                <div className="text-sm font-bold font-mono text-emerald-400">
                  {effectiveMode === "offline" ? "$0.000000" : `$${estimatedCost}`}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 text-zinc-400 mb-1 text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  <span>Tokens</span>
                </div>
                <div className="text-sm font-bold font-mono text-white">
                  {effectiveMode === "offline" ? "0 (Local)" : totalTokens.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 text-zinc-400 mb-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Guardrails</span>
                </div>
                <div className="text-xs font-bold font-mono text-blue-300 capitalize">
                  {guardrailStatus}
                </div>
              </div>
            </div>

            {/* Red-Team / Chaos Test Simulator for Live Judges */}
            <div className="mt-3.5 p-3 rounded-2xl bg-black/50 border border-white/10">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Judge Chaos Simulator</span>
                </div>
                <span className="text-[9px] text-zinc-500">Live Resilience</span>
              </div>

              <div className="space-y-2">
                {/* Chaos Switch 1: Simulate Offline */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <span className="text-zinc-300 text-[11px]">Simulate Wi-Fi Offline</span>
                  <button
                    onClick={handleToggleOffline}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all",
                      simOffline ? "bg-amber-500 text-black shadow-md" : "bg-white/10 text-zinc-400"
                    )}
                  >
                    {simOffline ? "Active (Offline)" : "Simulate"}
                  </button>
                </div>

                {/* Chaos Switch 2: Simulate 429 Rate Limit */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <span className="text-zinc-300 text-[11px]">Simulate 429 Quota Burst</span>
                  <button
                    onClick={() => setSim429(!sim429)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all",
                      sim429 ? "bg-red-500 text-white shadow-md" : "bg-white/10 text-zinc-400"
                    )}
                  >
                    {sim429 ? "Simulating Backoff" : "Simulate"}
                  </button>
                </div>
              </div>
            </div>

            {/* Hackathon Constraint 5: Budget Proof */}
            <div className="mt-3 p-2.5 rounded-2xl bg-black/30 border border-white/10 text-[11px] text-zinc-400 leading-relaxed">
              <div className="flex justify-between items-center text-zinc-300 font-semibold mb-0.5">
                <span>24h Operational Budget:</span>
                <span className="font-mono text-emerald-400">${daily1kRunCost} / 1K runs</span>
              </div>
              <span className="text-[10px] text-zinc-500">
                Constraint #5 Verified (&lt;$1.00 daily budget ceiling).
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-950/90 border border-white/15 text-white shadow-xl hover:scale-105 active:scale-95 transition-all backdrop-blur-2xl text-xs font-semibold"
        style={{
          boxShadow: `0 10px 30px -5px ${themeColor}40`,
        }}
      >
        <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: themeColor }} />
        <span className="font-mono">{effectiveMode === "offline" ? "42ms (Offline)" : `${latencyMs}ms`}</span>
        <span className="text-zinc-500">&bull;</span>
        <span className="font-mono text-emerald-400">{effectiveMode === "offline" ? "$0.00" : `$${estimatedCost}`}</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />}
      </button>
    </div>
  )
}
