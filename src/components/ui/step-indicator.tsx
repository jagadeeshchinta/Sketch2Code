"use client"

import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  label: string
  icon: React.ReactNode
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  const { themeColor } = useThemeColor()

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep
        const isFuture = index > currentStep

        return (
          <div key={index} className="flex items-center gap-2">
            {/* Step circle */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all border font-sans",
                  isCompleted && "text-white",
                  isActive && "text-white shadow-lg",
                  isFuture && "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-zinc-400 dark:text-zinc-500"
                )}
                style={{
                  backgroundColor: isCompleted || isActive ? themeColor : undefined,
                  borderColor: isCompleted || isActive ? themeColor : undefined,
                  boxShadow: isActive ? `0 0 20px ${themeColor}40` : undefined,
                }}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.icon}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold font-sans hidden sm:inline transition-colors",
                  isCompleted && "text-zinc-700 dark:text-zinc-300",
                  isActive && "text-zinc-900 dark:text-white",
                  isFuture && "text-zinc-400 dark:text-zinc-500"
                )}
                style={{ color: isActive ? themeColor : undefined }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-12 h-px transition-colors",
                  index < currentStep
                    ? "bg-current"
                    : "bg-black/10 dark:bg-white/10"
                )}
                style={{ backgroundColor: index < currentStep ? themeColor : undefined }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
