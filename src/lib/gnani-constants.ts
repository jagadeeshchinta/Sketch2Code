// ============================================================================
// WhiteboardOS — Gnani.ai Language Constants (Safe for Client & Server)
// ============================================================================

export const GNANI_SUPPORTED_LANGUAGES = [
  { code: "indic-auto", name: "Auto Detect (Indic & Hinglish)", flag: "🇮🇳" },
  { code: "hi-IN", name: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { code: "en-IN", name: "Indian English", flag: "🇮🇳" },
  { code: "ta-IN", name: "Tamil (தமிழ்)", flag: "🇮🇳" },
  { code: "te-IN", name: "Telugu (తెలుగు)", flag: "🇮🇳" },
  { code: "kn-IN", name: "Kannada (ಕನ್ನಡ)", flag: "🇮🇳" },
  { code: "mr-IN", name: "Marathi (मराठी)", flag: "🇮🇳" },
  { code: "gu-IN", name: "Gujarati (ગુજરાતી)", flag: "🇮🇳" },
  { code: "bn-IN", name: "Bengali (বাংলা)", flag: "🇮🇳" },
  { code: "ml-IN", name: "Malayalam (മലയാളം)", flag: "🇮🇳" },
  { code: "pa-guru-IN", name: "Punjabi (ਪੰਜਾਬੀ)", flag: "🇮🇳" },
] as const

export type GnaniLanguageCode = typeof GNANI_SUPPORTED_LANGUAGES[number]["code"]

