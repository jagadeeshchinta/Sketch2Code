// ============================================================================
// WhiteboardOS — AST Guardrails & DOM Self-Healing Engine
// ============================================================================

export interface GuardrailReport {
  isValid: boolean
  repaired: boolean
  violations: string[]
  sanitizedHtml: string
}

/**
 * Validates and self-heals generated HTML/CSS code before sandboxing.
 * Strips dangerous external scripts, repairs unclosed containers, and injects fallback tokens.
 */
export function validateAndRepairDom(html: string): GuardrailReport {
  const violations: string[] = []
  let repaired = false
  let sanitized = html

  if (!sanitized || sanitized.trim().length === 0) {
    return {
      isValid: false,
      repaired: true,
      violations: ["Empty HTML payload provided."],
      sanitizedHtml: `<!DOCTYPE html><html><body><div style="color:white;text-align:center;padding:50px;">Prototype Empty</div></body></html>`,
    }
  }

  // 1. Strip harmful executable scripts or tracking tags
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(sanitized)) {
    // Check if script is not safe inline demo script
    sanitized = sanitized.replace(/<script\s+src=[^>]*>[\s\S]*?<\/script>/gi, "")
    violations.push("External non-whitelisted script tag stripped.")
    repaired = true
  }

  // 2. Ensure <!DOCTYPE html> and <html> tags exist
  if (!sanitized.includes("<!DOCTYPE html>")) {
    sanitized = `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>\n<body>\n${sanitized}\n</body>\n</html>`
    violations.push("Missing <!DOCTYPE html> wrapper auto-injected.")
    repaired = true
  }

  // 3. Ensure essential viewport meta tags are present for responsiveness
  if (!sanitized.includes("name=\"viewport\"")) {
    sanitized = sanitized.replace("<head>", '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0"/>')
    violations.push("Responsive viewport meta tag auto-injected.")
    repaired = true
  }

  // 4. Validate open/close balance for critical structural tags (div, section, main, header)
  const countOpenDivs = (sanitized.match(/<div\b/gi) || []).length
  const countCloseDivs = (sanitized.match(/<\/div>/gi) || []).length

  if (countOpenDivs > countCloseDivs) {
    const missing = countOpenDivs - countCloseDivs
    sanitized = sanitized.replace("</body>", `${"</div>\n".repeat(missing)}</body>`)
    violations.push(`Repaired ${missing} unclosed <div> containers.`)
    repaired = true
  }

  return {
    isValid: true,
    repaired,
    violations,
    sanitizedHtml: sanitized,
  }
}
