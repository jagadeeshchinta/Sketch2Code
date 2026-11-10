"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"
import { ConfidenceBadge } from "./confidence-badge"
import { COMPONENT_TYPE_META } from "@/lib/types"
import type { DetectedComponent } from "@/lib/types"

interface ComponentCardProps {
  component: DetectedComponent
  index: number
  onToggle: (id: string) => void
  className?: string
}

export function ComponentCard({ component, index, onToggle, className }: ComponentCardProps) {
  const { themeColor } = useThemeColor()
  const meta = COMPONENT_TYPE_META[component.type] || COMPONENT_TYPE_META.unknown

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group relative flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300",
        "bg-white/70 dark:bg-white/5 backdrop-blur-xl border",
        component.included
          ? "border-black/10 dark:border-white/15 hover:border-black/20 dark:hover:border-white/25"
          : "border-black/5 dark:border-white/5 opacity-50",
        className
      )}
      style={{
        borderColor: component.included && component.confidence >= 80 ? `${meta.color}30` : undefined,
      }}
    >
      {/* Type icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border border-black/10 dark:border-white/10"
        style={{ backgroundColor: `${meta.color}15` }}
      >
        {meta.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-900 dark:text-white font-sans truncate">
            {component.label}
          </span>
          <ConfidenceBadge confidence={component.confidence} size="sm" />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-[10px] font-bold uppercase tracking-wider font-sans"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
          {component.properties?.text && (
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-sans">
              &quot;{component.properties.text}&quot;
            </span>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle(component.id)
        }}
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all border",
          component.included
            ? "bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/15 text-zinc-600 dark:text-zinc-300"
            : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-400 dark:text-zinc-600"
        )}
        title={component.included ? "Click to exclude" : "Click to include"}
      >
        {component.included ? (
          <Eye className="w-3.5 h-3.5" />
        ) : (
          <EyeOff className="w-3.5 h-3.5" />
        )}
      </button>
    </motion.div>
  )
}
