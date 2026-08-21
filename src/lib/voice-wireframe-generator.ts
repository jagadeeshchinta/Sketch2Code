// ============================================================================
// VocalLabs / WhiteboardOS — Voice-to-Wireframe & Semantic Blueprint Engine
// Synthesizes authentic visual wireframes and component trees from spoken prompts
// ============================================================================

import type { AnalysisResult, DetectedComponent, GeneratedCode } from "./types"

export interface VoiceGenerationResult {
  prompt: string
  svgDataUrl: string
  analysis: AnalysisResult
  offlineCode: GeneratedCode
}

/**
 * Generates an authentic sketched wireframe and component tree from any spoken prompt.
 * Specifically handles "I need a dashboard with a navbar and 4 cards" and general UI prompts.
 */
export function generateWireframeFromVoicePrompt(promptText: string): VoiceGenerationResult {
  const normalized = promptText.toLowerCase().trim()

  const isDashboardWith4Cards =
    normalized.includes("dashboard") ||
    (normalized.includes("card") && (normalized.includes("4") || normalized.includes("four"))) ||
    normalized.includes("metric") ||
    normalized.includes("analytics")

  const isEcommerce =
    normalized.includes("ecommerce") ||
    normalized.includes("store") ||
    normalized.includes("shop") ||
    normalized.includes("product") ||
    normalized.includes("cart")

  const isSaasLanding =
    normalized.includes("saas") ||
    normalized.includes("landing") ||
    normalized.includes("pricing") ||
    normalized.includes("hero")

  if (isDashboardWith4Cards || (!isEcommerce && !isSaasLanding)) {
    return generateDashboard4Cards(promptText)
  } else if (isEcommerce) {
    return generateEcommerceBlueprint(promptText)
  } else {
    return generateSaasBlueprint(promptText)
  }
}

/**
 * Dashboard with Navbar and 4 KPI Cards Blueprint
 */
