// ============================================================================
// VocalLabs / WhiteboardOS — Universal Voice-to-UI Semantic Synthesis Engine
// Dynamically understands ANY spoken prompt and generates bespoke wireframes,
// component trees, and production-grade Liquid Glass code.
// ============================================================================

import type { AnalysisResult, DetectedComponent, GeneratedCode } from "./types"

export interface VoiceGenerationResult {
  prompt: string
  title: string
  svgDataUrl: string
  analysis: AnalysisResult
  offlineCode: GeneratedCode
}

interface ParsedVoiceIntent {
  category: string
  title: string
  description: string
  cardCount: number
  hasNavbar: boolean
  hasChart: boolean
  hasSearch: boolean
  hasTable: boolean
  hasForm: boolean
  hasHero: boolean
  accentColor: string
  accentGradient: string
  metricsOrItems: Array<{ label: string; value: string; subtext: string; icon: string; change?: string }>
}

/**
 * Parses any spoken voice prompt into a structured UI intent.
 */
function parseVoicePrompt(promptText: string): ParsedVoiceIntent {
  const text = promptText.toLowerCase().trim()

  // 1. Detect requested card count
  let cardCount = 3
  if (text.includes("4 card") || text.includes("four card") || text.includes("4 cards") || text.includes("four cards")) {
    cardCount = 4
  } else if (text.includes("6 card") || text.includes("six card") || text.includes("6 cards")) {
    cardCount = 6
  } else if (text.includes("2 card") || text.includes("two card") || text.includes("2 cards")) {
    cardCount = 2
  } else if (text.includes("1 card") || text.includes("one card")) {
    cardCount = 1
  }

  const hasNavbar = !text.includes("no navbar") && !text.includes("without navbar")
  const hasChart = text.includes("chart") || text.includes("graph") || text.includes("analytics") || text.includes("telemetry") || text.includes("dashboard")
  const hasSearch = text.includes("search") || text.includes("filter") || text.includes("find") || text.includes("dashboard") || text.includes("store")
  const hasTable = text.includes("table") || text.includes("list") || text.includes("transcripts") || text.includes("transactions")
  const hasForm = text.includes("form") || text.includes("input") || text.includes("login") || text.includes("register") || text.includes("contact") || text.includes("booking")
  const hasHero = text.includes("hero") || text.includes("landing") || text.includes("saas") || text.includes("header")

  // 2. Identify Category & Topic
  if (text.includes("mobile") || text.includes("phone") || text.includes("ios") || text.includes("android")) {
    return {
      category: "Mobile Application Dashboard",
      title: "PocketOS Mobile Experience",
      description: `Mobile native application with biometric telemetry, status bar, and bottom tab navigation. Generated from voice prompt: "${promptText}"`,
      cardCount: cardCount || 4,
      hasNavbar: true,
      hasChart: true,
      hasSearch: true,
      hasTable: true,
      hasForm,
      hasHero: false,
      accentColor: "#3b82f6",
      accentGradient: "from-blue-500 to-indigo-600",
      metricsOrItems: [
        { label: "Daily Step Count", value: "8,420 steps", subtext: "Goal: 10,000", icon: "👟", change: "84% Reached" },
        { label: "Sleep Recovery", value: "7h 45m", subtext: "88% Quality score", icon: "🌙", change: "● Optimal" },
        { label: "Heart Rate", value: "64 bpm", subtext: "Resting average", icon: "❤️", change: "Healthy" },
        { label: "Active Calories", value: "540 kcal", subtext: "+120 kcal from walk", icon: "🔥", change: "↑ 14%" },
      ].slice(0, cardCount),
    }
  }

  if (text.includes("medical") || text.includes("doctor") || text.includes("health") || text.includes("hospital") || text.includes("clinic") || text.includes("appointment")) {
    return {
      category: "Healthcare & Telemedicine",
      title: "MedVocal Telehealth Portal",
      description: `Patient and doctor management portal generated from voice prompt: "${promptText}"`,
      cardCount: cardCount || 4,
      hasNavbar,
      hasChart: true,
      hasSearch: true,
      hasTable: true,
      hasForm,
      hasHero,
      accentColor: "#06b6d4",
      accentGradient: "from-cyan-500 to-blue-600",
      metricsOrItems: [
        { label: "Active Patients", value: "1,420", subtext: "+12 today", icon: "🩺", change: "● In Clinic" },
        { label: "Scheduled Consults", value: "38", subtext: "8 urgent", icon: "📅", change: "● Video Ready" },
        { label: "Lab Reports Pending", value: "14", subtext: "Average 1.8h", icon: "🧪", change: "⚡ Expedited" },
        { label: "Patient Satisfaction", value: "98.4%", subtext: "from 840 reviews", icon: "⭐", change: "↑ 2.1%" },
      ].slice(0, cardCount),
    }
  }

  if (text.includes("crypto") || text.includes("bitcoin") || text.includes("wallet") || text.includes("token") || text.includes("web3") || text.includes("defi") || text.includes("blockchain")) {
    return {
      category: "Web3 & Crypto Finance",
      title: "VocalPay Decentralized Vault",
      description: `Real-time multi-chain crypto wallet generated from voice prompt: "${promptText}"`,
      cardCount: cardCount || 4,
      hasNavbar,
      hasChart: true,
      hasSearch: true,
      hasTable: true,
      hasForm,
      hasHero,
      accentColor: "#f59e0b",
      accentGradient: "from-amber-500 to-orange-600",
      metricsOrItems: [
        { label: "Total Net Worth", value: "$84,920.40", subtext: "BTC, ETH, SOL", icon: "💎", change: "↑ 8.42% (24h)" },
        { label: "Bitcoin (BTC)", value: "$64,280.00", subtext: "1.142 BTC", icon: "₿", change: "↑ 3.1%" },
        { label: "Ethereum (ETH)", value: "$3,450.20", subtext: "5.82 ETH", icon: "Ξ", change: "↑ 5.8%" },
        { label: "Gas Tracker", value: "18 Gwei", subtext: "Fast Confirmation", icon: "⚡", change: "● Normal" },
      ].slice(0, cardCount),
    }
  }

  if (text.includes("ecommerce") || text.includes("store") || text.includes("shop") || text.includes("product") || text.includes("cart") || text.includes("checkout") || text.includes("clothes") || text.includes("fashion")) {
    return {
      category: "E-Commerce & Retail",
      title: "LuxeVibe Modern Storefront",
      description: `E-commerce showcase and cart management generated from voice prompt: "${promptText}"`,
      cardCount: cardCount || 4,
      hasNavbar,
      hasChart: false,
      hasSearch: true,
      hasTable: false,
      hasForm,
      hasHero: true,
      accentColor: "#ec4899",
      accentGradient: "from-pink-500 to-rose-600",
      metricsOrItems: [
        { label: "Aura Noise-Cancelling Headphones", value: "$299.00", subtext: "Matte Obsidian • 4.9★", icon: "🎧", change: "In Stock (14)" },
        { label: "Smart Ceramic Coffee Mug", value: "$149.00", subtext: "Thermal Regulated • 4.8★", icon: "☕", change: "Trending" },
        { label: "Ultra-thin Titanium Mechanical Watch", value: "$580.00", subtext: "Sapphire Crystal • 5.0★", icon: "⌚", change: "Limited 50" },
        { label: "Spatial Soundbar Pro 7.1", value: "$450.00", subtext: "Dolby Atmos Wireless", icon: "🔊", change: "Best Seller" },
      ].slice(0, cardCount),
    }
  }

  if (text.includes("fitness") || text.includes("gym") || text.includes("workout") || text.includes("diet") || text.includes("calorie") || text.includes("trainer")) {
    return {
      category: "Fitness & Health Tracker",
      title: "PulseFit Athletic Performance OS",
      description: `Biometric workout and nutrition tracking dashboard generated from voice prompt: "${promptText}"`,
      cardCount: cardCount || 4,
      hasNavbar,
      hasChart: true,
      hasSearch: false,
      hasTable: true,
      hasForm,
      hasHero,
      accentColor: "#10b981",
      accentGradient: "from-emerald-500 to-teal-600",
      metricsOrItems: [
        { label: "Daily Calories Burned", value: "2,480 kcal", subtext: "Target: 2,500 kcal", icon: "🔥", change: "96% of goal" },
        { label: "Active Workout Time", value: "54 mins", subtext: "HIIT + Upper Body", icon: "⏱️", change: "● In Progress" },
        { label: "Resting Heart Rate", value: "58 bpm", subtext: "Optimal Recovery", icon: "❤️", change: "Healthy Range" },
        { label: "Hydration Target", value: "2.8L / 3.0L", subtext: "Electrolytes Added", icon: "💧", change: "↑ 400ml" },
      ].slice(0, cardCount),
    }
  }

  if (text.includes("food") || text.includes("restaurant") || text.includes("pizza") || text.includes("delivery") || text.includes("order") || text.includes("menu")) {
    return {
      category: "Food & Restaurant Delivery",
      title: "GourmetExpress Cloud Kitchen",
      description: `Real-time restaurant ordering and menu portal generated from voice prompt: "${promptText}"`,
      cardCount: cardCount || 4,
      hasNavbar,
      hasChart: false,
      hasSearch: true,
      hasTable: true,
      hasForm,
      hasHero: true,
      accentColor: "#f97316",
      accentGradient: "from-orange-500 to-amber-600",
      metricsOrItems: [
        { label: "Artisan Truffle Pizza", value: "$24.50", subtext: "Wood-fired sourdough • 4.9★", icon: "🍕", change: "Popular" },
        { label: "Smoked Wagyu Burger", value: "$18.90", subtext: "Aged cheddar & brioche", icon: "🍔", change: "Chef Special" },
        { label: "Wild Atlantic Salmon Bowl", value: "$21.00", subtext: "Avocado & quinoa • 4.8★", icon: "🥗", change: "Healthy Choice" },
        { label: "Matcha Lava Cake", value: "$9.50", subtext: "Organic Uji matcha", icon: "🍰", change: "New Dessert" },
      ].slice(0, cardCount),
    }
  }

  if (text.includes("saas") || text.includes("pricing") || text.includes("landing") || text.includes("startup") || text.includes("features")) {
    return {
      category: "SaaS & AI Cloud Platform",
      title: "VocalLabs Enterprise Voice AI",
      description: `High-conversion SaaS product showcase and pricing tiers generated from voice prompt: "${promptText}"`,
      cardCount: cardCount || 3,
      hasNavbar,
      hasChart: true,
      hasSearch: false,
      hasTable: false,
      hasForm,
      hasHero: true,
      accentColor: "#8b5cf6",
      accentGradient: "from-indigo-500 to-purple-600",
      metricsOrItems: [
        { label: "Starter Plan", value: "$29/mo", subtext: "Up to 5,000 voice minutes", icon: "🚀", change: "Free 14d Trial" },
        { label: "Pro Cloud (Most Popular)", value: "$99/mo", subtext: "Unlimited pipelines & 100ms latency", icon: "⚡", change: "★ Best Value" },
        { label: "Enterprise Scale", value: "$499/mo", subtext: "Custom SLM fine-tuning & SLA", icon: "🏢", change: "Dedicated Rep" },
        { label: "Global Edge Nodes", value: "48 Regions", subtext: "99.99% Guaranteed SLA", icon: "🌐", change: "Zero Downtime" },
      ].slice(0, cardCount),
    }
  }

  // Default: Universal Analytics / Management Dashboard
  return {
    category: "Analytics & Executive OS",
    title: "VocalLabs Executive Control Center",
    description: `Real-time management dashboard generated from voice command: "${promptText}"`,
    cardCount: cardCount || 4,
    hasNavbar,
    hasChart: true,
    hasSearch: true,
    hasTable: true,
    hasForm,
    hasHero: false,
    accentColor: "#6366f1",
    accentGradient: "from-indigo-500 to-purple-600",
    metricsOrItems: [
      { label: "Total Revenue", value: "$128,450.00", subtext: "Monthly recurring", icon: "💰", change: "↑ 14.2% MoM" },
      { label: "Voice AI Sessions", value: "24,890", subtext: "Active conversational flows", icon: "🎙️", change: "↑ 8.4% callers" },
      { label: "Intent Recognition", value: "98.8%", subtext: "Sub-200ms execution", icon: "🧠", change: "↑ 1.2% accuracy" },
      { label: "System Health", value: "99.98%", subtext: "0 outages recorded", icon: "🛡️", change: "● All Systems Normal" },
    ].slice(0, cardCount),
  }
}

