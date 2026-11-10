// ============================================================================
// WhiteboardOS — Core Type Definitions
// ============================================================================

export interface DetectedComponent {
  id: string
  type: ComponentType
  label: string
  confidence: number // 0-100
  x: number
  y: number
  width: number
  height: number
  properties?: Record<string, string>
  included: boolean // user can toggle on/off before code gen
}

export type ComponentType =
  | "button"
  | "input"
  | "textarea"
  | "card"
  | "header"
  | "navbar"
  | "sidebar"
  | "footer"
  | "image"
  | "icon"
  | "list"
  | "table"
  | "form"
  | "checkbox"
  | "radio"
  | "toggle"
  | "dropdown"
  | "modal"
  | "tab"
  | "accordion"
  | "divider"
  | "text"
  | "heading"
  | "link"
  | "badge"
  | "avatar"
  | "progress"
  | "chart"
  | "search"
  | "container"
  | "grid"
  | "unknown"

export interface LayoutStructure {
  type: "flex" | "grid" | "stack"
  direction: "row" | "column"
  alignment: "start" | "center" | "end" | "stretch"
  gap: number
  sections: LayoutSection[]
}

export interface LayoutSection {
  id: string
  name: string
  components: string[] // component IDs
  layout: "row" | "column" | "grid"
  columns?: number
}

export interface GeneratedCode {
  html: string
  css: string
  react: string
}

export interface AnalysisResult {
  components: DetectedComponent[]
  layout: LayoutStructure
  overallConfidence: number
  description: string
  suggestions: string[]
}

export interface Version {
  id: string
  timestamp: number
  code: GeneratedCode
  command?: string // iteration command that created this version
  changesSummary?: string
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  sketchDataUrl: string // base64 data URL of uploaded sketch
  analysis: AnalysisResult | null
  versions: Version[]
  currentVersionIndex: number
}

export interface ApiError {
  error: string
  details?: string
  code?: string
}

// Component type metadata for UI display
export const COMPONENT_TYPE_META: Record<ComponentType, { label: string; icon: string; color: string }> = {
  button: { label: "Button", icon: "🔘", color: "#8b5cf6" },
  input: { label: "Text Input", icon: "📝", color: "#06b6d4" },
  textarea: { label: "Text Area", icon: "📄", color: "#06b6d4" },
  card: { label: "Card", icon: "🃏", color: "#ec4899" },
  header: { label: "Header", icon: "📰", color: "#f59e0b" },
  navbar: { label: "Navigation", icon: "🧭", color: "#10b981" },
  sidebar: { label: "Sidebar", icon: "📋", color: "#10b981" },
  footer: { label: "Footer", icon: "🦶", color: "#64748b" },
  image: { label: "Image", icon: "🖼️", color: "#f43f5e" },
  icon: { label: "Icon", icon: "⭐", color: "#d946ef" },
  list: { label: "List", icon: "📋", color: "#3b82f6" },
  table: { label: "Table", icon: "📊", color: "#3b82f6" },
  form: { label: "Form", icon: "📑", color: "#6366f1" },
  checkbox: { label: "Checkbox", icon: "☑️", color: "#10b981" },
  radio: { label: "Radio", icon: "🔘", color: "#10b981" },
  toggle: { label: "Toggle", icon: "🔄", color: "#f59e0b" },
  dropdown: { label: "Dropdown", icon: "📥", color: "#8b5cf6" },
  modal: { label: "Modal", icon: "🪟", color: "#ec4899" },
  tab: { label: "Tab", icon: "📑", color: "#06b6d4" },
  accordion: { label: "Accordion", icon: "🪗", color: "#84cc16" },
  divider: { label: "Divider", icon: "➖", color: "#64748b" },
  text: { label: "Text", icon: "🔤", color: "#71717a" },
  heading: { label: "Heading", icon: "🔠", color: "#f97316" },
  link: { label: "Link", icon: "🔗", color: "#3b82f6" },
  badge: { label: "Badge", icon: "🏷️", color: "#d946ef" },
  avatar: { label: "Avatar", icon: "👤", color: "#ec4899" },
  progress: { label: "Progress", icon: "📊", color: "#10b981" },
  chart: { label: "Chart", icon: "📈", color: "#f59e0b" },
  search: { label: "Search", icon: "🔍", color: "#8b5cf6" },
  container: { label: "Container", icon: "📦", color: "#64748b" },
  grid: { label: "Grid Layout", icon: "🔲", color: "#06b6d4" },
  unknown: { label: "Unknown", icon: "❓", color: "#71717a" },
}
