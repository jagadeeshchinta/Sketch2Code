"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Sparkles, LayoutGrid, Layers, Compass, Zap, PenTool, Plus, Camera, Activity } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { themeColor, backgroundType } = useThemeColor()
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const pathname = usePathname()

  const navItems = [
    { name: "Home", icon: LayoutGrid, href: "/" },
    { name: "Create", icon: PenTool, href: "/create" },
    { name: "Live Studio", icon: Camera, href: "/create/live" },
    { name: "Gallery", icon: Layers, href: "/gallery" },
    { name: "Eval Suite", icon: Activity, href: "/eval" },
  ]

  const getActiveIndex = () => {
    const idx = navItems.findIndex((item) => item.href === pathname)
    return idx >= 0 ? idx : 0
  }

  const activeIndex = getActiveIndex()

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 inset-x-0 z-50 flex items-center justify-center px-4 pointer-events-none"
    >
      <nav
        className={cn(
          "pointer-events-auto relative flex items-center gap-1.5 p-1.5 rounded-full",
          "bg-white/80 dark:bg-black/60",
          "backdrop-blur-2xl border border-black/10 dark:border-white/15",
          "shadow-[0_15px_35px_rgba(0,0,0,0.25)] transition-all duration-300"
        )}
      >
        {/* Brand Badge */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
        >
          <div
            className="relative flex items-center justify-center w-6 h-6 rounded-lg overflow-hidden border border-black/10 dark:border-white/20 transition-transform group-hover:scale-110 shadow-sm"
            style={{ backgroundColor: `${themeColor}25` }}
          >
            <div
              className="w-2 h-2 rounded-full animate-ping absolute"
              style={{ backgroundColor: themeColor }}
            />
            <div className="w-2 h-2 rounded-full relative z-10" style={{ backgroundColor: themeColor }} />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white group-hover:opacity-90 transition-opacity">
            Whiteboard<span style={{ color: themeColor }}>OS</span>
          </span>
        </Link>

        <div className="hidden sm:block w-px h-5 bg-black/10 dark:bg-white/15 mx-1" />

        {/* Navigation Items with Sliding Indicator */}
        <div className="flex items-center gap-1">
          {navItems.map((item, index) => {
            const isActive = activeIndex === index
            const isHovered = hoveredIndex === index

            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 z-10",
                  isActive
                    ? "text-zinc-950 dark:text-white font-bold"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                )}
                style={{
                  color: (isHovered || isActive) ? themeColor : undefined,
                }}
              >
                {/* Active Pill Spring Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 rounded-full bg-black/5 dark:bg-white/15 border border-black/10 dark:border-white/20 shadow-sm"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
                  />
                )}

                <item.icon
                  className={cn(
                    "w-3.5 h-3.5 relative z-10 transition-transform duration-200",
                    isHovered && "scale-115"
                  )}
                  style={{
                    color: (isHovered || isActive) ? themeColor : undefined,
                  }}
                />

                <span className="relative z-10">{item.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="w-px h-5 bg-black/10 dark:bg-white/15 mx-1" />

        {/* Quick Create Button */}
        <Link
          href="/create"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all hover:scale-105"
          style={{
            backgroundColor: `${themeColor}15`,
            borderColor: `${themeColor}30`,
            color: themeColor,
          }}
        >
          <Plus className="w-3 h-3" />
          <span className="hidden md:inline font-sans">New</span>
        </Link>
      </nav>
    </motion.header>
  )
}
