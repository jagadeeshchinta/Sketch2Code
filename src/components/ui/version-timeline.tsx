"use client"

import * as React from "react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"
import { Clock, MessageSquare } from "lucide-react"
import type { Version } from "@/lib/types"

interface VersionTimelineProps {
  versions: Version[]
  currentIndex: number
  onSelect: (index: number) => void
  className?: string
}

export function VersionTimeline({ versions, currentIndex, onSelect, className }: VersionTimelineProps) {
  const { themeColor } = useThemeColor()

  if (versions.length === 0) return null

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5" style={{ color: themeColor }} />
        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-sans">
          Version History
        </span>
        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          ({versions.length})
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {versions.map((version, index) => {
          const isActive = index === currentIndex
          const date = new Date(version.timestamp)
          const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

          return (
            <button
              key={version.id}
              onClick={() => onSelect(index)}
              className={cn(
                "shrink-0 px-3.5 py-2 rounded-xl border transition-all text-left font-sans",
                isActive
                  ? "bg-white dark:bg-white/15 border-black/15 dark:border-white/25 shadow-sm"
                  : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/15"
              )}
              style={{
                borderColor: isActive ? `${themeColor}40` : undefined,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    isActive ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400"
                  )}
                  style={{ color: isActive ? themeColor : undefined }}
                >
                  v{index + 1}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                  {timeStr}
                </span>
              </div>
              {version.command && (
                <div className="flex items-center gap-1 mt-1">
                  <MessageSquare className="w-2.5 h-2.5 text-zinc-400" />
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate max-w-[100px]">
                    {version.command}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