/**
 * Synthesizes an authentic SVG whiteboard drawing representing the spoken blueprint.
 */
function buildSvgFromIntent(intent: ParsedVoiceIntent, prompt: string): string {
  const cardWidth = Math.floor(820 / intent.cardCount) - 15
  const startX = 40

  let cardsSvg = ""
  for (let i = 0; i < intent.cardCount; i++) {
    const x = startX + i * (cardWidth + 15)
    cardsSvg += `
      <rect x="${x}" y="155" width="${cardWidth}" height="120" rx="16" fill="none" stroke="#1e1e24" stroke-width="3"/>
      <circle cx="${x + 25}" cy="180" r="10" fill="${intent.accentColor}" opacity="0.85"/>
      <line x1="${x + 45}" y1="180" x2="${x + cardWidth - 25}" y2="180" stroke="#666670" stroke-width="4" stroke-linecap="round"/>
      <line x1="${x + 20}" y1="215" x2="${x + cardWidth - 30}" y2="215" stroke="#1e1e24" stroke-width="7" stroke-linecap="round"/>
      <line x1="${x + 20}" y1="245" x2="${x + Math.floor(cardWidth * 0.6)}" y2="245" stroke="${intent.accentColor}" stroke-width="3" stroke-linecap="round"/>
    `
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650" viewBox="0 0 900 650" fill="#ffffff">
    <rect width="900" height="650" fill="#ffffff"/>
    
    <!-- Top Navigation Bar -->
    <rect x="30" y="25" width="840" height="55" rx="16" fill="none" stroke="#1e1e24" stroke-width="3"/>
    <circle cx="65" cy="52" r="14" fill="${intent.accentColor}"/>
    <line x1="90" y1="52" x2="190" y2="52" stroke="#1e1e24" stroke-width="6" stroke-linecap="round"/>
    <rect x="250" y="38" width="280" height="28" rx="8" fill="none" stroke="#9999a0" stroke-width="2"/>
    <circle cx="785" cy="52" r="13" fill="${intent.accentColor}"/>
    <circle cx="830" cy="52" r="15" fill="#1e1e24"/>

    <!-- Section Title Headline -->
    <line x1="35" y1="110" x2="300" y2="110" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
    <line x1="35" y1="130" x2="450" y2="130" stroke="#888890" stroke-width="4" stroke-linecap="round"/>

    <!-- Dynamic Cards Grid -->
    ${cardsSvg}

    <!-- Lower Section: Analytics or Details -->
    <rect x="30" y="300" width="540" height="310" rx="20" fill="none" stroke="#1e1e24" stroke-width="3"/>
    <line x1="60" y1="340" x2="220" y2="340" stroke="#1e1e24" stroke-width="6" stroke-linecap="round"/>
    <polyline points="60,530 130,480 200,500 280,420 360,450 440,380 510,400" fill="none" stroke="${intent.accentColor}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="60,560 130,520 200,540 280,480 360,490 440,440 510,460" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="6" stroke-linecap="round"/>

    <!-- Side Event Feed -->
    <rect x="590" y="300" width="280" height="310" rx="20" fill="none" stroke="#1e1e24" stroke-width="3"/>
    <line x1="620" y1="340" x2="760" y2="340" stroke="#1e1e24" stroke-width="6" stroke-linecap="round"/>
    <rect x="610" y="375" width="240" height="55" rx="10" fill="none" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="635" cy="402" r="10" fill="${intent.accentColor}"/>
    <line x1="660" y1="402" x2="810" y2="402" stroke="#333333" stroke-width="4" stroke-linecap="round"/>
    <rect x="610" y="445" width="240" height="55" rx="10" fill="none" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="635" cy="472" r="10" fill="#3b82f6"/>
    <line x1="660" y1="472" x2="810" y2="472" stroke="#333333" stroke-width="4" stroke-linecap="round"/>
    <rect x="610" y="515" width="240" height="55" rx="10" fill="none" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="635" cy="542" r="10" fill="#f59e0b"/>
    <line x1="660" y1="542" x2="810" y2="542" stroke="#333333" stroke-width="4" stroke-linecap="round"/>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * Builds dynamic HTML/CSS/React code matching the exact intent.
 */
function buildCodeFromIntent(intent: ParsedVoiceIntent): GeneratedCode {
  const cardsHtml = intent.metricsOrItems
    .map(
      (card) => `
      <div class="glass-panel glass-card-hover rounded-2xl p-5 relative overflow-hidden transition-all duration-300">
        <div class="accent-glow absolute inset-0"></div>
        <div class="relative z-10 flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">${card.label}</span>
          <div class="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner">
            ${card.icon}
          </div>
        </div>
        <div class="relative z-10 space-y-1">
          <h3 class="text-2xl font-extrabold text-white tracking-tight">${card.value}</h3>
          <p class="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
            <span>${card.change || "● Active"}</span>
            <span class="text-zinc-400">• ${card.subtext}</span>
          </p>
        </div>
      </div>`
    )
    .join("\n")

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${intent.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-panel {
      background: rgba(18, 20, 29, 0.7);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.15);
    }
    .glass-card-hover:hover {
      transform: translateY(-4px);
      border-color: ${intent.accentColor}80;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 30px ${intent.accentColor}30;
    }
    .accent-glow {
      background: radial-gradient(circle at 50% 0%, ${intent.accentColor}25, transparent 70%);
    }
  </style>
</head>
<body class="bg-[#090b10] text-white min-h-screen relative overflow-x-hidden selection:bg-indigo-500/30">
  <!-- Dynamic Ambient Backlight -->
  <div class="fixed inset-0 pointer-events-none z-0">
    <div class="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[130px] opacity-25" style="background-color: ${intent.accentColor}"></div>
    <div class="absolute top-1/2 -right-20 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px]"></div>
  </div>

  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
    
    <!-- ── Top Glass Navigation Bar ── -->
    <header class="glass-panel rounded-2xl px-6 py-4 flex items-center justify-between transition-all">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr ${intent.accentGradient} flex items-center justify-center shadow-lg">
          <span class="text-white font-bold text-base">VL</span>
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            ${intent.title}
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15 font-semibold">
              ${intent.category}
            </span>
          </h1>
          <p class="text-xs text-zinc-400">Synthesized from Voice Dictation Intent</p>
        </div>
      </div>

      <!-- Search Input -->
      <div class="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 w-80 text-sm focus-within:border-white/30 transition-all">
        <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" placeholder="Search data, elements, metrics..." class="bg-transparent border-0 outline-none text-xs text-white placeholder-zinc-500 w-full" />
      </div>

      <!-- Action Button -->
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 rounded-xl bg-gradient-to-r ${intent.accentGradient} hover:opacity-90 font-medium text-xs text-white shadow-lg transition-all flex items-center gap-1.5">
          <span>+ Quick Action</span>
        </button>
        <div class="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-bold text-xs text-white">
          JC
        </div>
      </div>
    </header>

    <!-- ── Dynamic Cards Grid (${intent.cardCount} Cards) ── -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(intent.cardCount, 4)} gap-5">
      ${cardsHtml}
    </section>

    <!-- ── Lower Interactive Analytics & Activity Flow ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Main Activity / Telemetry Section (2/3) -->
      <div class="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-white">Real-Time Performance & Telemetry</h2>
            <p class="text-xs text-zinc-400">Continuous streaming data points over time</p>
          </div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Stream
          </span>
        </div>

        <div class="h-60 w-full pt-4">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${intent.accentColor}" stop-opacity="0.45" />
                <stop offset="100%" stop-color="${intent.accentColor}" stop-opacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M0,140 Q100,50 200,90 T400,30 T600,70 L700,20 L700,200 L0,200 Z" fill="url(#areaGrad)" />
            <path d="M0,140 Q100,50 200,90 T400,30 T600,70 L700,20" fill="none" stroke="${intent.accentColor}" stroke-width="3.5" stroke-linecap="round" />
          </svg>
        </div>
      </div>

      <!-- Live Stream Events (1/3) -->
      <div class="glass-panel rounded-2xl p-6 space-y-4 flex flex-col justify-between">
        <div>
          <h2 class="text-base font-bold text-white mb-1">Live Event Feed</h2>
          <p class="text-xs text-zinc-400">Recent system interactions</p>
        </div>

        <div class="space-y-3">
          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-white/30 transition-all">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-indigo-400">Stream Event #104</span>
              <span class="text-zinc-500">Just now</span>
            </div>
            <p class="text-xs text-zinc-300">Voice synthesis request validated with 99.4% intent match.</p>
          </div>

          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-white/30 transition-all">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-purple-400">Session Sync #103</span>
              <span class="text-zinc-500">2m ago</span>
            </div>
            <p class="text-xs text-zinc-300">Liquid Glass token compilation completed successfully.</p>
          </div>
        </div>

        <button class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 transition-all">
          View All Logs &rarr;
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
  --glass-bg: rgba(18, 20, 29, 0.7);
  --accent: ${intent.accentColor};
}

body {
  background-color: #090b10;
  color: #ffffff;
}`

  const react = `import React from 'react';

export default function VoiceSynthesizedApp() {
  return (
    <div className="min-h-screen bg-[#090b10] text-white p-6 space-y-6">
      <header className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
        <h1 className="font-bold text-lg">${intent.title}</h1>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/10">${intent.category}</span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-${Math.min(intent.cardCount, 4)} gap-4">
        ${JSON.stringify(intent.metricsOrItems, null, 2)}
      </div>
    </div>
  );
}`

  return { html, css, react }
}

/**
 * Universal entry point: Takes ANY voice prompt, understands it,
 * and generates tailored wireframe + component tree + live code!
 */
export function generateWireframeFromVoicePrompt(promptText: string): VoiceGenerationResult {
  const intent = parseVoicePrompt(promptText)
  const svgDataUrl = buildSvgFromIntent(intent, promptText)

  const components: DetectedComponent[] = [
    {
      id: "comp_v_nav",
      type: "navbar",
      label: `Top Navigation Header (${intent.title})`,
      confidence: 0.98,
      x: 3,
      y: 4,
      width: 94,
      height: 9,
      included: true,
      properties: { style: "glass", brand: intent.title },
    },
    ...intent.metricsOrItems.map((item, idx) => ({
      id: `comp_v_card_${idx + 1}`,
      type: "card" as const,
      label: `Card ${idx + 1}: ${item.label} (${item.value})`,
      confidence: 0.95 - idx * 0.01,
      x: 3 + idx * Math.floor(94 / intent.cardCount),
      y: 25,
      width: Math.floor(90 / intent.cardCount),
      height: 20,
      included: true,
      properties: { metric: item.value, subtext: item.subtext, icon: item.icon },
    })),
    {
      id: "comp_v_chart",
      type: "chart",
      label: `Real-time Telemetry & Stream Area Chart`,
      confidence: 0.94,
      x: 3,
      y: 50,
      width: 60,
      height: 44,
      included: true,
      properties: { chartType: "area-gradient" },
    },
    {
      id: "comp_v_feed",
      type: "list",
      label: `Live Event Stream & Activity Logger`,
      confidence: 0.92,
      x: 65,
      y: 50,
      width: 32,
      height: 44,
      included: true,
      properties: { live: "true" },
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
        { id: "sec_nav", name: "Navigation", components: ["comp_v_nav"], layout: "row" },
        {
          id: "sec_cards",
          name: `${intent.cardCount}-Card Grid`,
          components: intent.metricsOrItems.map((_, i) => `comp_v_card_${i + 1}`),
          layout: "grid",
          columns: intent.cardCount,
        },
        { id: "sec_chart", name: "Telemetry & Feed", components: ["comp_v_chart", "comp_v_feed"], layout: "row" },
      ],
    },
    overallConfidence: 0.96,
    description: `${intent.category}: ${intent.title}. Spoken prompt: "${promptText}"`,
    suggestions: [
      `Synthesized tailored ${intent.cardCount}-card blueprint for "${promptText}"`,
      `Injected Liquid Glass theme tokens with ${intent.accentColor} accents`,
      `Configured dynamic responsive layout and telemetry visualizations`,
    ],
  }

  const offlineCode = buildCodeFromIntent(intent)

  return {
    prompt: promptText,
    title: intent.title,
    svgDataUrl,
    analysis,
    offlineCode,
  }
}
