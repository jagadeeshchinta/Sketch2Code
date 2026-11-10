// ============================================================================
// WhiteboardOS — Resilient Storage Layer with Quota Guard
// ============================================================================

import type { Project } from "./types"

const STORAGE_KEY = "whiteboardos_projects"

function getAll(): Project[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(projects: Project[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch (error) {
    // Quota Exceeded fallback: prune older project versions to free memory
    console.warn("Storage quota approaching limit, pruning older versions...", error)
    const pruned = projects.map((p) => ({
      ...p,
      // Keep only latest 2 versions per project
      versions: p.versions.slice(-2),
    }))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned))
    } catch {
      // If still failing, keep only latest 5 projects
      const ultraTrimmed = pruned.slice(0, 5)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ultraTrimmed))
      } catch (err) {
        console.error("Critical storage write failure:", err)
      }
    }
  }
}

export function getAllProjects(): Project[] {
  return getAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getProject(id: string): Project | null {
  const projects = getAll()
  return projects.find((p) => p.id === id) || null
}

export function saveProject(project: Project): void {
  const projects = getAll()
  const index = projects.findIndex((p) => p.id === project.id)
  if (index >= 0) {
    projects[index] = { ...project, updatedAt: Date.now() }
  } else {
    projects.push(project)
  }
  saveAll(projects)
}

export function deleteProject(id: string): void {
  const projects = getAll().filter((p) => p.id !== id)
  saveAll(projects)
}

export function clearAllProjects(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error("Error clearing projects:", e)
  }
}

export function createProject(name: string, sketchDataUrl: string): Project {
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const project: Project = {
    id,
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sketchDataUrl,
    analysis: null,
    versions: [],
    currentVersionIndex: -1,
  }
  saveProject(project)
  return project
}