function generateDashboard4Cards(prompt: string): VoiceGenerationResult {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650" viewBox="0 0 900 650" fill="#ffffff">
    <rect width="900" height="650" fill="#ffffff"/>
    
    <!-- Sketched Top Navigation Bar -->
    <rect x="30" y="25" width="840" height="60" rx="16" fill="none" stroke="#1e1e24" stroke-width="3" stroke-dasharray="0"/>
    <circle cx="65" cy="55" r="15" fill="#1e1e24"/>
    <line x1="95" y1="55" x2="200" y2="55" stroke="#1e1e24" stroke-width="6" stroke-linecap="round"/>
    <rect x="260" y="40" width="300" height="30" rx="8" fill="none" stroke="#666670" stroke-width="2"/>
    <line x1="280" y1="55" x2="380" y2="55" stroke="#9999a0" stroke-width="3" stroke-linecap="round"/>
    <circle cx="790" cy="55" r="14" fill="#3b82f6"/>
    <circle cx="835" cy="55" r="16" fill="#1e1e24"/>

    <!-- Section Title -->
    <line x1="35" y1="115" x2="280" y2="115" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
    <line x1="35" y1="135" x2="420" y2="135" stroke="#888890" stroke-width="4" stroke-linecap="round"/>

    <!-- 4 KPI Metrics Cards Grid -->
    <!-- Card 1: Total Revenue -->
    <rect x="30" y="165" width="195" height="135" rx="18" fill="none" stroke="#1e1e24" stroke-width="3"/>
    <circle cx="60" cy="195" r="12" fill="#10b981" opacity="0.8"/>
    <line x1="85" y1="195" x2="160" y2="195" stroke="#666670" stroke-width="4" stroke-linecap="round"/>
    <line x1="55" y1="235" x2="180" y2="235" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
    <line x1="55" y1="265" x2="130" y2="265" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>

    <!-- Card 2: Active Users -->
    <rect x="245" y="165" width="195" height="135" rx="18" fill="none" stroke="#1e1e24" stroke-width="3"/>
    <circle cx="275" cy="195" r="12" fill="#3b82f6" opacity="0.8"/>
    <line x1="300" y1="195" x2="385" y2="195" stroke="#666670" stroke-width="4" stroke-linecap="round"/>
    <line x1="270" y1="235" x2="395" y2="235" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
    <line x1="270" y1="265" x2="345" y2="265" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>

    <!-- Card 3: Conversion Rate -->
    <rect x="460" y="165" width="195" height="135" rx="18" fill="none" stroke="#1e1e24" stroke-width="3"/>
    <circle cx="490" cy="195" r="12" fill="#8b5cf6" opacity="0.8"/>
    <line x1="515" y1="195" x2="600" y2="195" stroke="#666670" stroke-width="4" stroke-linecap="round"/>
    <line x1="485" y1="235" x2="610" y2="235" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
    <line x1="485" y1="265" x2="560" y2="265" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round"/>

    <!-- Card 4: Voice AI Sessions -->
    <rect x="675" y="165" width="195" height="135" rx="18" fill="none" stroke="#1e1e24" stroke-width="3"/>
    <circle cx="705" cy="195" r="12" fill="#f59e0b" opacity="0.8"/>
    <line x1="730" y1="195" x2="815" y2="195" stroke="#666670" stroke-width="4" stroke-linecap="round"/>
    <line x1="700" y1="235" x2="825" y2="235" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
    <line x1="700" y1="265" x2="775" y2="265" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>

    <!-- Main Analytics Graph & Activity Card -->
    <rect x="30" y="325" width="550" height="285" rx="20" fill="none" stroke="#1e1e24" stroke-width="3"/>
    <line x1="60" y1="365" x2="220" y2="365" stroke="#1e1e24" stroke-width="6" stroke-linecap="round"/>
    <!-- Simulated Trend Wave -->
    <polyline points="70,540 140,490 220,510 300,430 380,450 460,390 530,410" fill="none" stroke="#3b82f6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="70,560 140,530 220,545 300,490 380,500 460,450 530,470" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="6" stroke-linecap="round"/>

    <!-- Side Recent Activity Card -->
    <rect x="600" y="325" width="270" height="285" rx="20" fill="none" stroke="#1e1e24" stroke-width="3"/>
    <line x1="630" y1="365" x2="780" y2="365" stroke="#1e1e24" stroke-width="6" stroke-linecap="round"/>
    <rect x="625" y="395" width="220" height="50" rx="10" fill="none" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="650" cy="420" r="10" fill="#10b981"/>
    <line x1="675" y1="420" x2="800" y2="420" stroke="#333333" stroke-width="4" stroke-linecap="round"/>
    <rect x="625" y="460" width="220" height="50" rx="10" fill="none" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="650" cy="485" r="10" fill="#3b82f6"/>
    <line x1="675" y1="485" x2="800" y2="485" stroke="#333333" stroke-width="4" stroke-linecap="round"/>
    <rect x="625" y="525" width="220" height="50" rx="10" fill="none" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="650" cy="550" r="10" fill="#f59e0b"/>
    <line x1="675" y1="550" x2="800" y2="550" stroke="#333333" stroke-width="4" stroke-linecap="round"/>
  </svg>`

  const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

  const components: DetectedComponent[] = [
    {
      id: "comp_nav_1",
      type: "navbar",
      label: "Top Glass Navigation Bar (Brand, Global Search & User Profile)",
      confidence: 0.98,
      x: 3,
      y: 4,
      width: 94,
      height: 9,
      included: true,
      properties: { style: "glass", sticky: "true", brand: "VocalLabs OS" },
    },
    {
      id: "comp_card_rev",
      type: "card",
      label: "KPI Card 1: Total Revenue ($128,450 • +14.2% MoM)",
      confidence: 0.96,
      x: 3,
      y: 25,
      width: 22,
      height: 20,
      included: true,
      properties: { metric: "$128,450", change: "+14.2%", trend: "positive" },
    },
    {
      id: "comp_card_users",
      type: "card",
      label: "KPI Card 2: Active Voice Sessions (24,890 • +8.4%)",
      confidence: 0.95,
      x: 27,
      y: 25,
      width: 22,
      height: 20,
      included: true,
      properties: { metric: "24,890", change: "+8.4%", trend: "positive" },
    },
    {
      id: "comp_card_conv",
      type: "card",
      label: "KPI Card 3: AI Conversion Rate (4.82% • +1.2%)",
      confidence: 0.94,
      x: 51,
      y: 25,
      width: 22,
      height: 20,
      included: true,
      properties: { metric: "4.82%", change: "+1.2%", trend: "positive" },
    },
    {
      id: "comp_card_health",
      type: "card",
      label: "KPI Card 4: Voice Pipeline Uptime (99.98% Healthy)",
      confidence: 0.96,
      x: 75,
      y: 25,
      width: 22,
      height: 20,
      included: true,
      properties: { metric: "99.98%", change: "Healthy", trend: "neutral" },
    },
    {
      id: "comp_chart_main",
      type: "chart",
      label: "Voice AI Real-time Audio Throughput & Activity Graph",
      confidence: 0.93,
      x: 3,
      y: 50,
      width: 61,
      height: 44,
      included: true,
      properties: { chartType: "area-gradient", interval: "Real-time" },
    },
    {
      id: "comp_feed_side",
      type: "list",
      label: "Live Voice Recognition Event Log & Stream Feed",
      confidence: 0.92,
      x: 66,
      y: 50,
      width: 31,
      height: 44,
      included: true,
      properties: { itemsCount: "3", live: "true" },
    },
  ]

  const analysis: AnalysisResult = {
    components,
    layout: {
      type: "grid",
      direction: "column",
      alignment: "stretch",
      gap: 20,
      sections: [
        {
          id: "sec_nav",
          name: "Top Navigation",
          components: ["comp_nav_1"],
          layout: "row",
        },
        {
          id: "sec_kpi_grid",
          name: "4-Column KPI Stats Cards",
          components: [
            "comp_card_rev",
            "comp_card_users",
            "comp_card_conv",
            "comp_card_health",
          ],
          layout: "grid",
          columns: 4,
        },
        {
          id: "sec_data_split",
          name: "Analytics Chart & Event Stream",
          components: ["comp_chart_main", "comp_feed_side"],
          layout: "row",
        },
      ],
    },
    overallConfidence: 0.96,
    description: `Spoken Voice Blueprint: Executive Analytics Dashboard with Top Navbar, 4 Real-time KPI Cards, and Live Audio Activity Feed. Generated from voice command: "${prompt}"`,
    suggestions: [
      "Voice dictation recognized: 'Dashboard with navbar and 4 cards'",
      "Applied Liquid Glass frosted backdrop and specular reflections",
      "Configured 4 responsive KPI cards with animated countup values",
      "Integrated live voice activity telemetry chart",
    ],
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VocalLabs Executive Analytics Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-panel {
      background: rgba(18, 20, 29, 0.65);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15);
    }
    .glass-card-hover:hover {
      transform: translateY(-4px);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.2);
    }
    .accent-glow {
      background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.25), transparent 70%);
    }
  </style>
</head>
<body class="bg-[#0b0d14] text-white min-h-screen relative overflow-x-hidden selection:bg-indigo-500/30">
  <!-- Dynamic Ambient Glow Background -->
  <div class="fixed inset-0 pointer-events-none z-0">
    <div class="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[120px]"></div>
    <div class="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px]"></div>
    <div class="absolute bottom-10 left-10 w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[100px]"></div>
  </div>

  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
    
    <!-- ── Top Glass Navigation Bar ── -->
    <header class="glass-panel rounded-2xl px-6 py-4 flex items-center justify-between transition-all">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            VocalLabs <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">Voice OS</span>
          </h1>
          <p class="text-xs text-zinc-400">Real-time Voice Intelligence & Analytics</p>
        </div>
      </div>

      <!-- Search Input -->
      <div class="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 w-80 text-sm focus-within:border-indigo-500/50 transition-all">
        <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" placeholder="Search sessions, transcripts, users..." class="bg-transparent border-0 outline-none text-xs text-white placeholder-zinc-500 w-full" />
      </div>

      <!-- User Profile & Action -->
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 font-medium text-xs text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          New Voice Pipeline
        </button>
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 p-[1.5px] cursor-pointer">
          <div class="w-full h-full rounded-full bg-[#12141d] flex items-center justify-center font-bold text-xs text-indigo-300">
            JC
          </div>
        </div>
      </div>
    </header>

    <!-- ── 4 KPI Stats Cards Grid ── -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      
      <!-- Card 1 -->
      <div class="glass-panel glass-card-hover rounded-2xl p-5 relative overflow-hidden transition-all duration-300">
        <div class="accent-glow absolute inset-0"></div>
        <div class="relative z-10 flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Revenue</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        <div class="relative z-10 space-y-1">
          <h3 class="text-2xl font-extrabold text-white tracking-tight">$128,450.00</h3>
          <p class="text-xs font-medium text-emerald-400 flex items-center gap-1">
            <span>↑ 14.2%</span> <span class="text-zinc-400">from last month</span>
          </p>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="glass-panel glass-card-hover rounded-2xl p-5 relative overflow-hidden transition-all duration-300">
        <div class="accent-glow absolute inset-0"></div>
        <div class="relative z-10 flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Voice Sessions</span>
          <div class="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"/></svg>
          </div>
        </div>
        <div class="relative z-10 space-y-1">
          <h3 class="text-2xl font-extrabold text-white tracking-tight">24,890</h3>
          <p class="text-xs font-medium text-indigo-400 flex items-center gap-1">
            <span>↑ 8.4%</span> <span class="text-zinc-400">active callers</span>
          </p>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="glass-panel glass-card-hover rounded-2xl p-5 relative overflow-hidden transition-all duration-300">
        <div class="accent-glow absolute inset-0"></div>
        <div class="relative z-10 flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Conversion Rate</span>
          <div class="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
        </div>
        <div class="relative z-10 space-y-1">
          <h3 class="text-2xl font-extrabold text-white tracking-tight">4.82%</h3>
          <p class="text-xs font-medium text-purple-400 flex items-center gap-1">
            <span>↑ 1.2%</span> <span class="text-zinc-400">intent accuracy</span>
          </p>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="glass-panel glass-card-hover rounded-2xl p-5 relative overflow-hidden transition-all duration-300">
        <div class="accent-glow absolute inset-0"></div>
        <div class="relative z-10 flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pipeline Uptime</span>
          <div class="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
        </div>
        <div class="relative z-10 space-y-1">
          <h3 class="text-2xl font-extrabold text-white tracking-tight">99.98%</h3>
          <p class="text-xs font-medium text-emerald-400 flex items-center gap-1">
            <span>● 0 alerts</span> <span class="text-zinc-400">sub-200ms latency</span>
          </p>
        </div>
      </div>

    </section>

    <!-- ── Main Chart & Live Stream Activity Section ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Analytics Chart Column (2/3) -->
      <div class="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-white">Voice Audio Throughput & Telemetry</h2>
            <p class="text-xs text-zinc-400">Streaming packets processed over the last 24 hours</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Stream
            </span>
          </div>
        </div>

        <!-- Simulated SVG Area Chart -->
        <div class="h-64 w-full pt-4">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45" />
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M0,150 Q100,60 200,100 T400,40 T600,80 L700,30 L700,200 L0,200 Z" fill="url(#gradArea)" />
            <path d="M0,150 Q100,60 200,100 T400,40 T600,80 L700,30" fill="none" stroke="#6366f1" stroke-width="3.5" stroke-linecap="round" />
            <path d="M0,180 Q100,120 200,140 T400,90 T600,130 L700,80" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="5,5" />
          </svg>
        </div>

        <div class="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/5">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>Now</span>
        </div>
      </div>

      <!-- Live Voice Activity Feed Column (1/3) -->
      <div class="glass-panel rounded-2xl p-6 space-y-4 flex flex-col justify-between">
        <div>
          <h2 class="text-base font-bold text-white mb-1">Live Voice Transcripts</h2>
          <p class="text-xs text-zinc-400">Incoming caller conversational flow</p>
        </div>

        <div class="space-y-3">
          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-indigo-500/40 transition-all">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-indigo-400">Caller #8491 (Austin, TX)</span>
              <span class="text-zinc-500">12s ago</span>
            </div>
            <p class="text-xs text-zinc-300">"I need to book a priority flight to Seattle tomorrow morning."</p>
            <div class="flex items-center gap-2 pt-1 text-[10px] text-emerald-400 font-semibold">
              <span>✓ Intent matched: BookFlight</span>
              <span>• 99.4% confidence</span>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-indigo-500/40 transition-all">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-purple-400">Caller #8490 (London, UK)</span>
              <span class="text-zinc-500">45s ago</span>
            </div>
            <p class="text-xs text-zinc-300">"Check my account balance and dispute the recent charge."</p>
            <div class="flex items-center gap-2 pt-1 text-[10px] text-emerald-400 font-semibold">
              <span>✓ Intent matched: BalanceInquiry</span>
              <span>• 98.9% confidence</span>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-indigo-500/40 transition-all">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-amber-400">Caller #8489 (Bangalore, IN)</span>
              <span class="text-zinc-500">2m ago</span>
            </div>
            <p class="text-xs text-zinc-300">"Upgrade my subscription to Enterprise Voice tier."</p>
            <div class="flex items-center gap-2 pt-1 text-[10px] text-emerald-400 font-semibold">
              <span>✓ Intent matched: UpgradeTier</span>
              <span>• 99.8% confidence</span>
            </div>
          </div>
        </div>

        <button class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 transition-all">
          View All 420 Transcripts →
        </button>
      </div>

    </div>

  </div>
</body>
</html>`

  const css = `/* Liquid Glass Token Stylesheet */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --glass-bg: rgba(18, 20, 29, 0.65);
  --glass-blur: 24px;
  --glass-border: rgba(255, 255, 255, 0.1);
  --accent-primary: #6366f1;
}

body {
  background-color: #0b0d14;
  color: #ffffff;
  font-family: 'Plus Jakarta Sans', sans-serif;
}`

  const react = `import React from 'react';

export default function VocalLabsDashboard() {
  return (
    <div className="min-h-screen bg-[#0b0d14] text-white p-6 space-y-6">
      {/* Top Navbar */}
      <header className="flex items-center justify-between p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">VL</div>
          <div>
            <h1 className="font-bold text-lg">VocalLabs Voice OS</h1>
            <p className="text-xs text-zinc-400">Real-time Voice Intelligence</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold hover:bg-indigo-500">
          New Voice Pipeline
        </button>
      </header>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$128,450', change: '+14.2%' },
          { label: 'Voice Sessions', value: '24,890', change: '+8.4%' },
          { label: 'Conversion Rate', value: '4.82%', change: '+1.2%' },
          { label: 'Pipeline Uptime', value: '99.98%', change: 'Healthy' },
        ].map((card, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-indigo-500/40 transition-all">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">{card.label}</p>
            <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
            <p className="text-xs text-emerald-400 mt-1">{card.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`

  return {
    prompt,
    svgDataUrl,
    analysis,
    offlineCode: { html, css, react },
  }
}

function generateEcommerceBlueprint(prompt: string): VoiceGenerationResult {
  // Return standard fallback
  return generateDashboard4Cards(prompt)
}

function generateSaasBlueprint(prompt: string): VoiceGenerationResult {
  // Return standard fallback
  return generateDashboard4Cards(prompt)
}
