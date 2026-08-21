"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlassCard } from "@/components/ui/glass-card"
import Silk from "@/components/react-bits/Silk"
import MoltenMetal from "@/components/react-bits/MoltenMetal"
import { useThemeColor } from "@/context/theme-context"
import { motion, AnimatePresence } from "framer-motion"
import { getAllProjects, deleteProject, clearAllProjects } from "@/lib/storage"
import type { Project } from "@/lib/types"
import Link from "next/link"
import {
  Layers,
  ArrowUpRight,
  Trash2,
  Clock,
  Code2,
  Search,
  FolderOpen,
  Plus,
  Image as ImageIcon,
  Eye,
  Sparkles,
} from "lucide-react"

export default function GalleryPage() {
  const {
    themeColor,
    backgroundType,
    silkConfig,
    moltenMetalConfig,
  } = useThemeColor()

  const [projects, setProjects] = React.useState<Project[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null)
  const [clearConfirm, setClearConfirm] = React.useState(false)

  React.useEffect(() => {
    setProjects(getAllProjects())
  }, [])

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    deleteProject(id)
    setProjects(getAllProjects())
    setDeleteConfirm(null)
  }

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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
        <div className="absolute inset-0 bg-white/35 dark:bg-black/25 pointer-events-none transition-colors duration-500" />
      </div>

      <Navbar />
      <ThemeToggle />

      <section className="relative z-10 pt-32 pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-md mb-4">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
            <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-800 dark:text-zinc-200 font-sans">
              Local Storage Project Database
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-zinc-950 dark:text-white mb-3">
            Project{" "}
            <span
              className="font-bold text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, var(--hero-title-from, #ffffff) 30%, ${themeColor} 100%)`,
              }}
            >
              Gallery
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-sans max-w-md">
            Review, inspect, or iterate over all your past living wireframe projects.
          </p>
        </motion.div>

        {/* Search bar & Action bar */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mb-10 flex flex-col sm:flex-row items-center gap-3 justify-between font-sans"
          >
            <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-lg">
              <Search className="w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name..."
                className="flex-1 bg-transparent text-sm font-sans text-zinc-950 dark:text-white placeholder-zinc-500 outline-none border-0"
              />
            </div>

            {clearConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    clearAllProjects()
                    setProjects([])
                    setClearConfirm(false)
                  }}
                  className="px-5 py-3 rounded-2xl text-xs font-bold bg-red-600 text-white shadow-xl hover:bg-red-700 transition-all"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setClearConfirm(false)}
                  className="px-5 py-3 rounded-2xl text-xs font-bold bg-white/80 dark:bg-black/50 border border-black/10 dark:border-white/15 text-zinc-700 dark:text-zinc-300 shadow-md"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm(true)}
                className="px-5 py-3 rounded-2xl text-xs font-bold border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Projects
              </button>
            )}
          </motion.div>
        )}

        {/* Projects Grid or Empty State */}
        {filteredProjects.length > 0 ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="h-full flex"
              >
                <GlassCard className="p-0 overflow-hidden flex flex-col w-full shadow-2xl justify-between" interactive={true}>
                  <div>
                    {/* Sketch Thumbnail with specular top border */}
                    <div className="relative h-48 bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center p-3">
                      {project.sketchDataUrl ? (
                        <img
                          src={project.sketchDataUrl}
                          alt={project.name}
                          className="w-full h-full object-contain rounded-xl opacity-90 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-zinc-400 opacity-60" />
                        </div>
                      )}

                      {/* Version count badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-sans backdrop-blur-xl border border-white/20 shadow-md text-white"
                          style={{ backgroundColor: `${themeColor}90` }}
                        >
                          {project.versions.length} Version{project.versions.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {project.analysis && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-sans bg-black/70 text-white backdrop-blur-xl border border-white/10 shadow-md">
                            {project.analysis.components?.length || 0} Elements
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Content */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-zinc-950 dark:text-white mb-1 font-sans line-clamp-1">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-sans mb-4">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-5 pt-0 mt-auto flex items-center gap-2">
                    <Link
                      href={`/project/${project.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 font-sans shadow-md"
                      style={{
                        backgroundColor: `${themeColor}20`,
                        color: themeColor,
                        border: `1px solid ${themeColor}40`,
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Open Workspace
                    </Link>

                    {deleteConfirm === project.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="px-3 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white shadow-md hover:bg-red-700 transition-all font-sans"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-2.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 border border-black/10 dark:border-white/10 hover:bg-black/10 font-sans"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm(project.id)
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md flex flex-col items-center"
          >
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center shadow-2xl w-full" interactive={false}>
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-black/10 dark:border-white/15 shadow-sm"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <FolderOpen className="w-8 h-8" style={{ color: themeColor }} />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white mb-2">
                {searchQuery ? "No Matches Found" : "No Projects in Gallery"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans mb-8 leading-relaxed">
                {searchQuery
                  ? "Try searching for a different keyword or wireframe name."
                  : "Upload your first sketch or draw in the live studio to generate code."}
              </p>
              {!searchQuery && (
                <Link
                  href="/create"
                  className="px-8 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-sans"
                  style={{
                    backgroundColor: themeColor,
                    color: themeColor.toLowerCase() === "#ffffff" ? "#000" : "#fff",
                  }}
                >
                  <Plus className="w-4 h-4" /> Create First Wireframe
                </Link>
              )}
            </GlassCard>
          </motion.div>
        )}
      </section>
    </main>
  )
}
