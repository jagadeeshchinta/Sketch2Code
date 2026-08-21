// ============================================================================
// WhiteboardOS — Client-Side Image Pre-Processor & Auto-Contrast Enhancer
// ============================================================================

export interface ImageProcessingOptions {
  maxDimension?: number
  quality?: number
  boostContrast?: boolean
}

/**
 * Rescales, compresses, and enhances a raw input image or camera capture on an HTML5 canvas.
 * Reduces 4K/15MB smartphone photos to crisp <300KB WebP images and boosts contrast for faint paper sketches.
 */
export async function processAndEnhanceImage(
  dataUrl: string,
  options: ImageProcessingOptions = {}
): Promise<{ enhancedDataUrl: string; width: number; height: number; sizeBytes: number }> {
  const { maxDimension = 1024, quality = 0.85, boostContrast = true } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      let width = img.width
      let height = img.height

      // 1. Calculate downscaled aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        return resolve({
          enhancedDataUrl: dataUrl,
          width: img.width,
          height: img.height,
          sizeBytes: dataUrl.length,
        })
      }

      // Draw downscaled image
      ctx.drawImage(img, 0, 0, width, height)

      // 2. Adaptive Contrast & Stroke Enhancement
      if (boostContrast) {
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data

        // Compute mean brightness
        let totalBrightness = 0
        const totalPixels = width * height
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3
        }
        const meanBrightness = totalBrightness / totalPixels

        // Contrast stretch factor
        const contrastFactor = 1.25

        for (let i = 0; i < data.length; i += 4) {
          // Normalize and stretch RGB
          for (let c = 0; c < 3; c++) {
            let val = data[i + c]
            // Shift towards high contrast
            val = ((val - meanBrightness) * contrastFactor) + meanBrightness
            data[i + c] = Math.min(255, Math.max(0, val))
          }
        }
        ctx.putImageData(imageData, 0, 0)
      }

      // 3. Export as optimized WebP or JPEG
      let enhancedDataUrl = canvas.toDataURL("image/webp", quality)
      if (!enhancedDataUrl.startsWith("data:image/webp")) {
        enhancedDataUrl = canvas.toDataURL("image/jpeg", quality)
      }

      resolve({
        enhancedDataUrl,
        width,
        height,
        sizeBytes: Math.round((enhancedDataUrl.length * 3) / 4),
      })
    }

    img.onerror = () => {
      reject(new Error("Failed to load image for processing"))
    }

    img.src = dataUrl
  })
}

/**
 * Generates an ultra-compact 200px thumbnail for safe localStorage persistence
 */
export async function generateThumbnail(dataUrl: string, maxSize = 200): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      let width = img.width
      let height = img.height

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")

      if (!ctx) return resolve(dataUrl)

      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/jpeg", 0.6))
    }

    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}
