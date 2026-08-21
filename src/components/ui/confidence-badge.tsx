"use client"

import { cn } from "@/lib/utils"
import { useThemeColor } from "@/context/theme-context"
import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react"

interface ConfidenceBadgeProps {
  confidence: number
  size?: "sm" | "md"
  showLabel?: boolean
  className?: string
}

export function ConfidenceBadge({ confidence, size = "sm", showLabel = true, className }: ConfidenceBadgeProps) {
  const { themeColor } = useThemeColor()

  const getLevel = () => {
    if (confidence >= 80) return { color: "#10b981", label: "High", icon: CheckCircle2 }
    if (confidence >= 50) return { color: "#f59e0b", label: "Medium", icon: AlertTriangle }
    return { color: "#f43f5e", label: "Low", icon: HelpCircle }
  }

  const level = getLevel()
  const Icon = level.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-sans",
        size === "sm" ? "text-[10px]" : "text-xs",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Pulsing halo for high confidence */}
        {confidence >= 80 && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: level.color }}
          />
        )}
        <Icon
          className={cn("relative", size === "sm" ? "w-3 h-3" : "w-4 h-4")}
          style={{ color: level.color }}
        />
      </div>
      {showLabel && (
        <span
          className="font-bold tracking-wide"
          style={{ color: level.color }}
        >
          {confidence}%
        </span>
      )}
    </div>
  )
}
